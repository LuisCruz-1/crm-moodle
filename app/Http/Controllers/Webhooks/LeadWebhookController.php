<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LmsCourse;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) env('LEAD_WEBHOOK_SECRET', '');
        abort_unless($secret !== '', 503);

        $signature = (string) $request->header('X-Webhook-Signature', '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        abort_unless($signature !== '' && hash_equals($expected, $signature), 401);

        $data = $request->validate([
            'pipeline_id' => ['nullable', 'integer', 'exists:pipelines,id'],
            'pipeline_type' => ['nullable', 'string', 'max:50'],
            'stage_id' => ['nullable', 'integer', 'exists:pipeline_stages,id'],
            'course_id' => ['nullable', 'integer', 'exists:lms_courses,id'],
            'course_moodle_id' => ['nullable', 'integer'],
            'cohort_id' => ['nullable', 'integer', 'exists:lms_cohorts,id'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'identity_doc' => ['nullable', 'string', 'max:80'],
            'metadata' => ['nullable', 'array'],
        ]);

        $courseId = $data['course_id'] ?? null;
        if (! $courseId && ! empty($data['course_moodle_id'])) {
            $courseId = LmsCourse::query()
                ->where('moodle_id', $data['course_moodle_id'])
                ->value('id');
        }

        abort_unless((bool) $courseId, 422);

        $pipeline = null;
        if (! empty($data['pipeline_id'])) {
            $pipeline = Pipeline::query()->where('is_active', true)->find($data['pipeline_id']);
        }
        if (! $pipeline && ! empty($data['pipeline_type'])) {
            $pipeline = Pipeline::query()
                ->where('is_active', true)
                ->where('type', $data['pipeline_type'])
                ->orderBy('id')
                ->first();
        }
        if (! $pipeline) {
            $pipeline = Pipeline::query()
                ->where('is_active', true)
                ->orderBy('id')
                ->first();
        }

        abort_unless((bool) $pipeline, 422);

        $stage = null;
        if (! empty($data['stage_id'])) {
            $stage = PipelineStage::query()
                ->where('pipeline_id', $pipeline->id)
                ->find($data['stage_id']);
        }
        if (! $stage) {
            $stage = PipelineStage::query()
                ->where('pipeline_id', $pipeline->id)
                ->where('is_active', true)
                ->orderBy('position')
                ->first();
        }

        abort_unless((bool) $stage, 422);

        $lead = Lead::create([
            'pipeline_id' => $pipeline->id,
            'stage_id' => $stage->id,
            'course_id' => $courseId,
            'cohort_id' => $data['cohort_id'] ?? null,
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'identity_doc' => $data['identity_doc'] ?? null,
            'status' => 'open',
            'metadata' => $data['metadata'] ?? null,
        ]);

        return response()->json([
            'ok' => true,
            'lead_id' => $lead->id,
        ]);
    }
}

