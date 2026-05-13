<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoursePaymentPlanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_id',
        'payment_type_id',
        'quantity',
        'unit_amount',
        'frequency',
        'interval_count',
        'sort_order',
    ];

    protected $casts = [
        'plan_id' => 'integer',
        'payment_type_id' => 'integer',
        'quantity' => 'integer',
        'unit_amount' => 'decimal:2',
        'interval_count' => 'integer',
        'sort_order' => 'integer',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(CoursePaymentPlan::class, 'plan_id');
    }

    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class, 'payment_type_id');
    }
}

