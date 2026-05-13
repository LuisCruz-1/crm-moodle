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

        $data = $response->json();

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
