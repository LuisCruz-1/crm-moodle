<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    public function index(): Response
    {
        $pipelines = Pipeline::query()
            ->with(['stages'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Crm/Pipelines/Index', [
            'pipelines' => $pipelines,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ]);

        Pipeline::create($data);

        return back();
    }

    public function update(Request $request, Pipeline $pipeline): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ]);

        $pipeline->update($data);

        return back();
    }

    public function destroy(Pipeline $pipeline): RedirectResponse
    {
        $pipeline->delete();

        return back();
    }
}

