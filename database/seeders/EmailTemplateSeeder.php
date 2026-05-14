<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Bienvenida a Nuevo Estudiante',
                'key' => 'welcome_student',
                'subject' => '¡Bienvenido(a) a {app_name}, {student_name}!',
                'body' => '<p>Hola <strong>{student_name}</strong>,</p><p>Tu cuenta ha sido creada con éxito. Ya puedes acceder al portal de alumnos y al aula virtual.</p><p>Email: {student_email}<br>Contraseña: {student_password}</p><p>Accede aquí: <a href="{portal_url}">{portal_url}</a></p>',
            ],
            [
                'name' => 'Recibo de Pago Aprobado',
                'key' => 'payment_receipt',
                'subject' => 'Recibo de Pago - {app_name}',
                'body' => '<p>Hola {student_name},</p><p>Hemos recibido y aprobado tu pago por <strong>{amount}</strong> correspondiente a <strong>{concept}</strong> del curso <strong>{course_name}</strong>.</p><p>¡Gracias por tu pago!</p>',
            ],
            [
                'name' => 'Recordatorio de Vencimiento de Cuota',
                'key' => 'installment_reminder',
                'subject' => 'Aviso de Vencimiento Próximo - {app_name}',
                'body' => '<p>Estimado(a) {student_name},</p><p>Te recordamos que la cuota <strong>{concept}</strong> ({course_name}) por el valor de <strong>{amount}</strong> vence el <strong>{due_date}</strong>.</p><p>Puedes realizar tu pago a través del portal de alumnos.</p>',
            ],
            [
                'name' => 'Notificación de Cuenta Suspendida por Mora',
                'key' => 'account_suspended',
                'subject' => 'Suspensión de Acceso por Mora - {app_name}',
                'body' => '<p>Hola {student_name},</p><p>Lamentamos informarte que tu acceso al aula virtual ha sido suspendido temporalmente debido a cuotas vencidas en tu estado de cuenta.</p><p>Por favor, ingresa al portal de alumnos para regularizar tu situación y recuperar el acceso automáticamente.</p>',
            ]
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
