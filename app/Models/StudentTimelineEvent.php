<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentTimelineEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'type',
        'payload',
        'created_by',
    ];

    protected $casts = [
        'student_id' => 'integer',
        'payload' => 'array',
        'created_by' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

