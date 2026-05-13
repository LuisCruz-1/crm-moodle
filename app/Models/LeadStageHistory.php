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

    public function fromPipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class, 'from_pipeline_id');
    }

    public function toPipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class, 'to_pipeline_id');
    }

    public function fromStage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'from_stage_id');
    }

    public function toStage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'to_stage_id');
    }

    public function movedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moved_by');
    }
}
