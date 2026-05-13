<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeadMoveController extends Controller
{
    public function __invoke(Request $request, Lead $lead): RedirectResponse
    {
        $data = $request->validate([
            'pipeline_id' => ['required', 'integer'],
            'stage_id' => ['required', 'integer'],
        ]);

        $toPipeline = Pipeline::query()->findOrFail($data['pipeline_id']);
        $toStage = PipelineStage::query()
            ->where('pipeline_id', $toPipeline->id)
            ->findOrFail($data['stage_id']);

        $fromPipelineId = $lead->pipeline_id;
        $fromStageId = $lead->stage_id;

        $lead->update([
            'pipeline_id' => $toPipeline->id,
            'stage_id' => $toStage->id,
        ]);

        $lead->histories()->create([
            'from_pipeline_id' => $fromPipelineId,
            'to_pipeline_id' => $toPipeline->id,
            'from_stage_id' => $fromStageId,
            'to_stage_id' => $toStage->id,
            'moved_by' => $request->user()?->id,
        ]);

        return back();
    }
}

