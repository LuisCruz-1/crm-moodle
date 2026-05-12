<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CrmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pipelines = [
            [
                'name' => 'Ventas B2C',
                'type' => 'b2c',
                'stages' => [
                    ['name' => 'Nuevo', 'is_won' => false],
                    ['name' => 'Contactado', 'is_won' => false],
                    ['name' => 'Seguimiento', 'is_won' => false],
                    ['name' => 'Ganado', 'is_won' => true],
                ],
            ],
            [
                'name' => 'Convenios B2B',
                'type' => 'b2b',
                'stages' => [
                    ['name' => 'Nuevo', 'is_won' => false],
                    ['name' => 'Negociación', 'is_won' => false],
                    ['name' => 'Aprobación', 'is_won' => false],
                    ['name' => 'Ganado', 'is_won' => true],
                ],
            ],
        ];

        foreach ($pipelines as $pipeline) {
            $pipelineId = DB::table('pipelines')->updateOrInsert(
                ['name' => $pipeline['name']],
                [
                    'type' => $pipeline['type'],
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $pipelineRow = DB::table('pipelines')->where('name', $pipeline['name'])->first();
            if (! $pipelineRow) {
                continue;
            }

            $position = 0;
            foreach ($pipeline['stages'] as $stage) {
                DB::table('pipeline_stages')->updateOrInsert(
                    ['pipeline_id' => $pipelineRow->id, 'name' => $stage['name']],
                    [
                        'position' => $position,
                        'is_won' => $stage['is_won'],
                        'is_active' => true,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
                $position++;
            }
        }
    }
}
