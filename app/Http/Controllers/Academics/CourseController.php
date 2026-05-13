<?php

namespace App\Http\Controllers\Academics;

use App\Http\Controllers\Controller;
use App\Models\LmsCourse;
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
}

