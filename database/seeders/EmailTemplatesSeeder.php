<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmailTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'key' => 'welcome',
                'subject' => 'Bienvenido/a a {{academy_name}}',
                'body' => 'Hola {{first_name}},\n\nTu acceso al portal está listo. Puedes ingresar y ver tus cursos y estado de cuenta.\n',
            ],
            [
                'key' => 'due_soon',
                'subject' => 'Recordatorio: tu cuota vence pronto',
                'body' => 'Hola {{first_name}},\n\nTe recordamos que tienes una cuota próxima a vencer el {{due_date}} por {{amount}}.\n',
            ],
            [
                'key' => 'payment_approved',
                'subject' => 'Pago aprobado',
                'body' => 'Hola {{first_name}},\n\nTu pago fue aprobado por {{amount}} usando {{payment_method}}.\n',
            ],
            [
                'key' => 'overdue_suspension',
                'subject' => 'Acceso suspendido por mora',
                'body' => 'Hola {{first_name}},\n\nTu acceso al aula virtual fue suspendido por mora. Regulariza tu pago para reactivar el acceso.\n',
            ],
        ];

        foreach ($templates as $t) {
            DB::table('email_templates')->updateOrInsert(
                ['key' => $t['key']],
                [
                    'subject' => $t['subject'],
                    'body' => $t['body'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
