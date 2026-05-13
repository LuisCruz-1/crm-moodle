<?php

namespace App\Support;

use App\Models\CoursePaymentPlan;
use App\Models\Currency;
use App\Models\Enrollment;
use App\Models\Installment;
use Illuminate\Support\Carbon;

class FinanceInstallmentGenerator
{
    public function generateFromPlan(Enrollment $enrollment, CoursePaymentPlan $plan, ?Carbon $startDate = null): array
    {
        $startDate = ($startDate ?? now())->startOfDay();

        $plan->loadMissing(['items.paymentType']);

        $currencyId = (int) Currency::query()->where('is_base', true)->value('id');
        if (! $currencyId) {
            $currencyId = (int) Currency::query()->orderBy('id')->value('id');
        }
        if (! $currencyId) {
            throw new \RuntimeException('No hay moneda configurada en el sistema (currencies).');
        }

        $created = 0;
        $total = 0.0;

        foreach ($plan->items as $item) {
            $quantity = max(1, (int) $item->quantity);
            $unitAmount = (float) $item->unit_amount;
            $frequency = $item->frequency ? strtolower((string) $item->frequency) : null;
            $intervalCount = $item->interval_count ? max(1, (int) $item->interval_count) : 1;

            for ($i = 0; $i < $quantity; $i++) {
                $dueDate = $this->computeDueDate($startDate, $frequency, $intervalCount, $i);

                Installment::query()->create([
                    'student_id' => $enrollment->student_id,
                    'enrollment_id' => $enrollment->id,
                    'currency_id' => $currencyId,
                    'payment_type_id' => $item->payment_type_id,
                    'concept' => $item->paymentType?->name,
                    'amount' => $unitAmount,
                    'balance' => $unitAmount,
                    'due_date' => $dueDate->toDateString(),
                    'status' => 'pending',
                    'metadata' => [
                        'plan_id' => $plan->id,
                        'plan_item_id' => $item->id,
                        'sequence' => $i + 1,
                    ],
                ]);

                $created++;
                $total += $unitAmount;
            }
        }

        return [
            'installments_created' => $created,
            'total' => round($total, 2),
        ];
    }

    private function computeDueDate(Carbon $startDate, ?string $frequency, int $intervalCount, int $index): Carbon
    {
        if (! $frequency) {
            return $startDate->copy();
        }

        if ($frequency === 'monthly') {
            return $startDate->copy()->addMonths($intervalCount * $index);
        }

        if ($frequency === 'weekly') {
            return $startDate->copy()->addWeeks($intervalCount * $index);
        }

        if ($frequency === 'daily') {
            return $startDate->copy()->addDays($intervalCount * $index);
        }

        return $startDate->copy();
    }
}

