<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinanceCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('currencies')->updateOrInsert(
            ['code' => 'USD'],
            ['symbol' => '$', 'name' => 'US Dollar', 'is_base' => true, 'updated_at' => now(), 'created_at' => now()]
        );

        $paymentTypes = ['Matrícula', 'Mensualidad', 'Cuota', 'Material'];
        foreach ($paymentTypes as $name) {
            DB::table('payment_types')->updateOrInsert(
                ['name' => $name],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        $methods = [
            ['name' => 'Transferencia Banco', 'type' => 'transfer'],
            ['name' => 'Efectivo', 'type' => 'cash'],
            ['name' => 'Tarjeta', 'type' => 'card'],
            ['name' => 'Stripe', 'type' => 'gateway'],
        ];

        foreach ($methods as $method) {
            DB::table('payment_methods')->updateOrInsert(
                ['name' => $method['name']],
                [
                    'type' => $method['type'],
                    'is_active' => true,
                    'metadata' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
