<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'crm.view',
            'crm.manage',
            'academics.view',
            'academics.manage',
            'students.view',
            'students.manage',
            'finance.view',
            'finance.manage',
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'superadmin']);
        $ventas = Role::firstOrCreate(['name' => 'ventas']);
        $finanzas = Role::firstOrCreate(['name' => 'finanzas']);

        $superAdmin->syncPermissions($permissions);
        $ventas->syncPermissions(['crm.view', 'crm.manage', 'students.view']);
        $finanzas->syncPermissions(['finance.view', 'finance.manage', 'students.view']);

        $email = (string) env('SUPERADMIN_EMAIL', 'admin@local.test');
        $name = (string) env('SUPERADMIN_NAME', 'Super Admin');
        $password = (string) env('SUPERADMIN_PASSWORD', 'password');

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
            ]
        );

        if (! $user->hasRole('superadmin')) {
            $user->assignRole('superadmin');
        }
    }
}
