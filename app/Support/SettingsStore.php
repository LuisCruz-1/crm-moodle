<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;

class SettingsStore
{
    public function getString(string $key, ?string $default = null): ?string
    {
        $setting = Setting::query()->where('key', $key)->first();
        if (! $setting) {
            return $default;
        }

        if (! $setting->is_encrypted) {
            return $setting->value;
        }

        if ($setting->value === null) {
            return $default;
        }

        try {
            return Crypt::decryptString($setting->value);
        } catch (\Throwable $e) {
            return $default;
        }
    }

    public function getInt(string $key, int $default = 0): int
    {
        $value = $this->getString($key);
        if ($value === null || $value === '') {
            return $default;
        }

        return (int) $value;
    }

    public function getBool(string $key, bool $default = false): bool
    {
        $value = $this->getString($key);
        if ($value === null || $value === '') {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOL);
    }

    public function setString(string $group, string $key, ?string $value, int|string|null $updatedBy = null, bool $encrypted = false): void
    {
        $payload = [
            'group' => $group,
            'is_encrypted' => $encrypted,
            'updated_by' => $updatedBy,
        ];

        if ($encrypted) {
            $payload['value'] = $value === null || $value === '' ? null : Crypt::encryptString($value);
        } else {
            $payload['value'] = $value;
        }

        Setting::query()->updateOrCreate(['key' => $key], $payload);
    }
}

