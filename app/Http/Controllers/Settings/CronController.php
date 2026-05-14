<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;

class CronController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Crons/Index', [
            'crons' => [
                'moodle_sync_interval' => Setting::where('key', 'moodle.sync_interval_hours')->value('value') ?? '6',
                'finance_mark_overdue_time' => Setting::where('key', 'finance.mark_overdue_time')->value('value') ?? '00:05',
            ]
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'moodle_sync_interval' => 'required|integer|min:1|max:72',
            'finance_mark_overdue_time' => 'required|date_format:H:i',
        ]);

        Setting::updateOrCreate(['key' => 'moodle.sync_interval_hours'], ['value' => $request->moodle_sync_interval, 'group' => 'moodle']);
        Setting::updateOrCreate(['key' => 'finance.mark_overdue_time'], ['value' => $request->finance_mark_overdue_time, 'group' => 'finance']);

        return back()->with('success', 'Configuración de tareas programadas (Crons) actualizada correctamente.');
    }
}
