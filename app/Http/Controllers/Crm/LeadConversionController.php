<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Jobs\ConvertLeadJob;
use App\Models\CoursePaymentPlan;
use App\Models\Lead;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeadConversionController extends Controller
{
    public function preview(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'pipeline_id' => ['required', 'integer'],
            'stage_id' => ['required', 'integer'],
        ]);

        $toPipeline = Pipeline::query()->findOrFail($data['pipeline_id']);
        $toStage = PipelineStage::query()
            ->where('pipeline_id', $toPipeline->id)
            ->findOrFail($data['stage_id']);

        abort_unless($toStage->is_won, 422);

        $missing = [];
        if (! $lead->first_name) {
            $missing[] = 'first_name';
        }
        if (! $lead->last_name) {
            $missing[] = 'last_name';
        }
        if (! $lead->email || ! filter_var($lead->email, FILTER_VALIDATE_EMAIL)) {
            $missing[] = 'email';
        }
        if (! $lead->identity_doc) {
            $missing[] = 'identity_doc';
        }

        $course = $lead->course()->first();
        $cohort = $lead->cohort()->first();

        $activePlan = null;
        $total = 0.0;
        if ($course) {
            $activePlan = CoursePaymentPlan::query()
                ->where('course_id', $course->id)
                ->where('is_active', true)
                ->orderByDesc('version')
                ->with(['items.paymentType'])
                ->first();

            if ($activePlan) {
                foreach ($activePlan->items as $item) {
                    $total += ((int) $item->quantity) * ((float) $item->unit_amount);
                }
            }
        }

        return response()->json([
            'ok' => true,
            'missing_fields' => $missing,
            'course' => $course ? ['id' => $course->id, 'fullname' => $course->fullname] : null,
            'cohort' => $cohort ? ['id' => $cohort->id, 'name' => $cohort->name] : null,
            'plan' => $activePlan ? [
                'id' => $activePlan->id,
                'name' => $activePlan->name,
                'version' => $activePlan->version,
                'total' => round($total, 2),
            ] : null,
        ]);
    }

    public function confirm(Request $request, Lead $lead): RedirectResponse
    {
        $data = $request->validate([
            'pipeline_id' => ['required', 'integer'],
            'stage_id' => ['required', 'integer'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'identity_doc' => ['required', 'string', 'max:80'],
        ]);

        $toPipeline = Pipeline::query()->findOrFail($data['pipeline_id']);
        $toStage = PipelineStage::query()
            ->where('pipeline_id', $toPipeline->id)
            ->findOrFail($data['stage_id']);

        abort_unless($toStage->is_won, 422);

        $course = $lead->course()->first();
        $activePlan = $course
            ? CoursePaymentPlan::query()
                ->where('course_id', $course->id)
                ->where('is_active', true)
                ->orderByDesc('version')
                ->first()
            : null;

        if (! $activePlan) {
            abort(422, 'El curso no tiene una plantilla de pagos activa.');
        }

        $lead->update([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'identity_doc' => $data['identity_doc'],
            'status' => 'converting',
            'metadata' => array_merge($lead->metadata ?? [], [
                'conversion_requested_at' => now()->toISOString(),
                'conversion_pipeline_id' => $toPipeline->id,
                'conversion_stage_id' => $toStage->id,
            ]),
        ]);

        ConvertLeadJob::dispatch($lead->id, $toPipeline->id, $toStage->id, $request->user()?->id)
            ->onConnection('redis');

        return back();
    }
}
