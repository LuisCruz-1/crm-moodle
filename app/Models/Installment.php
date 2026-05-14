<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Installment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'enrollment_id',
        'currency_id',
        'payment_type_id',
        'concept',
        'amount',
        'balance',
        'due_date',
        'status',
        'metadata',
    ];

    protected $casts = [
        'student_id' => 'integer',
        'enrollment_id' => 'integer',
        'currency_id' => 'integer',
        'payment_type_id' => 'integer',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'due_date' => 'date',
        'metadata' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class, 'payment_type_id');
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payment::class);
    }
}

