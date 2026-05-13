<?php

namespace App\Console\Commands;

use App\Models\Installment;
use Illuminate\Console\Command;

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
        $count = Installment::query()
            ->where('status', 'pending')
            ->where('due_date', '<', today())
            ->update(['status' => 'overdue']);

        $this->info("Marked {$count} installments as overdue.");
    }
}
