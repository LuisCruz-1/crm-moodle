<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $student = Auth::guard('student')->user();
        
        $enrollments = $student->enrollments()
            ->with(['course'])
            ->get();

        return Inertia::render('Portal/Dashboard', [
            'student' => $student,
            'enrollments' => $enrollments,
        ]);
    }
}
