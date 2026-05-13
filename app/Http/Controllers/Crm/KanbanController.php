<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Pipeline;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KanbanController extends Controller
{
    public function index(Request $request): Response
    {
        $pipelines = Pipeline::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        $pipelineId = (int) ($request->query('pipeline_id') ?: ($pipelines->first()?->id));

        $pipeline = $pipelineId
            ? Pipeline::query()->with(['stages' => fn ($q) => $q->where('is_active', true)->orderBy('position')])->find($pipelineId)
            : null;

        $leads = $pipeline
            ? Lead::query()
                ->where('pipeline_id', $pipeline->id)
                ->where('status', 'open')
                ->orderByDesc('updated_at')
                ->get([
                    'id',
                    'pipeline_id',
                    'stage_id',
                    'assigned_to_user_id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone',
                    'status',
                    'updated_at',
                ])
            : collect();

        return Inertia::render('Crm/Kanban/Index', [
            'pipelines' => $pipelines,
            'selectedPipeline' => $pipeline,
            'leads' => $leads,
        ]);
    }
}

