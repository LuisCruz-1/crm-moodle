<?php

namespace App\Integrations\Moodle;

use App\Models\LmsUser;
use App\Support\SettingsStore;
use Illuminate\Support\Str;

class MoodleProvisioningService
{
    public function __construct(
        private readonly SettingsStore $settings,
    ) {
    }

    public function resolveOrCreateUser(string $email, string $firstName, string $lastName): LmsUser
    {
        $client = $this->client();

        $existing = $client->call('core_user_get_users_by_field', [
            'field' => 'email',
            'values[0]' => $email,
        ]);

        if (is_array($existing) && isset($existing[0]) && is_array($existing[0])) {
            $moodleId = (int) ($existing[0]['id'] ?? 0);
            $username = (string) ($existing[0]['username'] ?? '');
            $fn = (string) ($existing[0]['firstname'] ?? $firstName);
            $ln = (string) ($existing[0]['lastname'] ?? $lastName);

            return LmsUser::query()->updateOrCreate(
                ['moodle_id' => $moodleId],
                [
                    'email' => $email,
                    'username' => $username !== '' ? $username : null,
                    'first_name' => $fn !== '' ? $fn : null,
                    'last_name' => $ln !== '' ? $ln : null,
                ]
            );
        }

        $username = $this->usernameFromEmail($email);
        $password = Str::password(16);

        $created = $client->call('core_user_create_users', [
            'users[0][username]' => $username,
            'users[0][password]' => $password,
            'users[0][firstname]' => $firstName,
            'users[0][lastname]' => $lastName,
            'users[0][email]' => $email,
            'users[0][auth]' => 'manual',
        ]);

        if (! is_array($created) || ! isset($created[0]) || ! is_array($created[0])) {
            throw new \RuntimeException('Moodle core_user_create_users: Respuesta inválida.');
        }

        $moodleId = (int) ($created[0]['id'] ?? 0);
        if (! $moodleId) {
            throw new \RuntimeException('Moodle core_user_create_users: No devolvió ID de usuario.');
        }

        return LmsUser::query()->updateOrCreate(
            ['moodle_id' => $moodleId],
            [
                'email' => $email,
                'username' => $username,
                'first_name' => $firstName,
                'last_name' => $lastName,
            ]
        );
    }

    public function enrolUserInCourse(int $moodleUserId, int $moodleCourseId): void
    {
        $roleId = $this->settings->getInt('moodle.student_role_id', 5);
        if ($roleId < 1) {
            $roleId = 5;
        }

        $this->client()->call('enrol_manual_enrol_users', [
            'enrolments[0][roleid]' => $roleId,
            'enrolments[0][userid]' => $moodleUserId,
            'enrolments[0][courseid]' => $moodleCourseId,
        ]);
    }

    public function addUserToGroup(int $moodleUserId, int $moodleGroupId): void
    {
        $this->client()->call('core_group_add_group_members', [
            'members[0][groupid]' => $moodleGroupId,
            'members[0][userid]' => $moodleUserId,
        ]);
    }

    private function client(): MoodleClient
    {
        $baseUrl = (string) $this->settings->getString('moodle.url', '');
        $token = (string) $this->settings->getString('moodle.token', '');

        if ($baseUrl === '' || $token === '') {
            throw new \RuntimeException('Configura Moodle (URL y Token) antes de operar.');
        }

        return new MoodleClient($baseUrl, $token);
    }

    private function usernameFromEmail(string $email): string
    {
        $base = trim(strtolower(strtok($email, '@') ?: 'user'));
        $base = preg_replace('/[^a-z0-9_\\.\\-]/', '', $base) ?: 'user';
        $suffix = substr(md5($email), 0, 6);

        return mb_substr($base, 0, 20).$suffix;
    }
}

