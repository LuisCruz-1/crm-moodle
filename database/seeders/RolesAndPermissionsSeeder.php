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
            'crm.view' => 'Ver módulo CRM y Kanban de Leads',
            'crm.manage' => 'Gestionar Leads, etapas y notas en el CRM',
            'academics.view' => 'Ver módulo Académico y planes de pago de Cursos',
            'academics.manage' => 'Sincronizar con Moodle y gestionar configuraciones académicas',
            'students.view' => 'Ver módulo de Estudiantes, perfiles e historiales',
            'students.manage' => 'Crear, editar, matricular y gestionar accesos de Estudiantes',
            'finance.view' => 'Ver módulo Financiero, historial de pagos y proyecciones',
            'finance.manage' => 'Aprobar comprobantes, registrar pagos manuales y aplicar descuentos',
            'reports.view' => 'Ver módulo de Reportes Avanzados',
            'reports.export' => 'Descargar reportes comerciales, financieros y académicos (Excel/CSV/PDF)',
            'dashboard.widgets.commercial' => 'Ver widgets comerciales y de ventas en el Dashboard principal',
            'dashboard.widgets.finance' => 'Ver widgets de finanzas, recaudación y morosidad en el Dashboard principal',
            'dashboard.widgets.academic' => 'Ver widgets académicos y de matrículas en el Dashboard principal',
            'settings.manage' => 'Administrar configuraciones del sistema, usuarios, roles y parámetros globales',
        ];

        foreach ($permissions as $name => $description) {
            Permission::updateOrCreate(['name' => $name], ['description' => $description]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'superadmin']);
        $ventas = Role::firstOrCreate(['name' => 'ventas']);
        $finanzas = Role::firstOrCreate(['name' => 'finanzas']);

        $superAdmin->syncPermissions(array_keys($permissions));
        $ventas->syncPermissions(['crm.view', 'crm.manage', 'students.view', 'dashboard.widgets.commercial']);
        $finanzas->syncPermissions(['finance.view', 'finance.manage', 'students.view', 'reports.view', 'reports.export', 'dashboard.widgets.finance']);

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
