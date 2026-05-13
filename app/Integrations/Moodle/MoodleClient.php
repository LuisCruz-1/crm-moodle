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
            throw new \RuntimeException('Respuesta inválida de Moodle.');
        }

        if (isset($data['exception']) || isset($data['errorcode'])) {
            $message = (string) ($data['message'] ?? $data['exception'] ?? $data['errorcode'] ?? 'Error Moodle');
            throw new \RuntimeException($message);
        }

        return $data;
    }

    private function request(): PendingRequest
    {
        return Http::timeout(30)->retry(2, 250);
    }
}

