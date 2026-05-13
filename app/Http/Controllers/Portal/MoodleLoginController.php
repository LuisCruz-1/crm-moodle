<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\LmsCourse;
use App\Support\SettingsStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MoodleLoginController extends Controller
{
    public function redirect(Request $request, LmsCourse $course, SettingsStore $settings)
    {
        $student = Auth::guard('student')->user();

        // Check if student is enrolled in this course
        $enrollment = $student->enrollments()->where('course_id', $course->id)->firstOrFail();

        // Check for overdue installments in THIS course specifically (or any course, depending on rules)
        // Based on prompt: "Si hay mora, el botón se bloquea y advierte la deuda."
        $hasOverdue = $student->installments()
            ->where('status', 'overdue')
            ->exists();

        if ($hasOverdue) {
            return back()->with('error', 'No puedes acceder al Aula Virtual porque tienes cuotas vencidas. Por favor, regulariza tu estado de cuenta.');
        }

        // Logic to auto-login to Moodle
        $lmsUser = $student->lmsUser;
        if (!$lmsUser) {
            return back()->with('error', 'Tu cuenta no está vinculada al Aula Virtual.');
        }

        $moodleUrl = rtrim((string) $settings->getString('moodle.url', ''), '/');
        
        // This is a placeholder for actual SSO implementation
        // Usually, Moodle requires a specific auth plugin like auth_userkey or oauth2
        // Since we don't have a fully configured SSO plugin in Moodle in this prompt,
        // we'll redirect to the course page directly. The user might need to log in manually if SSO isn't set up.
        
        // For a true Bridge, you'd generate a token if using auth_userkey or similar.
        // Assuming we just redirect to the course URL for now:
        $courseUrl = $moodleUrl . '/course/view.php?id=' . $course->moodle_id;

        return redirect()->away($courseUrl);
    }
}
