<?php

namespace App\Http\Controllers\Academics;

use App\Http\Controllers\Controller;
use App\Models\CoursePaymentPlan;
use App\Models\LmsCourse;
use App\Models\PaymentType;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = LmsCourse::query()
            ->withCount('cohorts')
            ->orderBy('fullname')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Academics/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function show(LmsCourse $course): Response
    {
        $course->load(['cohorts' => fn ($q) => $q->orderBy('name')]);

        $activePlan = CoursePaymentPlan::query()
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->orderByDesc('version')
            ->first();

        if ($activePlan) {
            $activePlan->load(['items.paymentType']);
        }

        $paymentTypes = PaymentType::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Academics/Courses/Show', [
            'course' => $course,
            'activePlan' => $activePlan,
            'paymentTypes' => $paymentTypes,
        ]);
    }
}
