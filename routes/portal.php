<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Portal\AuthController;
use App\Http\Controllers\Portal\DashboardController;
use App\Http\Controllers\Portal\InstallmentController;
use App\Http\Controllers\Portal\PaymentSubmissionController;
use App\Http\Controllers\Portal\MoodleLoginController;

Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('login');
    });

    Route::middleware('auth:student')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('estado-cuenta', [InstallmentController::class, 'index'])->name('installments.index');
        Route::post('pagos/subir', [PaymentSubmissionController::class, 'store'])->name('payments.store');
        
        Route::get('moodle-login/{course}', [MoodleLoginController::class, 'redirect'])->name('moodle.login');
    });
});
