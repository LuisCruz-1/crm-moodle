<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Integrations\Moodle\MoodleProvisioningService;
use App\Models\CoursePaymentPlan;
use App\Models\Enrollment;
use App\Models\Installment;
use App\Models\LmsCohort;
use App\Models\LmsCourse;
use App\Models\Student;
use App\Models\StudentTimelineEvent;
use App\Support\FinanceInstallmentGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StudentEnrollmentController extends Controller
{
    public function store(Request $request, Student $student, MoodleProvisioningService $moodle, FinanceInstallmentGenerator $finance): RedirectResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:lms_courses,id'],
            'cohort_id' => ['nullable', 'integer', 'exists:lms_cohorts,id'],
        ]);

        $course = LmsCourse::query()->findOrFail($data['course_id']);
        if ($data['cohort_id']) {
            $cohort = LmsCohort::query()->findOrFail($data['cohort_id']);
            abort_unless((int) $cohort->course_id === (int) $course->id, 422, 'Cohorte no pertenece al curso.');
        }

        $activePlan = CoursePaymentPlan::query()
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->orderByDesc('version')
            ->first();

        if (! $activePlan) {
            throw ValidationException::withMessages([
                'general' => 'El curso no tiene una plantilla de pagos activa.',
            ]);
        }

        if (! $student->first_name || ! $student->last_name || ! $student->email || ! $student->identity_doc) {
            throw ValidationException::withMessages([
                'general' => 'El estudiante no tiene todos sus datos obligatorios completos.',
            ]);
        }

        try {
            DB::transaction(function () use ($student, $course, $data, $activePlan, $moodle, $finance, $request) {
                $lmsUser = $student->lms_user_id ? \App\Models\LmsUser::query()->find($student->lms_user_id) : null;
                if (! $lmsUser) {
                    $lmsUser = $moodle->resolveOrCreateUser($student->email, $student->first_name, $student->last_name);
                    $student->lms_user_id = $lmsUser->id;
                    $student->save();
                }

                $moodleUserId = (int) $lmsUser->moodle_id;
                $moodleCourseId = (int) $course->moodle_id;
                
                $moodle->enrolUserInCourse($moodleUserId, $moodleCourseId);

                if (! empty($data['cohort_id'])) {
                    $cohortMoodleId = (int) DB::table('lms_cohorts')->where('id', $data['cohort_id'])->value('moodle_id');
                    if ($cohortMoodleId) {
                        $moodle->addUserToGroup($moodleUserId, $cohortMoodleId);
                    }
                }

                $enrollment = Enrollment::query()->updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'cohort_id' => $data['cohort_id'] ?? null,
                    ],
                    [
                        'enrolled_at' => now(),
                        'moodle_status' => 1,
                    ]
                );

                $hasInstallments = Installment::query()->where('enrollment_id', $enrollment->id)->exists();
                if (! $hasInstallments) {
                    $finance->generateFromPlan($enrollment, $activePlan, now());
                }

                StudentTimelineEvent::query()->create([
                    'student_id' => $student->id,
                    'type' => 'manual_enrollment',
                    'payload' => [
                        'course_id' => $course->id,
                        'cohort_id' => $data['cohort_id'] ?? null,
                    ],
                    'created_by' => $request->user()?->id,
                ]);
            });
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'general' => 'Error al matricular: ' . mb_substr($e->getMessage(), 0, 300),
            ]);
        }

        return back()->with('success', 'Estudiante matriculado exitosamente.');
    }
}
