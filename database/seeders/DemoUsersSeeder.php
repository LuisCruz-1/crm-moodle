<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $password = (string) env('DEMO_USERS_PASSWORD', 'ChangeMe123!');

        Role::firstOrCreate(['name' => 'ventas']);
        Role::firstOrCreate(['name' => 'finanzas']);

        $ventas1 = User::query()->firstOrCreate(
            ['email' => 'ventas1@demo.local'],
            [
                'name' => 'Ventas 1',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );
        $ventas1->syncRoles(['ventas']);

        $ventas2 = User::query()->firstOrCreate(
            ['email' => 'ventas2@demo.local'],
            [
                'name' => 'Ventas 2',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );
        $ventas2->syncRoles(['ventas']);

        $finanzas = User::query()->firstOrCreate(
            ['email' => 'finanzas@demo.local'],
            [
                'name' => 'Finanzas',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );
        $finanzas->syncRoles(['finanzas']);
    }
}
