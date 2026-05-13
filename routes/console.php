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
    if (in_array($status, ['queued', 'running'], true)) {
        return;
    }

    $intervalHours = $settings->getInt('moodle.sync_interval_hours', 6);
    if ($intervalHours < 1) {
        $intervalHours = 6;
    }

    $last = $settings->getString('moodle.last_sync_at');
    if (! $last) {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        SyncMoodleJob::dispatch();
        return;
    }

    try {
        $lastAt = Carbon::parse($last);
    } catch (\Throwable $e) {
        $lastAt = null;
    }

    if (! $lastAt) {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        SyncMoodleJob::dispatch();
        return;
    }

    if ($lastAt->diffInHours(now()) >= $intervalHours) {
        $settings->setString('moodle', 'moodle.last_sync_status', 'queued');
        SyncMoodleJob::dispatch();
    }
})->everyMinute()->name('moodle:sync-auto');
