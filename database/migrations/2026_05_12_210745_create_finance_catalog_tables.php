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
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('symbol');
            $table->string('name');
            $table->boolean('is_base')->default(false);
            $table->timestamps();
        });

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('type')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('course_payment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('lms_courses');
            $table->string('name');
            $table->unsignedInteger('version')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('course_payment_plan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('course_payment_plans');
            $table->foreignId('payment_type_id')->constrained('payment_types');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_amount', 12, 2);
            $table->string('frequency')->nullable();
            $table->unsignedInteger('interval_count')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_payment_plan_items');
        Schema::dropIfExists('course_payment_plans');
        Schema::dropIfExists('payment_types');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('currencies');
    }
};
