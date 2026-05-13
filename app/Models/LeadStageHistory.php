<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadStageHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'from_pipeline_id',
        'to_pipeline_id',
        'from_stage_id',
        'to_stage_id',
        'moved_by',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function movedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moved_by');
    }
}

