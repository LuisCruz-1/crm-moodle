<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PipelineStageController extends Controller
{
    public function store(Request $request, Pipeline $pipeline): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_won' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        $maxPosition = (int) $pipeline->stages()->max('position');

        $pipeline->stages()->create([
            ...$data,
            'position' => $maxPosition + 1,
        ]);

        return back();
    }

    public function update(Request $request, Pipeline $pipeline, PipelineStage $stage): RedirectResponse
    {
        abort_unless($stage->pipeline_id === $pipeline->id, 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'integer', 'min:0'],
            'is_won' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        $stage->update($data);

        return back();
    }

    public function destroy(Pipeline $pipeline, PipelineStage $stage): RedirectResponse
    {
        abort_unless($stage->pipeline_id === $pipeline->id, 404);

        $stage->delete();

        return back();
    }

    public function reorder(Request $request, Pipeline $pipeline): RedirectResponse
    {
        $data = $request->validate([
            'stage_ids' => ['required', 'array', 'min:1'],
            'stage_ids.*' => ['integer'],
        ]);

        $ids = $pipeline->stages()->pluck('id')->all();
        $incoming = $data['stage_ids'];

        abort_unless(count(array_diff($incoming, $ids)) === 0, 422);
        abort_unless(count(array_diff($ids, $incoming)) === 0, 422);

        foreach ($incoming as $position => $id) {
            PipelineStage::query()
                ->whereKey($id)
                ->update(['position' => $position]);
        }

        return back();
    }
}

