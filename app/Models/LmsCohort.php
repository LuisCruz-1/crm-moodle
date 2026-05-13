<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LmsCohort extends Model
{
    use HasFactory;

    protected $table = 'lms_cohorts';

    protected $fillable = [
        'moodle_id',
        'course_id',
        'name',
    ];

    protected $casts = [
        'moodle_id' => 'integer',
        'course_id' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(LmsCourse::class, 'course_id');
    }
}

