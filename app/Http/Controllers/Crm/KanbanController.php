<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LmsCourse;
use App\Models\Pipeline;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KanbanController extends Controller
{
    public function index(Request $request): Response
    {
        $pipelines = Pipeline::query()
            ->where('is_active', true)
            ->with(['stages' => fn ($q) => $q->where('is_active', true)->orderBy('position')])
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        $pipelineId = (int) ($request->query('pipeline_id') ?: ($pipelines->first()?->id));
        $courseId = $request->query('course_id');
        $assignedToUserId = $request->query('assigned_to_user_id');

        $pipeline = $pipelineId
            ? Pipeline::query()->with(['stages' => fn ($q) => $q->where('is_active', true)->orderBy('position')])->find($pipelineId)
            : null;

        $leadsQuery = $pipeline
            ? Lead::query()
                ->where('pipeline_id', $pipeline->id)
                ->whereIn('status', ['open', 'converting', 'conversion_failed'])
            : Lead::query()->whereRaw('1=0');

        if ($courseId) {
            $leadsQuery->where('course_id', $courseId);
        }

        if ($assignedToUserId === 'unassigned') {
            $leadsQuery->whereNull('assigned_to_user_id');
        } elseif (! empty($assignedToUserId)) {
            $leadsQuery->where('assigned_to_user_id', $assignedToUserId);
        }

        $leads = $pipeline
            ? $leadsQuery
                ->orderByDesc('updated_at')
                ->get([
                    'id',
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
                    'updated_at',
                ])
            : collect();

        $courses = LmsCourse::query()
            ->orderBy('fullname')
            ->get(['id', 'fullname']);

        $salesUsers = User::query()
            ->role('ventas')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Crm/Kanban/Index', [
            'pipelines' => $pipelines,
            'selectedPipeline' => $pipeline,
            'leads' => $leads,
            'filters' => [
                'pipeline_id' => $pipelineId ?: null,
                'course_id' => $courseId ?: null,
                'assigned_to_user_id' => $assignedToUserId ?: null,
            ],
            'courses' => $courses,
            'salesUsers' => $salesUsers,
        ]);
    }
}
