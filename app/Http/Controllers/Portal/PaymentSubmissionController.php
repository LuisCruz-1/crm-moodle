<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Installment;
use App\Models\PaymentSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PaymentSubmissionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $student = Auth::guard('student')->user();

        $data = $request->validate([
            'installment_id' => ['required', 'integer', 'exists:installments,id'],
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'reference' => ['nullable', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'], // 5MB max
        ]);

        $installment = Installment::where('student_id', $student->id)->findOrFail($data['installment_id']);

        // Check if there is already a submission in review
        $exists = PaymentSubmission::where('installment_id', $installment->id)
            ->where('status', 'in_review')
            ->exists();

        if ($exists) {
            return back()->with('error', 'Ya existe un comprobante en revisión para esta cuota.');
        }

        $file = $request->file('file');
        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
        
        $path = $file->storeAs('receipts', $filename, 'public');

        PaymentSubmission::create([
            'student_id' => $student->id,
            'installment_id' => $installment->id,
            'payment_method_id' => $data['payment_method_id'],
            'reference' => $data['reference'] ?? null,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_path' => $path,
            'status' => 'in_review',
        ]);

        return back()->with('success', 'Comprobante subido exitosamente. Está en proceso de revisión.');
    }
}
