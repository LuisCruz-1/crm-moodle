<?php

namespace App\Http\Controllers\Academics;

use App\Http\Controllers\Controller;
use App\Jobs\SyncMoodleJob;
use App\Support\SettingsStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function run(Request $request, SettingsStore $settings): RedirectResponse
    {
        $status = $settings->getString('moodle.last_sync_status');

        if ($status === 'running') {
            return back()->with('error', 'La sincronización ya está en curso.');
        }

        $settings->setString('moodle', 'moodle.last_sync_status', 'queued', $request->user()?->id, false);
        $settings->setString('moodle', 'moodle.last_sync_error', null, $request->user()?->id, false);
        $settings->setString('moodle', 'moodle.last_sync_step', null, $request->user()?->id, false);
        $settings->setString('moodle', 'moodle.last_sync_stats', null, $request->user()?->id, false);
        $settings->setString('moodle', 'moodle.last_sync_requested_at', now()->toISOString(), $request->user()?->id, false);

        try {
            SyncMoodleJob::dispatchSync();
        } catch (\Throwable $e) {
            $settings->setString('moodle', 'moodle.last_sync_status', 'failed', $request->user()?->id, false);
            $settings->setString('moodle', 'moodle.last_sync_error', mb_substr($e->getMessage(), 0, 2000), $request->user()?->id, false);
            $settings->setString('moodle', 'moodle.last_sync_finished_at', now()->toISOString(), $request->user()?->id, false);
            return back()->with('error', 'Error al sincronizar: ' . $e->getMessage());
        }

        return back()->with('success', 'Sincronización completada correctamente.');
    }
}
