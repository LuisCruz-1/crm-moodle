<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class BackofficeController extends Controller
{
    private function placeholder(string $title): Response
    {
        return Inertia::render('Placeholder', ['title' => $title]);
    }

    public function dashboard(): Response
    {
        return Inertia::render('Dashboard');
    }

    public function crmPipelines(): Response
    {
        return $this->placeholder('CRM · Pipelines');
    }

    public function crmKanban(): Response
    {
        return $this->placeholder('CRM · Kanban');
    }

    public function crmLeads(): Response
    {
        return $this->placeholder('CRM · Leads');
    }

    public function academicsCourses(): Response
    {
        return $this->placeholder('Académico · Cursos');
    }

    public function academicsSync(): Response
    {
        return $this->placeholder('Académico · Sincronización Moodle');
    }

    public function studentsIndex(): Response
    {
        return $this->placeholder('Estudiantes · Lista');
    }

    public function studentsCreate(): Response
    {
        return $this->placeholder('Estudiantes · Crear');
    }

    public function financeInbox(): Response
    {
        return $this->placeholder('Finanzas · Inbox comprobantes');
    }

    public function financeInstallments(): Response
    {
        return $this->placeholder('Finanzas · Cuotas');
    }

    public function financePaymentMethods(): Response
    {
        return $this->placeholder('Finanzas · Métodos de pago');
    }

    public function financeCurrencies(): Response
    {
        return $this->placeholder('Finanzas · Monedas');
    }

    public function financePaymentTypes(): Response
    {
        return $this->placeholder('Finanzas · Tipos de pago');
    }

    public function commsTemplates(): Response
    {
        return $this->placeholder('Comunicaciones · Plantillas');
    }

    public function commsLogs(): Response
    {
        return $this->placeholder('Comunicaciones · Logs');
    }

    public function settingsMoodle(): Response
    {
        return $this->placeholder('Configuración · Integración Moodle');
    }

    public function settingsParameters(): Response
    {
        return $this->placeholder('Configuración · Parámetros');
    }

    public function adminUsers(): Response
    {
        return $this->placeholder('Admin · Usuarios');
    }
}
