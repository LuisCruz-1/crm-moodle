<?php

namespace App\Console;

use App\Jobs\SyncMoodleJob;
use App\Support\SettingsStore;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Carbon;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function (SettingsStore $settings) {
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
        })->everyMinute();
    }
}

