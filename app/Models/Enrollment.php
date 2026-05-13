<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'cohort_id',
        'moodle_enrollment_id',
        'moodle_status',
        'enrolled_at',
    ];

    protected $casts = [
        'student_id' => 'integer',
        'course_id' => 'integer',
        'cohort_id' => 'integer',
        'moodle_enrollment_id' => 'integer',
        'moodle_status' => 'integer',
        'enrolled_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(LmsCourse::class, 'course_id');
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(LmsCohort::class, 'cohort_id');
    }
}

