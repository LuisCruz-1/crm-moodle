<?php

use App\Http\Controllers\BackofficeController;
use App\Http\Controllers\Crm\KanbanController;
use App\Http\Controllers\Crm\LeadController;
use App\Http\Controllers\Crm\LeadMoveController;
use App\Http\Controllers\Crm\PipelineController;
use App\Http\Controllers\Crm\PipelineStageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

        Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/crear', [LeadController::class, 'create'])->name('leads.create');
        Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
    });

    Route::prefix('academico')->name('academics.')->group(function () {
        Route::get('/cursos', [BackofficeController::class, 'academicsCourses'])->name('courses.index');
        Route::get('/sync', [BackofficeController::class, 'academicsSync'])->name('sync.index');
    });

    Route::prefix('estudiantes')->name('students.')->group(function () {
        Route::get('/', [BackofficeController::class, 'studentsIndex'])->name('index');
        Route::get('/crear', [BackofficeController::class, 'studentsCreate'])->name('create');
    });

    Route::prefix('finanzas')->name('finance.')->group(function () {
        Route::get('/inbox', [BackofficeController::class, 'financeInbox'])->name('inbox.index');
        Route::get('/cuotas', [BackofficeController::class, 'financeInstallments'])->name('installments.index');
        Route::get('/metodos-de-pago', [BackofficeController::class, 'financePaymentMethods'])->name('payment_methods.index');
        Route::get('/monedas', [BackofficeController::class, 'financeCurrencies'])->name('currencies.index');
        Route::get('/tipos-de-pago', [BackofficeController::class, 'financePaymentTypes'])->name('payment_types.index');
    });

    Route::prefix('comunicaciones')->name('comms.')->group(function () {
        Route::get('/plantillas', [BackofficeController::class, 'commsTemplates'])->name('templates.index');
        Route::get('/logs', [BackofficeController::class, 'commsLogs'])->name('logs.index');
    });

    Route::prefix('configuracion')->name('settings.')->group(function () {
        Route::get('/moodle', [BackofficeController::class, 'settingsMoodle'])->name('moodle.index');
        Route::get('/parametros', [BackofficeController::class, 'settingsParameters'])->name('parameters.index');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/usuarios', [BackofficeController::class, 'adminUsers'])->name('users.index');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
