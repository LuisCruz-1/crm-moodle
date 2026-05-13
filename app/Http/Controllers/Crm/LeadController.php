<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LmsCohort;
use App\Models\LmsCourse;
use App\Models\Pipeline;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('Crm/Leads/Create', [
            'pipelines' => $pipelines,
            'courses' => $courses,
            'cohorts' => $cohorts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'pipeline_id' => ['required', 'integer', 'exists:pipelines,id'],
            'stage_id' => ['required', 'integer', 'exists:pipeline_stages,id'],
            'course_id' => ['required', 'integer', 'exists:lms_courses,id'],
            'cohort_id' => ['nullable', 'integer', 'exists:lms_cohorts,id'],
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
}

