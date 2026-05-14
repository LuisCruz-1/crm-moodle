<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\PaymentMethod;

class InstallmentController extends Controller
{
    public function index(Request $request): Response
    {
        $student = Auth::guard('student')->user();
        
        $installments = $student->installments()
            ->with(['paymentType', 'enrollment.course', 'payments'])
            ->orderBy('due_date', 'asc')
            ->get();

        // Also fetch active submissions to block double uploads
        $activeSubmissions = $student->paymentSubmissions()
            ->where('status', 'in_review')
            ->pluck('installment_id')
            ->toArray();

        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        return Inertia::render('Portal/Installments', [
            'installments' => $installments,
            'paymentMethods' => $paymentMethods,
            'activeSubmissions' => $activeSubmissions,
        ]);
    }
}
