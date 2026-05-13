<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Jobs\ConvertLeadJob;
use App\Models\CoursePaymentPlan;
use App\Models\Lead;
use App\Models\LmsCohort;
use App\Models\LmsCourse;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(): Response
    {
        $leads = Lead::query()
            ->with(['pipeline:id,name', 'stage:id,name', 'course:id,fullname', 'cohort:id,name'])
            ->orderByDesc('updated_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Crm/Leads/Index', [
            'leads' => $leads,
        ]);
    }

    public function create(): Response
    {
        $pipelines = Pipeline::query()
            ->where('is_active', true)
            ->with(['stages' => fn ($q) => $q->where('is_active', true)->orderBy('position')])
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        $courses = LmsCourse::query()
            ->orderBy('fullname')
            ->get(['id', 'fullname']);

        $cohorts = LmsCohort::query()
            ->orderBy('name')
            ->get(['id', 'course_id', 'name']);

        $salesUsers = User::query()
            ->role('ventas')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Crm/Leads/Create', [
            'pipelines' => $pipelines,
            'courses' => $courses,
            'cohorts' => $cohorts,
            'salesUsers' => $salesUsers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'pipeline_id' => ['required', 'integer', 'exists:pipelines,id'],
            'stage_id' => ['required', 'integer', 'exists:pipeline_stages,id'],
            'course_id' => ['required', 'integer', 'exists:lms_courses,id'],
            'cohort_id' => ['nullable', 'integer', 'exists:lms_cohorts,id'],
            'assigned_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'identity_doc' => ['nullable', 'string', 'max:80'],
        ]);

        $pipeline = Pipeline::query()->with('stages')->findOrFail($data['pipeline_id']);
        abort_unless($pipeline->stages->contains('id', (int) $data['stage_id']), 422);

        if (! empty($data['cohort_id'])) {
            $cohort = LmsCohort::query()->findOrFail($data['cohort_id']);
            abort_unless((int) $cohort->course_id === (int) $data['course_id'], 422);
        }

        Lead::create([
            ...$data,
            'status' => 'open',
        ]);

        return redirect()->route('crm.kanban.index', ['pipeline_id' => $data['pipeline_id']]);
    }

    public function show(Lead $lead): Response
    {
        $lead->load([
            'pipeline',
            'stage',
            'course',
            'cohort',
            'student:id,first_name,last_name,email,identity_doc',
            'assignedTo:id,name,email',
            'notes.createdBy:id,name',
            'histories' => fn ($q) => $q->with([
                'fromPipeline:id,name',
                'toPipeline:id,name',
                'fromStage:id,name',
                'toStage:id,name',
                'movedBy:id,name',
            ])->orderByDesc('id'),
        ]);

        $pipelines = Pipeline::query()
            ->where('is_active', true)
            ->with(['stages' => fn ($q) => $q->where('is_active', true)->orderBy('position')])
            ->orderBy('name')
            ->get(['id', 'name', 'type']);

        $courses = LmsCourse::query()
            ->orderBy('fullname')
            ->get(['id', 'fullname']);

        $cohorts = LmsCohort::query()
            ->orderBy('name')
            ->get(['id', 'course_id', 'name']);

        $salesUsers = User::query()
            ->role('ventas')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Crm/Leads/Show', [
            'lead' => $lead,
            'pipelines' => $pipelines,
            'courses' => $courses,
            'cohorts' => $cohorts,
            'salesUsers' => $salesUsers,
        ]);
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $data = $request->validate([
            'pipeline_id' => ['required', 'integer', 'exists:pipelines,id'],
            'stage_id' => ['required', 'integer', 'exists:pipeline_stages,id'],
            'course_id' => ['required', 'integer', 'exists:lms_courses,id'],
            'cohort_id' => ['nullable', 'integer', 'exists:lms_cohorts,id'],
            'assigned_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'identity_doc' => ['nullable', 'string', 'max:80'],
        ]);

        $pipeline = Pipeline::query()->with('stages')->findOrFail($data['pipeline_id']);
        abort_unless($pipeline->stages->contains('id', (int) $data['stage_id']), 422);

        if (! empty($data['cohort_id'])) {
            $cohort = LmsCohort::query()->findOrFail($data['cohort_id']);
            abort_unless((int) $cohort->course_id === (int) $data['course_id'], 422);
        }

        $toStage = PipelineStage::query()
            ->where('pipeline_id', $pipeline->id)
            ->findOrFail($data['stage_id']);

        if ($toStage->is_won) {
            $missing = [];
            if (empty($data['first_name'])) {
                $missing['first_name'] = 'Nombres es obligatorio para convertir.';
            }
            if (empty($data['last_name'])) {
                $missing['last_name'] = 'Apellidos es obligatorio para convertir.';
            }
            if (empty($data['email'])) {
                $missing['email'] = 'Email es obligatorio para convertir.';
            }
            if (empty($data['identity_doc'])) {
                $missing['identity_doc'] = 'Documento (DNI) es obligatorio para convertir.';
            }
            if ($missing !== []) {
                throw ValidationException::withMessages($missing);
            }

            $activePlan = CoursePaymentPlan::query()
                ->where('course_id', (int) $data['course_id'])
                ->where('is_active', true)
                ->orderByDesc('version')
                ->first();

            if (! $activePlan) {
                throw ValidationException::withMessages([
                    'general' => 'El curso no tiene una plantilla de pagos activa.',
                ]);
            }

            $lead->update([
                ...$data,
                'status' => 'converting',
                'metadata' => array_merge($lead->metadata ?? [], [
                    'conversion_requested_at' => now()->toISOString(),
                    'conversion_pipeline_id' => $pipeline->id,
                    'conversion_stage_id' => $toStage->id,
                ]),
            ]);

            try {
                ConvertLeadJob::dispatchSync($lead->id, $pipeline->id, $toStage->id, $request->user()?->id);
            } catch (\Throwable $e) {
                $lead->refresh();
                $lead->update([
                    'status' => 'conversion_failed',
                    'metadata' => array_merge($lead->metadata ?? [], [
                        'conversion_error' => mb_substr($e->getMessage(), 0, 500),
                    ]),
                ]);

                throw ValidationException::withMessages([
                    'general' => mb_substr($e->getMessage(), 0, 2000),
                ]);
            }

            return back();
        }

        $lead->update($data);

        return back();
    }
}
