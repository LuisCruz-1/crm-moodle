<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'installment_id',
        'type',
        'delta_amount',
        'reason',
        'created_by',
    ];

    protected $casts = [
        'delta_amount' => 'decimal:2',
    ];

    public function installment()
    {
        return $this->belongsTo(Installment::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
