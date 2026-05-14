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

        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        $settings->setString('moodle', 'moodle.last_sync_requested_at', now()->toISOString());
        $settings->setString('moodle', 'moodle.last_sync_error', '');

        SyncMoodleJob::dispatch()->onConnection('redis');

        return back()->with('success', 'Sincronización encolada correctamente. Puede tardar unos minutos en reflejarse.');
    }
}
