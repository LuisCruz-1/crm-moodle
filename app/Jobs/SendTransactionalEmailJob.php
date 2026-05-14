<?php

namespace App\Jobs;

use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Mail\DynamicTemplateMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTransactionalEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $toEmail;
    protected $templateKey;
    protected $data;

    /**
     * Create a new job instance.
     */
    public function __construct(string $toEmail, string $templateKey, array $data = [])
    {
        $this->toEmail = $toEmail;
        $this->templateKey = $templateKey;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $template = EmailTemplate::where('key', $this->templateKey)->first();

        if (!$template || !$template->is_active) {
            // Template doesn't exist or is disabled by admin, we don't send anything.
            return;
        }

        // Always inject global variables like app_name
        $appName = Setting::where('key', 'app_name')->value('value') ?? config('app.name');
        $this->data['app_name'] = $appName;

        $subject = $this->replaceVariables($template->subject, $this->data);
        $body = $this->replaceVariables($template->body, $this->data);

        $logId = \Illuminate\Support\Facades\DB::table('notification_logs')->insertGetId([
            'channel' => 'email',
            'to' => $this->toEmail,
            'template_key' => $this->templateKey,
            'status' => 'queued',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try {
            Mail::to($this->toEmail)->send(new DynamicTemplateMail($subject, $body));
            
            \Illuminate\Support\Facades\DB::table('notification_logs')
                ->where('id', $logId)
                ->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'updated_at' => now(),
                ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::table('notification_logs')
                ->where('id', $logId)
                ->update([
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                    'updated_at' => now(),
                ]);
            throw $e;
        }
    }

    /**
     * Replace {variable_name} with actual values from data array.
     */
    protected function replaceVariables(string $text, array $data): string
    {
        foreach ($data as $key => $value) {
            $text = str_replace('{' . $key . '}', $value, $text);
        }
        return $text;
    }
}
