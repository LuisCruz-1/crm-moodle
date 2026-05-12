<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students');
            $table->foreignId('enrollment_id')->constrained('enrollments');
            $table->foreignId('currency_id')->constrained('currencies');
            $table->foreignId('payment_type_id')->nullable()->constrained('payment_types');
            $table->string('concept')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('balance', 12, 2);
            $table->date('due_date')->index();
            $table->string('status')->default('pending')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('installment_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('installment_id')->constrained('installments');
            $table->string('type')->index();
            $table->decimal('delta_amount', 12, 2);
            $table->longText('reason');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('payment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students');
            $table->foreignId('installment_id')->constrained('installments');
            $table->foreignId('payment_method_id')->constrained('payment_methods');
            $table->string('reference')->nullable()->index();
            $table->string('original_filename')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('file_path');
            $table->string('status')->default('in_review')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->longText('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['installment_id', 'status']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students');
            $table->foreignId('installment_id')->constrained('installments');
            $table->foreignId('payment_method_id')->constrained('payment_methods');
            $table->decimal('amount', 12, 2);
            $table->timestamp('paid_at')->index();
            $table->string('source')->default('submission')->index();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->longText('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_submissions');
        Schema::dropIfExists('installment_adjustments');
        Schema::dropIfExists('installments');
    }
};
