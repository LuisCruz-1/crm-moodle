<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'is_encrypted',
        'updated_by',
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
        'updated_by' => 'integer',
    ];
}

