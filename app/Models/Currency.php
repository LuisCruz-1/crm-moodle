<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'symbol',
        'name',
        'is_base',
        'exchange_rate',
    ];

    protected $casts = [
        'is_base' => 'boolean',
        'exchange_rate' => 'decimal:6',
    ];
}

