<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Installment;
use App\Models\PaymentSubmission;
use App\Models\Enrollment;
use App\Models\LmsCourse;

class BackofficeController extends Controller
{
    private function placeholder(string $title): Response
    {
        return Inertia::render('Placeholder', ['title' => $title]);
    }

    public function dashboard(): Response
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // COMMERCIAL METRICS
        $wonThisMonth = Lead::where('status', 'won')->whereBetween('updated_at', [$startOfMonth, $endOfMonth])->count();
        $totalThisMonth = Lead::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $conversionRate = $totalThisMonth > 0 ? round(($wonThisMonth / $totalThisMonth) * 100, 2) : 0;

        $wonLastMonth = Lead::where('status', 'won')->whereBetween('updated_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $totalLastMonth = Lead::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $lastConversionRate = $totalLastMonth > 0 ? round(($wonLastMonth / $totalLastMonth) * 100, 2) : 0;

        // Pipeline Stages
        $pipelineData = DB::table('leads')
            ->join('pipeline_stages', 'leads.stage_id', '=', 'pipeline_stages.id')
            ->select('pipeline_stages.name', DB::raw('count(leads.id) as value'))
            ->where('leads.status', 'active')
            ->whereNull('leads.deleted_at')
            ->groupBy('pipeline_stages.id', 'pipeline_stages.name', 'pipeline_stages.position')
            ->orderBy('pipeline_stages.position')
            ->get();

        // Top Advisors
        $topAdvisors = DB::table('leads')
            ->join('users', 'leads.assigned_to_user_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(leads.id) as value'))
            ->where('leads.status', 'won')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        // Leads by Source (Not present in DB currently, returning empty for now to avoid crash)
        $leadsBySource = [];

        // FINANCIAL METRICS
        $projectedThisMonth = Installment::whereBetween('due_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])->sum('amount');
        $collectedThisMonth = Payment::whereBetween('paid_at', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])->sum('amount');
        
        $financialProjection = [
            ['name' => 'Proyección', 'value' => (float) $projectedThisMonth],
            ['name' => 'Recaudado', 'value' => (float) $collectedThisMonth],
        ];

        // Overdue Index
        $overdueInstallments = Installment::where('status', 'overdue');
        $overdueAmount = $overdueInstallments->sum('balance');
        $studentsInMora = $overdueInstallments->distinct('student_id')->count('student_id');

        // Payments by Method
        $paymentsByMethod = DB::table('payments')
            ->join('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->select('payment_methods.name', DB::raw('sum(payments.amount) as value'))
            ->whereBetween('payments.paid_at', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->groupBy('payment_methods.id', 'payment_methods.name')
            ->get();

        $inboxAlerts = PaymentSubmission::where('status', 'in_review')->count();

        // ACADEMIC METRICS
        $activeEnrollments = Enrollment::count(); // Assuming all are active for now
        $suspendedStudents = $studentsInMora; // Simplification: overdue students = suspended
        
        $topCourses = DB::table('enrollments')
            ->join('lms_courses', 'enrollments.course_id', '=', 'lms_courses.id')
            ->select('lms_courses.fullname as name', DB::raw('count(enrollments.id) as value'))
            ->groupBy('lms_courses.id', 'lms_courses.fullname')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'commercial' => [
                    'conversionRate' => $conversionRate,
                    'lastConversionRate' => $lastConversionRate,
                    'pipelineData' => $pipelineData,
                    'topAdvisors' => $topAdvisors,
                    'leadsBySource' => $leadsBySource,
                ],
                'financial' => [
                    'financialProjection' => $financialProjection,
                    'overdueAmount' => (float) $overdueAmount,
                    'studentsInMora' => $studentsInMora,
                    'paymentsByMethod' => $paymentsByMethod,
                    'inboxAlerts' => $inboxAlerts,
                ],
                'academic' => [
                    'activeEnrollments' => $activeEnrollments,
                    'suspendedStudents' => $suspendedStudents,
                    'topCourses' => $topCourses,
                ]
            ]
        ]);
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

    public function settingsParameters()
    {
        $parameters = \App\Models\Setting::all();
        return Inertia::render('Settings/Parameters/Index', [
            'parameters' => $parameters
        ]);
    }

    public function updateParameters(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.id' => 'required|exists:settings,id',
            'settings.*.value' => 'nullable|string'
        ]);

        foreach ($data['settings'] as $settingData) {
            \App\Models\Setting::where('id', $settingData['id'])
                ->update([
                    'value' => $settingData['value'],
                    'updated_by' => auth()->id()
                ]);
        }

        return redirect()->back()->with('success', 'Parámetros actualizados correctamente');
    }

    public function adminUsers(): Response
    {
        $users = \App\Models\User::with('roles')->get();
        $roles = \Spatie\Permission\Models\Role::all();

        return Inertia::render('Settings/Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function adminRoles()
    {
        $roles = \Spatie\Permission\Models\Role::with('permissions')->get();
        $permissions = \Spatie\Permission\Models\Permission::all();

        return Inertia::render('Settings/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function storeRole(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = \Spatie\Permission\Models\Role::create(['name' => $data['name']]);
        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return redirect()->back()->with('success', 'Rol creado correctamente');
    }

    public function updateRole(Request $request, \Spatie\Permission\Models\Role $role)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array'
        ]);

        $role->update(['name' => $data['name']]);
        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return redirect()->back()->with('success', 'Rol actualizado correctamente');
    }

    public function destroyRole(\Spatie\Permission\Models\Role $role)
    {
        if ($role->name === 'superadmin') {
            return redirect()->back()->with('error', 'No se puede eliminar el rol superadmin');
        }
        $role->delete();
        return redirect()->back()->with('success', 'Rol eliminado correctamente');
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'array'
        ]);

        $user = \App\Models\User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
        ]);

        if (!empty($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return redirect()->back()->with('success', 'Usuario creado correctamente');
    }

    public function updateUser(Request $request, \App\Models\User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'roles' => 'array'
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        if (!empty($data['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($data['password']);
        }
        $user->save();

        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return redirect()->back()->with('success', 'Usuario actualizado correctamente');
    }

    public function destroyUser(\App\Models\User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'No puedes eliminar tu propio usuario');
        }
        $user->delete();
        return redirect()->back()->with('success', 'Usuario eliminado correctamente');
    }
}
