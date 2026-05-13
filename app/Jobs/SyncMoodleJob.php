<?php

namespace App\Jobs;

use App\Integrations\Moodle\MoodleClient;
use App\Models\LmsCohort;
use App\Models\LmsCourse;
use App\Models\Setting;
use App\Support\SettingsStore;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SyncMoodleJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public function handle(SettingsStore $settings): void
    {
        $settings->setString('moodle', 'moodle.last_sync_status', 'running');
        $settings->setString('moodle', 'moodle.last_sync_error', null);
        $settings->setString('moodle', 'moodle.last_sync_step', 'init');
        $settings->setString('moodle', 'moodle.last_sync_started_at', now()->toISOString());

        $baseUrl = (string) $settings->getString('moodle.url', '');
        $token = (string) $settings->getString('moodle.token', '');

        if ($baseUrl === '' || $token === '') {
            throw new \RuntimeException('Configura Moodle (URL y Token) antes de sincronizar.');
        }

        $client = new MoodleClient($baseUrl, $token);

        DB::transaction(function () use ($client, $settings) {
            $stats = [
                'categories' => 0,
                'courses' => 0,
                'cohorts' => 0,
                'users' => 0,
            ];

            $settings->setString('moodle', 'moodle.last_sync_step', 'categories');
            $categories = $client->call('core_course_get_categories', [
                'criteria[0][key]' => 'parent',
                'criteria[0][value]' => 0,
            ]);

            if (! isset($categories[0]) || ! is_array($categories)) {
                $categories = $client->call('core_course_get_categories');
            }

            foreach ($categories as $cat) {
                if (! is_array($cat)) {
                    continue;
                }
                DB::table('lms_categories')->updateOrInsert(
                    ['moodle_id' => (int) ($cat['id'] ?? 0)],
                    [
                        'name' => (string) ($cat['name'] ?? ''),
                        'parent_id' => null,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
                $stats['categories']++;
            }

            $categoryIdByMoodle = DB::table('lms_categories')->pluck('id', 'moodle_id');

            $settings->setString('moodle', 'moodle.last_sync_step', 'categories.parents');
            foreach ($categories as $cat) {
                if (! is_array($cat)) {
                    continue;
                }
                $moodleId = (int) ($cat['id'] ?? 0);
                $parentMoodleId = (int) ($cat['parent'] ?? 0);
                $parentId = $parentMoodleId ? ($categoryIdByMoodle[$parentMoodleId] ?? null) : null;

                DB::table('lms_categories')
                    ->where('moodle_id', $moodleId)
                    ->update(['parent_id' => $parentId]);
            }

            $settings->setString('moodle', 'moodle.last_sync_step', 'courses');
            $courses = $client->call('core_course_get_courses');

            foreach ($courses as $course) {
                if (! is_array($course)) {
                    continue;
                }
                $moodleId = (int) ($course['id'] ?? 0);
                $categoryMoodleId = (int) ($course['categoryid'] ?? 0);
                $categoryId = $categoryMoodleId ? ($categoryIdByMoodle[$categoryMoodleId] ?? null) : null;

                LmsCourse::query()->updateOrCreate(
                    ['moodle_id' => $moodleId],
                    [
                        'category_id' => $categoryId,
                        'fullname' => (string) ($course['fullname'] ?? ''),
                        'shortname' => (string) ($course['shortname'] ?? ''),
                        'visible' => (bool) ($course['visible'] ?? true),
                    ]
                );
                $stats['courses']++;
            }

            $limit = $settings->getInt('moodle.sync_courses_limit', 0);
            $coursesQuery = LmsCourse::query()->orderBy('id');
            if ($limit > 0) {
                $coursesQuery->limit($limit);
            }

            $localCourses = $coursesQuery->get(['id', 'moodle_id']);

            $settings->setString('moodle', 'moodle.last_sync_step', 'cohorts.users');
            foreach ($localCourses as $localCourse) {
                $groups = $client->call('core_group_get_course_groups', [
                    'courseid' => $localCourse->moodle_id,
                ]);

                if (is_array($groups)) {
                    foreach ($groups as $group) {
                        if (! is_array($group)) {
                            continue;
                        }
                        $groupId = (int) ($group['id'] ?? 0);
                        if (! $groupId) {
                            continue;
                        }

                        LmsCohort::query()->updateOrCreate(
                            ['moodle_id' => $groupId],
                            [
                                'course_id' => $localCourse->id,
                                'name' => (string) ($group['name'] ?? ''),
                            ]
                        );
                        $stats['cohorts']++;
                    }
                }

                $users = $client->call('core_enrol_get_enrolled_users', [
                    'courseid' => $localCourse->moodle_id,
                ]);

                if (is_array($users)) {
                    foreach ($users as $u) {
                        if (! is_array($u)) {
                            continue;
                        }
                        $userId = (int) ($u['id'] ?? 0);
                        if (! $userId) {
                            continue;
                        }
                        $email = (string) ($u['email'] ?? '');

                        DB::table('lms_users')->updateOrInsert(
                            ['moodle_id' => $userId],
                            [
                                'email' => $email !== '' ? $email : null,
                                'username' => (string) ($u['username'] ?? ''),
                                'first_name' => (string) ($u['firstname'] ?? ''),
                                'last_name' => (string) ($u['lastname'] ?? ''),
                                'updated_at' => now(),
                                'created_at' => now(),
                            ]
                        );
                        $stats['users']++;
                    }
                }
            }

            $settings->setString('moodle', 'moodle.last_sync_stats', json_encode($stats, JSON_THROW_ON_ERROR));
        });

        $settings->setString('moodle', 'moodle.last_sync_step', 'done');
        $settings->setString('moodle', 'moodle.last_sync_status', 'success');
        $settings->setString('moodle', 'moodle.last_sync_finished_at', now()->toISOString());
        $settings->setString('moodle', 'moodle.last_sync_at', now()->toISOString());
    }

    public function failed(\Throwable $e): void
    {
        try {
            $settings = app(SettingsStore::class);
            $settings->setString('moodle', 'moodle.last_sync_status', 'failed');
            $step = (string) $settings->getString('moodle.last_sync_step', '');
            $prefix = $step !== '' ? "[{$step}] " : '';
            $settings->setString('moodle', 'moodle.last_sync_error', mb_substr($prefix.$e->getMessage(), 0, 2000));
            $settings->setString('moodle', 'moodle.last_sync_finished_at', now()->toISOString());
        } catch (\Throwable $ignore) {
        }
    }
}
