<?php

namespace Database\Seeders;

use App\Models\LmsCohort;
use App\Models\LmsCourse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LmsSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = DB::table('lms_categories')->updateOrInsert(
            ['moodle_id' => 1],
            [
                'name' => 'Categoría Demo',
                'parent_id' => null,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $categoryPk = DB::table('lms_categories')->where('moodle_id', 1)->value('id');

        $course = LmsCourse::query()->firstOrCreate(
            ['moodle_id' => 1],
            [
                'category_id' => $categoryPk,
                'fullname' => 'Curso Demo',
                'shortname' => 'DEMO-001',
                'visible' => true,
            ]
        );

        LmsCohort::query()->firstOrCreate(
            ['moodle_id' => 1],
            [
                'course_id' => $course->id,
                'name' => 'Cohorte Demo',
            ]
        );
    }
}

