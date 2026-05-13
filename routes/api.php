<?php

use App\Http\Controllers\Webhooks\LeadWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('webhooks')->group(function () {
    Route::post('/leads', LeadWebhookController::class)->name('webhooks.leads');
});

