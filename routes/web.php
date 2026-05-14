<?php

use App\Http\Controllers\BackofficeController;
use App\Http\Controllers\Academics\CourseController as AcademicsCourseController;
use App\Http\Controllers\Academics\CoursePaymentPlanController as AcademicsCoursePaymentPlanController;
use App\Http\Controllers\Academics\SyncController as AcademicsSyncController;
use App\Http\Controllers\Crm\KanbanController;
use App\Http\Controllers\Crm\LeadController;
use App\Http\Controllers\Crm\LeadConversionController;
use App\Http\Controllers\Crm\LeadMoveController;
use App\Http\Controllers\Crm\LeadNoteController;
use App\Http\Controllers\Crm\StudentSearchController;
use App\Http\Controllers\Crm\PipelineController;
use App\Http\Controllers\Crm\PipelineStageController;
use App\Http\Controllers\Students\StudentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\MoodleController as SettingsMoodleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Students\StudentEnrollmentController;
use App\Http\Controllers\Finance\PaymentSubmissionController;
use App\Http\Controllers\Finance\InstallmentController;
use App\Http\Controllers\Finance\PaymentController;
use App\Http\Controllers\ReportController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BackofficeController::class, 'dashboard'])->name('dashboard');

    Route::prefix('crm')->name('crm.')->group(function () {
        Route::get('/pipelines', [PipelineController::class, 'index'])->name('pipelines.index');
        Route::post('/pipelines', [PipelineController::class, 'store'])->name('pipelines.store');
        Route::put('/pipelines/{pipeline}', [PipelineController::class, 'update'])->name('pipelines.update');
        Route::delete('/pipelines/{pipeline}', [PipelineController::class, 'destroy'])->name('pipelines.destroy');

        Route::post('/pipelines/{pipeline}/stages', [PipelineStageController::class, 'store'])->name('pipelines.stages.store');
        Route::put('/pipelines/{pipeline}/stages/{stage}', [PipelineStageController::class, 'update'])->name('pipelines.stages.update');
        Route::delete('/pipelines/{pipeline}/stages/{stage}', [PipelineStageController::class, 'destroy'])->name('pipelines.stages.destroy');
        Route::post('/pipelines/{pipeline}/stages/reorder', [PipelineStageController::class, 'reorder'])->name('pipelines.stages.reorder');

        Route::get('/kanban', [KanbanController::class, 'index'])->name('kanban.index');
        Route::post('/leads/{lead}/move', LeadMoveController::class)->name('leads.move');
        Route::post('/leads/{lead}/conversion/preview', [LeadConversionController::class, 'preview'])->name('leads.conversion.preview');
        Route::post('/leads/{lead}/conversion/confirm', [LeadConversionController::class, 'confirm'])->name('leads.conversion.confirm');

        Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/crear', [LeadController::class, 'create'])->name('leads.create');
        Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
        Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
        Route::put('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
        Route::post('/leads/{lead}/notes', [LeadNoteController::class, 'store'])->name('leads.notes.store');

        Route::get('/students/search', StudentSearchController::class)->name('students.search');
    });

    Route::prefix('academico')->name('academics.')->group(function () {
        Route::get('/cursos', [AcademicsCourseController::class, 'index'])->name('courses.index');
        Route::get('/cursos/{course}', [AcademicsCourseController::class, 'show'])->name('courses.show');

        Route::post('/cursos/{course}/planes', [AcademicsCoursePaymentPlanController::class, 'store'])->name('courses.plans.store');
        Route::post('/cursos/{course}/planes/{plan}/items', [AcademicsCoursePaymentPlanController::class, 'storeItem'])->name('courses.plans.items.store');
        Route::put('/cursos/{course}/planes/{plan}/items/{item}', [AcademicsCoursePaymentPlanController::class, 'updateItem'])->name('courses.plans.items.update');
        Route::delete('/cursos/{course}/planes/{plan}/items/{item}', [AcademicsCoursePaymentPlanController::class, 'destroyItem'])->name('courses.plans.items.destroy');
        Route::post('/cursos/{course}/planes/{plan}/items/reorder', [AcademicsCoursePaymentPlanController::class, 'reorderItems'])->name('courses.plans.items.reorder');

        Route::get('/sync', [AcademicsSyncController::class, 'index'])->name('sync.index');
        Route::post('/sync', [AcademicsSyncController::class, 'run'])->name('sync.run');
    });

    Route::prefix('estudiantes')->name('students.')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->name('index');
        Route::get('/crear', [StudentController::class, 'create'])->name('create');
        Route::post('/', [StudentController::class, 'store'])->name('store');
        Route::get('/{student}', [StudentController::class, 'show'])->name('show');
        Route::get('/{student}/editar', [StudentController::class, 'edit'])->name('edit');
        Route::put('/{student}', [StudentController::class, 'update'])->name('update');
        Route::put('/{student}/password', [StudentController::class, 'updatePassword'])->name('update_password');
        Route::delete('/{student}', [StudentController::class, 'destroy'])->name('destroy');
        Route::post('/{student}/matricular', [StudentEnrollmentController::class, 'store'])->name('enrollments.store');
    });

    Route::prefix('finanzas')->name('finance.')->group(function () {
        Route::get('/inbox', [PaymentSubmissionController::class, 'index'])->name('inbox.index');
        Route::post('/inbox/{submission}/aprobar', [PaymentSubmissionController::class, 'approve'])->name('inbox.approve');
        Route::post('/inbox/{submission}/rechazar', [PaymentSubmissionController::class, 'reject'])->name('inbox.reject');

        Route::get('/cuotas', [InstallmentController::class, 'index'])->name('installments.index');
        Route::put('/cuotas/{installment}', [InstallmentController::class, 'update'])->name('installments.update');
        Route::post('/cuotas/{installment}/descuento', [InstallmentController::class, 'applyDiscount'])->name('installments.discount');
        Route::post('/cuotas/{installment}/pagar', [InstallmentController::class, 'registerPayment'])->name('installments.pay');

        Route::get('/pagos', [PaymentController::class, 'index'])->name('payments.index');

        Route::get('/metodos-de-pago', [BackofficeController::class, 'financePaymentMethods'])->name('payment_methods.index');
        Route::get('/monedas', [BackofficeController::class, 'financeCurrencies'])->name('currencies.index');
        Route::get('/tipos-de-pago', [BackofficeController::class, 'financePaymentTypes'])->name('payment_types.index');
    });

    Route::prefix('reportes')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/export/{type}', [ReportController::class, 'export'])->name('export');
    });

    Route::prefix('comunicaciones')->name('comms.')->group(function () {
        Route::get('/plantillas', [BackofficeController::class, 'commsTemplates'])->name('templates.index');
        Route::get('/logs', [BackofficeController::class, 'commsLogs'])->name('logs.index');
    });

    Route::prefix('configuracion')->name('settings.')->group(function () {
        Route::get('/moodle', [SettingsMoodleController::class, 'index'])->name('moodle.index');
        Route::put('/moodle', [SettingsMoodleController::class, 'update'])->name('moodle.update');
        Route::get('/parametros', [BackofficeController::class, 'settingsParameters'])->name('parameters.index');
        
        Route::get('/usuarios', [BackofficeController::class, 'adminUsers'])->name('users.index');
        Route::post('/usuarios', [BackofficeController::class, 'storeUser'])->name('users.store');
        Route::put('/usuarios/{user}', [BackofficeController::class, 'updateUser'])->name('users.update');
        Route::delete('/usuarios/{user}', [BackofficeController::class, 'destroyUser'])->name('users.destroy');

        Route::get('/roles', [BackofficeController::class, 'adminRoles'])->name('roles.index');
        Route::post('/roles', [BackofficeController::class, 'storeRole'])->name('roles.store');
        Route::put('/roles/{role}', [BackofficeController::class, 'updateRole'])->name('roles.update');
        Route::delete('/roles/{role}', [BackofficeController::class, 'destroyRole'])->name('roles.destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
