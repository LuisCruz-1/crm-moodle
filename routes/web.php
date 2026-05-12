<?php

use App\Http\Controllers\BackofficeController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BackofficeController::class, 'dashboard'])->name('dashboard');

    Route::prefix('crm')->name('crm.')->group(function () {
        Route::get('/pipelines', [BackofficeController::class, 'crmPipelines'])->name('pipelines.index');
        Route::get('/kanban', [BackofficeController::class, 'crmKanban'])->name('kanban.index');
        Route::get('/leads', [BackofficeController::class, 'crmLeads'])->name('leads.index');
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
