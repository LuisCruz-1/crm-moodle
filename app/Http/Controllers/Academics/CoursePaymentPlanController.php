<?php

namespace App\Http\Controllers\Academics;

use App\Http\Controllers\Controller;
use App\Models\CoursePaymentPlan;
use App\Models\CoursePaymentPlanItem;
use App\Models\LmsCourse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CoursePaymentPlanController extends Controller
{
    public function store(Request $request, LmsCourse $course): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $nextVersion = (int) (CoursePaymentPlan::query()
            ->where('course_id', $course->id)
            ->max('version') ?? 0) + 1;

        CoursePaymentPlan::query()
            ->where('course_id', $course->id)
            ->update(['is_active' => false]);

        CoursePaymentPlan::query()->create([
            'course_id' => $course->id,
            'name' => $data['name'],
            'version' => $nextVersion,
            'is_active' => true,
        ]);

        return back();
    }

    public function storeItem(Request $request, LmsCourse $course, CoursePaymentPlan $plan): RedirectResponse
    {
        abort_unless($plan->course_id === $course->id, 404);

        $data = $request->validate([
            'payment_type_id' => ['required', 'integer', 'exists:payment_types,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:120'],
            'unit_amount' => ['required', 'numeric', 'min:0.01', 'max:9999999'],
            'frequency' => ['nullable', 'string', 'max:50'],
            'interval_count' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $sortOrder = (int) (CoursePaymentPlanItem::query()
            ->where('plan_id', $plan->id)
            ->max('sort_order') ?? 0) + 1;

        CoursePaymentPlanItem::query()->create([
            'plan_id' => $plan->id,
            'payment_type_id' => $data['payment_type_id'],
            'quantity' => $data['quantity'],
            'unit_amount' => $data['unit_amount'],
            'frequency' => $data['frequency'] ?: null,
            'interval_count' => $data['interval_count'] ?: null,
            'sort_order' => $sortOrder,
        ]);

        return back();
    }

    public function updateItem(Request $request, LmsCourse $course, CoursePaymentPlan $plan, CoursePaymentPlanItem $item): RedirectResponse
    {
        abort_unless($plan->course_id === $course->id, 404);
        abort_unless($item->plan_id === $plan->id, 404);

        $data = $request->validate([
            'payment_type_id' => ['required', 'integer', 'exists:payment_types,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:120'],
            'unit_amount' => ['required', 'numeric', 'min:0.01', 'max:9999999'],
            'frequency' => ['nullable', 'string', 'max:50'],
            'interval_count' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $item->update([
            'payment_type_id' => $data['payment_type_id'],
            'quantity' => $data['quantity'],
            'unit_amount' => $data['unit_amount'],
            'frequency' => $data['frequency'] ?: null,
            'interval_count' => $data['interval_count'] ?: null,
        ]);

        return back();
    }

    public function destroyItem(LmsCourse $course, CoursePaymentPlan $plan, CoursePaymentPlanItem $item): RedirectResponse
    {
        abort_unless($plan->course_id === $course->id, 404);
        abort_unless($item->plan_id === $plan->id, 404);

        $item->delete();

        return back();
    }

    public function reorderItems(Request $request, LmsCourse $course, CoursePaymentPlan $plan): RedirectResponse
    {
        abort_unless($plan->course_id === $course->id, 404);

        $data = $request->validate([
            'item_ids' => ['required', 'array', 'min:1'],
            'item_ids.*' => ['integer'],
        ]);

        $ids = array_values(array_map('intval', $data['item_ids']));
        $existing = CoursePaymentPlanItem::query()
            ->where('plan_id', $plan->id)
            ->pluck('id')
            ->map(fn ($v) => (int) $v)
            ->all();

        sort($existing);
        $sortedIncoming = $ids;
        sort($sortedIncoming);
        abort_unless($existing === $sortedIncoming, 422);

        foreach ($ids as $i => $id) {
            CoursePaymentPlanItem::query()
                ->where('plan_id', $plan->id)
                ->where('id', $id)
                ->update(['sort_order' => $i]);
        }

        return back();
    }
}

