<?php

namespace App\Console\Commands;

use App\Models\Installment;
use Illuminate\Console\Command;
use App\Jobs\SendTransactionalEmailJob;

class MarkOverdueInstallments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finance:mark-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark pending installments as overdue if their due date has passed.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $installments = Installment::with(['student', 'enrollment.course'])
            ->where('status', 'pending')
            ->where('due_date', '<', today())
            ->get();

        $count = 0;
        foreach ($installments as $installment) {
            $installment->update(['status' => 'overdue']);
            
            // Send Overdue Reminder
            if ($installment->student && $installment->student->email) {
                SendTransactionalEmailJob::dispatch($installment->student->email, 'installment_reminder', [
                    'student_name' => $installment->student->first_name . ' ' . $installment->student->last_name,
                    'concept' => $installment->name,
                    'course_name' => $installment->enrollment->course->fullname ?? 'N/A',
                    'amount' => number_format($installment->amount, 2),
                    'due_date' => $installment->due_date->format('d/m/Y'),
                ]);
            }
            
            $count++;
        }

        $this->info("Marked {$count} installments as overdue and sent reminders.");
    }
}
