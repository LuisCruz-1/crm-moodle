<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Integrations\Moodle\MoodleProvisioningService;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Student::query()
            ->withCount(['enrollments', 'installments as pending_installments_count' => function ($q) {
                $q->where('status', 'pending')->orWhere('status', 'overdue');
            }])
            ->orderByDesc('id');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('identity_doc', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Students/Index', [
            'students' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Students/Create');
    }

    public function store(Request $request, MoodleProvisioningService $moodle): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:students,email'],
            'identity_doc' => ['required', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $student = Student::create($data);

        try {
            $lmsUser = $moodle->resolveOrCreateUser($student->email, $student->first_name, $student->last_name);
            $student->update(['lms_user_id' => $lmsUser->id]);
        } catch (\Throwable $e) {
            // Moodle failure should not prevent local student creation, but we might want to alert
            // For now we just log or let it fail, but we already created local student.
            // If it fails, they won't have lms_user_id. We'll throw an error with back() to show it.
            return redirect()->route('students.show', $student->id)
                ->with('error', 'Estudiante creado localmente, pero falló Moodle: ' . mb_substr($e->getMessage(), 0, 200));
        }

        return redirect()->route('students.show', $student->id)->with('success', 'Estudiante creado exitosamente.');
    }

    public function show(Student $student): Response
    {
        $student->load([
            'enrollments.course',
            'enrollments.cohort',
            'timelineEvents.createdBy:id,name',
            'payments.paymentMethod',
            'payments.installment.enrollment.course',
            'installments' => function ($q) {
                $q->orderBy('due_date')->with(['paymentType', 'enrollment.course']);
            }
        ]);

        $courses = \App\Models\LmsCourse::query()->orderBy('fullname')->get(['id', 'fullname']);
        $cohorts = \App\Models\LmsCohort::query()->orderBy('name')->get(['id', 'course_id', 'name']);

        return Inertia::render('Students/Show', [
            'student' => $student,
            'courses' => $courses,
            'cohorts' => $cohorts,
        ]);
    }

    public function edit(Student $student): Response
    {
        return Inertia::render('Students/Edit', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:students,email,' . $student->id],
            'identity_doc' => ['required', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $student->update($data);

        return redirect()->route('students.show', $student->id)->with('success', 'Estudiante actualizado.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        // Regla de Negocio Estricta: Si tiene pagos aprobados o facturación, bloquear eliminación
        $hasPayments = $student->payments()->exists();
        $hasApprovedInstallments = $student->installments()->whereIn('status', ['paid', 'partial'])->exists();

        if ($hasPayments || $hasApprovedInstallments) {
            return back()->withErrors(['general' => 'No se puede eliminar este estudiante porque posee registros financieros (pagos o cuotas procesadas). En su lugar, suspéndalo.']);
        }

        $student->delete();

        return redirect()->route('students.index')->with('success', 'Estudiante eliminado (Soft Delete).');
    }
}
