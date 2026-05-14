<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PaymentSubmission::query()
            ->with(['student:id,first_name,last_name', 'installment.enrollment.course:id,fullname', 'paymentMethod:id,name'])
            ->orderByDesc('id');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        } else {
            $query->where('status', 'in_review');
        }

        return Inertia::render('Finance/Inbox/Index', [
            'submissions' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('status'),
            'paymentMethods' => \App\Models\PaymentMethod::where('is_active', true)->get(),
        ]);
    }

    public function approve(Request $request, PaymentSubmission $submission): RedirectResponse
    {
        $data = $request->validate([
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        DB::transaction(function () use ($data, $submission, $request) {
            $submission->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()?->id,
                'reviewed_at' => now(),
            ]);

            $installment = $submission->installment;

            Payment::create([
                'student_id' => $submission->student_id,
                'installment_id' => $installment->id,
                'payment_method_id' => $data['payment_method_id'],
                'amount' => $data['amount'],
                'paid_at' => $submission->created_at, // Or today?
                'source' => 'submission',
                'approved_by' => $request->user()?->id,
                'reference' => $submission->reference,
                'file_path' => $submission->file_path,
                'notes' => 'Aprobado desde Inbox.',
            ]);

            $installment->balance -= $data['amount'];
            if ($installment->balance <= 0) {
                $installment->balance = 0;
                $installment->status = 'paid';
            } else {
                $installment->status = 'partial';
            }
            $installment->save();
        });

        return back()->with('success', 'Comprobante aprobado y pago registrado.');
    }

    public function reject(Request $request, PaymentSubmission $submission): RedirectResponse
    {
        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $submission->update([
            'status' => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Comprobante rechazado.');
    }
}
