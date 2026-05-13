<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'pipeline_id',
        'stage_id',
        'assigned_to_user_id',
        'course_id',
        'cohort_id',
        'student_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'identity_doc',
        'status',
        'converted_at',
        'metadata',
    ];

    protected $casts = [
        'converted_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(LmsCourse::class, 'course_id');
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(LmsCohort::class, 'cohort_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(LeadStageHistory::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class);
    }
}
