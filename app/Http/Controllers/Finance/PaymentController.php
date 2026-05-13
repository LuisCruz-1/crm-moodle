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
            })->orWhereHas('installment.enrollment.course', function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%");
            });
        }

        if ($method = $request->input('payment_method_id')) {
            $query->where('payment_method_id', $method);
        }

        return Inertia::render('Finance/Payments/Index', [
            'payments' => $query->paginate(30)->withQueryString(),
            'filters' => $request->only(['search', 'payment_method_id']),
            'paymentMethods' => \App\Models\PaymentMethod::where('is_active', true)->get(),
        ]);
    }
}
