<?php

use App\Jobs\SyncMoodleJob;
use App\Support\SettingsStore;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function (SettingsStore $settings) {
    $url = (string) $settings->getString('moodle.url', '');
    $token = (string) $settings->getString('moodle.token', '');
    if ($url === '' || $token === '') {
        return;
    }

    $status = (string) $settings->getString('moodle.last_sync_status', '');
    if ($status === 'running') {
        return;
    }

    if ($status === 'queued') {
        $requestedAtRaw = (string) $settings->getString('moodle.last_sync_requested_at', '');
        if ($requestedAtRaw !== '') {
            try {
                $requestedAt = Carbon::parse($requestedAtRaw);
                if ($requestedAt->diffInMinutes(now()) >= 15) {
                    $settings->setString('moodle', 'moodle.last_sync_status', 'failed');
                    $settings->setString('moodle', 'moodle.last_sync_error', 'La sincronización quedó en cola por más de 15 minutos. Verifica que el worker de colas esté corriendo.');
                    $settings->setString('moodle', 'moodle.last_sync_finished_at', now()->toISOString());
                }
            } catch (\Throwable $e) {
            }
        }

        return;
    }

    $intervalHours = $settings->getInt('moodle.sync_interval_hours', 6);
    if ($intervalHours < 1) {
        $intervalHours = 6;
    }

    $last = $settings->getString('moodle.last_sync_at');
    if (! $last) {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        $settings->setString('moodle', 'moodle.last_sync_requested_at', now()->toISOString());
        SyncMoodleJob::dispatch()->onConnection('redis');
        return;
    }

    try {
        $lastAt = Carbon::parse($last);
    } catch (\Throwable $e) {
        $lastAt = null;
    }

    if (! $lastAt) {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        $settings->setString('moodle', 'moodle.last_sync_requested_at', now()->toISOString());
        SyncMoodleJob::dispatch()->onConnection('redis');
        return;
    }

    if ($lastAt->diffInHours(now()) >= $intervalHours) {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        $settings->setString('moodle', 'moodle.last_sync_requested_at', now()->toISOString());
        SyncMoodleJob::dispatch()->onConnection('redis');
    }
})->everyMinute()->name('moodle:sync-auto');
