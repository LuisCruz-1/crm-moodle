<?php

namespace App\Jobs;

use App\Integrations\Moodle\MoodleProvisioningService;
use App\Models\CoursePaymentPlan;
use App\Models\Enrollment;
use App\Models\Installment;
use App\Models\Lead;
use App\Models\LmsCourse;
use App\Models\LmsUser;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\Student;
use App\Models\StudentTimelineEvent;
use App\Support\FinanceInstallmentGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ConvertLeadJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly int $leadId,
        public readonly int $toPipelineId,
        public readonly int $toStageId,
        public readonly ?int $requestedByUserId = null,
    ) {
    }

    public function handle(MoodleProvisioningService $moodle, FinanceInstallmentGenerator $finance): void
    {
        DB::transaction(function () use ($moodle, $finance) {
            $lead = Lead::query()->lockForUpdate()->find($this->leadId);
            if (! $lead) {
                throw (new ModelNotFoundException())->setModel(Lead::class, [$this->leadId]);
            }

            if ($lead->status === 'won') {
                return;
            }

            $toPipeline = Pipeline::query()->findOrFail($this->toPipelineId);
            $toStage = PipelineStage::query()
                ->where('pipeline_id', $toPipeline->id)
                ->findOrFail($this->toStageId);

            if (! $toStage->is_won) {
                throw new \RuntimeException('La etapa destino no está marcada como Ganada.');
            }

            $missing = [];
            if ($lead->student_id) {
                $linked = Student::query()->find($lead->student_id);
                if (! $linked) {
                    throw new \RuntimeException('El estudiante vinculado no existe.');
                }
                if (! $linked->first_name) {
                    $missing[] = 'first_name';
                }
                if (! $linked->last_name) {
                    $missing[] = 'last_name';
                }
                if (! $linked->email || ! filter_var($linked->email, FILTER_VALIDATE_EMAIL)) {
                    $missing[] = 'email';
                }
                if (! $linked->identity_doc) {
                    $missing[] = 'identity_doc';
                }
                if ($missing !== []) {
                    throw new \RuntimeException('Faltan datos obligatorios: '.implode(', ', $missing));
                }
            } else {
                if (! $lead->first_name) {
                    $missing[] = 'first_name';
                }
                if (! $lead->last_name) {
                    $missing[] = 'last_name';
                }
                if (! $lead->email || ! filter_var($lead->email, FILTER_VALIDATE_EMAIL)) {
                    $missing[] = 'email';
                }
                if (! $lead->identity_doc) {
                    $missing[] = 'identity_doc';
                }
                if ($missing !== []) {
                    throw new \RuntimeException('Faltan datos obligatorios: '.implode(', ', $missing));
                }
            }

            $course = LmsCourse::query()->findOrFail($lead->course_id);
            $moodleCourseId = (int) $course->moodle_id;
            if (! $moodleCourseId) {
                throw new \RuntimeException('El curso no tiene moodle_id.');
            }

            $activePlan = CoursePaymentPlan::query()
                ->where('course_id', $course->id)
                ->where('is_active', true)
                ->orderByDesc('version')
                ->first();

            if (! $activePlan) {
                throw new \RuntimeException('El curso no tiene una plantilla de pagos activa.');
            }

            $linkedStudent = (bool) $lead->student_id;
            $student = $lead->student_id ? Student::query()->find($lead->student_id) : null;
            if (! $student) {
                if ($lead->email) {
                    $student = Student::query()
                        ->where('email', $lead->email)
                        ->first();
                }
            }

            if (! $student) {
                $student = Student::query()->create([
                    'first_name' => $lead->first_name,
                    'last_name' => $lead->last_name,
                    'email' => $lead->email,
                    'identity_doc' => $lead->identity_doc,
                    'phone' => $lead->phone,
                ]);
            } else {
                if ($linkedStudent) {
                    if (! $student->first_name || ! $student->last_name || ! $student->email || ! $student->identity_doc) {
                        throw new \RuntimeException('El estudiante vinculado no tiene datos obligatorios (nombres, apellidos, email, DNI).');
                    }
                } else {
                    $student->update([
                        'first_name' => $lead->first_name ?: $student->first_name,
                        'last_name' => $lead->last_name ?: $student->last_name,
                        'identity_doc' => $lead->identity_doc ?: $student->identity_doc,
                        'phone' => $lead->phone ?: $student->phone,
                    ]);
                }
            }

            $lead->student_id = $student->id;

            $lmsUser = $student->lms_user_id ? LmsUser::query()->find($student->lms_user_id) : null;
            if (! $lmsUser) {
                $lmsUser = $moodle->resolveOrCreateUser($student->email, $student->first_name, $student->last_name);
                $student->lms_user_id = $lmsUser->id;
                $student->save();
            }

            $moodleUserId = (int) $lmsUser->moodle_id;
            if (! $moodleUserId) {
                throw new \RuntimeException('El usuario LMS no tiene moodle_id.');
            }

            $moodle->enrolUserInCourse($moodleUserId, $moodleCourseId);

            if ($lead->cohort_id) {
                $cohortMoodleId = (int) DB::table('lms_cohorts')->where('id', $lead->cohort_id)->value('moodle_id');
                if ($cohortMoodleId) {
                    $moodle->addUserToGroup($moodleUserId, $cohortMoodleId);
                }
            }

            $enrollment = Enrollment::query()->updateOrCreate(
                [
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                    'cohort_id' => $lead->cohort_id,
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
                'type' => 'crm_converted',
                'payload' => [
                    'lead_id' => $lead->id,
                    'pipeline_id' => $toPipeline->id,
                    'stage_id' => $toStage->id,
                    'course_id' => $course->id,
                    'cohort_id' => $lead->cohort_id,
                ],
                'created_by' => $this->requestedByUserId,
            ]);

            $lead->pipeline_id = $toPipeline->id;
            $lead->stage_id = $toStage->id;
            $lead->status = 'won';
            $lead->converted_at = now();
            $lead->save();
        });
    }

    public function failed(\Throwable $e): void
    {
        try {
            Lead::query()
                ->where('id', $this->leadId)
                ->update([
                    'status' => 'conversion_failed',
                    'metadata' => DB::raw("JSON_SET(COALESCE(metadata, JSON_OBJECT()), '$.conversion_error', ".DB::getPdo()->quote(mb_substr($e->getMessage(), 0, 500)).")"),
                ]);
        } catch (\Throwable $ignore) {
        }
    }
}
