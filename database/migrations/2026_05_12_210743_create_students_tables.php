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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lms_user_id')->nullable()->constrained('lms_users');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('identity_doc')->unique();
            $table->string('phone')->nullable()->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students');
            $table->foreignId('course_id')->constrained('lms_courses');
            $table->foreignId('cohort_id')->nullable()->constrained('lms_cohorts');
            $table->unsignedBigInteger('moodle_enrollment_id')->nullable()->index();
            $table->unsignedTinyInteger('moodle_status')->default(0)->index();
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('student_timeline_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students');
            $table->string('type')->index();
            $table->json('payload')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_timeline_events');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('students');
    }
};
