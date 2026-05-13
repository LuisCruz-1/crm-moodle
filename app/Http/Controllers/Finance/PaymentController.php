<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Payment::query()
            ->with([
                'student:id,first_name,last_name,email,identity_doc',
                'installment.enrollment.course:id,fullname',
                'paymentMethod'
            ])
            ->orderByDesc('paid_at');

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('identity_doc', 'like', "%{$search}%");
            });
        }

        if ($courseId = $request->input('course_id')) {
            $query->whereHas('installment.enrollment', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        if ($method = $request->input('payment_method_id')) {
            $query->where('payment_method_id', $method);
        }

        $courses = \App\Models\LmsCourse::query()->orderBy('fullname')->get(['id', 'fullname']);

        return Inertia::render('Finance/Payments/Index', [
            'payments' => $query->paginate(30)->withQueryString(),
            'filters' => $request->only(['search', 'payment_method_id', 'course_id']),
            'paymentMethods' => \App\Models\PaymentMethod::where('is_active', true)->get(),
            'courses' => $courses,
        ]);
    }
}
