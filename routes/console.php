<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Setting;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

try {
    $syncInterval = Setting::where('key', 'moodle.sync_interval_hours')->value('value') ?? 6;
    $markOverdueTime = Setting::where('key', 'finance.mark_overdue_time')->value('value') ?? '00:05';

    if ($syncInterval > 0) {
        Schedule::command('moodle:sync-auto')->cron("0 */{$syncInterval} * * *")->withoutOverlapping();
    }

    Schedule::command('finance:mark-overdue')->dailyAt($markOverdueTime)->withoutOverlapping();
} catch (\Throwable $e) {
    Schedule::command('moodle:sync-auto')->everySixHours()->withoutOverlapping();
    Schedule::command('finance:mark-overdue')->dailyAt('00:05')->withoutOverlapping();
}
