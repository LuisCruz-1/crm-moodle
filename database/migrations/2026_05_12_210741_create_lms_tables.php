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
        Schema::create('lms_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('moodle_id')->unique();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('lms_categories');
            $table->timestamps();
        });

        Schema::create('lms_courses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('moodle_id')->unique();
            $table->foreignId('category_id')->nullable()->constrained('lms_categories');
            $table->string('fullname');
            $table->string('shortname')->nullable()->index();
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });

        Schema::create('lms_cohorts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('moodle_id')->unique();
            $table->foreignId('course_id')->constrained('lms_courses');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('lms_users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('moodle_id')->unique();
            $table->string('email')->nullable()->index();
            $table->string('username')->nullable()->index();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lms_users');
        Schema::dropIfExists('lms_cohorts');
        Schema::dropIfExists('lms_courses');
        Schema::dropIfExists('lms_categories');
    }
};
