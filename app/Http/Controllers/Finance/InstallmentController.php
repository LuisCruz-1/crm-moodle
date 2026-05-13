<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Installment;
use App\Models\InstallmentAdjustment;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InstallmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Installment::query()
            ->with(['student:id,first_name,last_name,email,identity_doc', 'enrollment.course:id,fullname', 'currency', 'paymentType'])
            ->orderBy('due_date', 'asc');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', ['pending', 'overdue']);
        }

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('identity_doc', 'like', "%{$search}%");
            })->orWhereHas('enrollment.course', function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Finance/Installments/Index', [
            'installments' => $query->paginate(30)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
            'paymentMethods' => \App\Models\PaymentMethod::where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, Installment $installment): RedirectResponse
    {
        $data = $request->validate([
            'due_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        // Recalculate balance if amount changes
        $diff = $data['amount'] - $installment->amount;
        $installment->amount = $data['amount'];
        $installment->balance = max(0, $installment->balance + $diff);
        $installment->due_date = $data['due_date'];
        
        // Update status based on due_date if pending/overdue
        if (in_array($installment->status, ['pending', 'overdue'])) {
            $installment->status = $installment->due_date < today() ? 'overdue' : 'pending';
        }

        $installment->save();

        return back()->with('success', 'Cuota actualizada.');
    }

    public function applyDiscount(Request $request, Installment $installment): RedirectResponse
    {
        $data = $request->validate([
            'discount_amount' => ['required', 'numeric', 'min:0.01', 'max:' . $installment->balance],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($data, $installment, $request) {
            InstallmentAdjustment::create([
                'installment_id' => $installment->id,
                'type' => 'discount',
                'delta_amount' => -$data['discount_amount'],
                'reason' => $data['reason'],
                'created_by' => $request->user()?->id,
            ]);

            $installment->balance -= $data['discount_amount'];
            if ($installment->balance <= 0) {
                $installment->balance = 0;
                $installment->status = 'paid';
            }
            $installment->save();
        });

        return back()->with('success', 'Descuento aplicado correctamente.');
    }

    public function registerPayment(Request $request, Installment $installment): RedirectResponse
    {
        $data = $request->validate([
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:' . $installment->balance],
            'paid_at' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'file' => ['nullable', 'file', 'max:5120'], // 5MB max
            'notes' => ['nullable', 'string'],
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('receipts', 'public');
        }

        DB::transaction(function () use ($data, $installment, $request, $filePath) {
            Payment::create([
                'student_id' => $installment->student_id,
                'installment_id' => $installment->id,
                'payment_method_id' => $data['payment_method_id'],
                'amount' => $data['amount'],
                'paid_at' => $data['paid_at'],
                'reference' => $data['reference'] ?? null,
                'file_path' => $filePath,
                'source' => 'manual',
                'approved_by' => $request->user()?->id,
                'notes' => $data['notes'] ?? null,
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

        return back()->with('success', 'Pago registrado correctamente.');
    }
}
