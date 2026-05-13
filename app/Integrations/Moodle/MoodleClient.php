<?php

namespace App\Integrations\Moodle;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class MoodleClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $token,
    ) {
    }

    public function call(string $function, array $params = []): array
    {
        $url = rtrim($this->baseUrl, '/').'/webservice/rest/server.php';

        $payload = array_merge($params, [
            'wstoken' => $this->token,
            'wsfunction' => $function,
            'moodlewsrestformat' => 'json',
        ]);

        $response = $this->request()
            ->asForm()
            ->post($url, $payload);

        $body = (string) $response->body();
        $data = $response->json();
        $trimmed = trim($body);

        if (! $response->successful()) {
            throw new \RuntimeException("Moodle {$function}: HTTP {$response->status()}.");
        }

        if ($data === null && ($trimmed === '' || $trimmed === 'null')) {
            return [];
        }

        if ($data === true || $data === false) {
            return [];
        }

        if (! is_array($data) && in_array($trimmed, ['0', '1', 'true', 'false'], true)) {
            return [];
        }

        if ($data === null && $trimmed !== '' && str_starts_with($trimmed, '<')) {
            throw new \RuntimeException("Moodle {$function}: Respuesta inválida.");
        }

        if (! is_array($data)) {
            throw new \RuntimeException("Moodle {$function}: Respuesta inválida.");
        }

        if (isset($data['exception']) || isset($data['errorcode'])) {
            $errorCode = (string) ($data['errorcode'] ?? $data['exception'] ?? 'Error');
            $message = (string) ($data['message'] ?? 'Error Moodle');
            $debug = (string) ($data['debuginfo'] ?? '');
            $extra = $debug !== '' ? " | {$debug}" : '';

            throw new \RuntimeException("Moodle {$function}: {$errorCode} - {$message}{$extra}");
        }

        return $data;
    }

    private function request(): PendingRequest
    {
        return Http::timeout(30)->retry(2, 250);
    }
}
