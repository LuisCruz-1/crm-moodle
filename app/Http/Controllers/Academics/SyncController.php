<?php

namespace App\Http\Controllers\Academics;

use App\Http\Controllers\Controller;
use App\Jobs\SyncMoodleJob;
use App\Support\SettingsStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SyncController extends Controller
{
    public function index(SettingsStore $settings): Response
    {
        return Inertia::render('Academics/Sync/Index', [
            'sync' => [
                'status' => $settings->getString('moodle.last_sync_status'),
                'step' => $settings->getString('moodle.last_sync_step'),
                'error' => $settings->getString('moodle.last_sync_error'),
                'stats' => $settings->getString('moodle.last_sync_stats'),
                'started_at' => $settings->getString('moodle.last_sync_started_at'),
                'finished_at' => $settings->getString('moodle.last_sync_finished_at'),
                'last_sync_at' => $settings->getString('moodle.last_sync_at'),
            ],
        ]);
    }

    public function run(Request $request, SettingsStore $settings): RedirectResponse
    {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued', $request->user()?->id, false);
        $settings->setString('moodle', 'moodle.last_sync_error', null, $request->user()?->id, false);
        $settings->setString('moodle', 'moodle.last_sync_requested_at', now()->toISOString(), $request->user()?->id, false);

        SyncMoodleJob::dispatch();

        return back();
    }
}
