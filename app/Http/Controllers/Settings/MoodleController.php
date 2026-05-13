<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\SettingsStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MoodleController extends Controller
{
    public function index(SettingsStore $settings): Response
    {
        $url = $settings->getString('moodle.url');
        $hasToken = (bool) $settings->getString('moodle.token');
        $clientId = $settings->getString('moodle.sso_client_id');
        $hasClientSecret = (bool) $settings->getString('moodle.sso_client_secret');

        return Inertia::render('Settings/Moodle/Index', [
            'config' => [
                'url' => $url,
                'has_token' => $hasToken,
                'sso_client_id' => $clientId,
                'has_sso_client_secret' => $hasClientSecret,
                'sync_interval_hours' => $settings->getInt('moodle.sync_interval_hours', 6),
                'sync_courses_limit' => $settings->getInt('moodle.sync_courses_limit', 0),
            ],
            'sync' => [
                'status' => $settings->getString('moodle.last_sync_status'),
                'step' => $settings->getString('moodle.last_sync_step'),
                'error' => $settings->getString('moodle.last_sync_error'),
                'stats' => $settings->getString('moodle.last_sync_stats'),
                'requested_at' => $settings->getString('moodle.last_sync_requested_at'),
                'started_at' => $settings->getString('moodle.last_sync_started_at'),
                'finished_at' => $settings->getString('moodle.last_sync_finished_at'),
                'last_sync_at' => $settings->getString('moodle.last_sync_at'),
            ],
        ]);
    }

    public function update(Request $request, SettingsStore $settings): RedirectResponse
    {
        $data = $request->validate([
            'url' => ['required', 'url', 'max:255'],
            'token' => ['nullable', 'string', 'max:2000'],
            'sso_client_id' => ['nullable', 'string', 'max:255'],
            'sso_client_secret' => ['nullable', 'string', 'max:2000'],
            'sync_interval_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'sync_courses_limit' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);

        $userId = $request->user()?->id;

        $settings->setString('moodle', 'moodle.url', $data['url'], $userId, false);
        $settings->setString('moodle', 'moodle.sync_interval_hours', (string) $data['sync_interval_hours'], $userId, false);
        $settings->setString('moodle', 'moodle.sync_courses_limit', (string) $data['sync_courses_limit'], $userId, false);

        if (! empty($data['token'])) {
            $settings->setString('moodle', 'moodle.token', $data['token'], $userId, true);
        }

        if (array_key_exists('sso_client_id', $data)) {
            $settings->setString('moodle', 'moodle.sso_client_id', $data['sso_client_id'] ?: null, $userId, false);
        }

        if (! empty($data['sso_client_secret'])) {
            $settings->setString('moodle', 'moodle.sso_client_secret', $data['sso_client_secret'], $userId, true);
        }

        return back();
    }
}
