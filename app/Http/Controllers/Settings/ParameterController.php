<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Currency;
use App\Models\PaymentMethod;
use App\Models\PaymentType;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class ParameterController extends Controller
{
    public function identity()
    {
        return Inertia::render('Settings/Parameters/Identity', [
            'branding' => [
                'app_name' => Setting::where('key', 'app_name')->value('value') ?? config('app.name'),
                'app_logo' => Setting::where('key', 'app_logo')->value('value'),
                'app_favicon' => Setting::where('key', 'app_favicon')->value('value'),
                'currency_symbol' => Setting::where('key', 'currency_symbol')->value('value') ?? '$',
                'currency_code' => Setting::where('key', 'currency_code')->value('value') ?? 'USD',
            ]
        ]);
    }

    public function catalogs()
    {
        return Inertia::render('Settings/Parameters/Catalogs', [
            'paymentMethods' => PaymentMethod::all(),
            'paymentTypes' => PaymentType::all(),
        ]);
    }

    public function updateBranding(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'currency_symbol' => 'required|string|max:10',
            'currency_code' => 'required|string|max:10',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
            'favicon' => 'nullable|mimes:ico,png,svg|max:1024',
        ]);

        Setting::updateOrCreate(['key' => 'app_name'], ['value' => $request->app_name, 'group' => 'branding']);
        Setting::updateOrCreate(['key' => 'currency_symbol'], ['value' => $request->currency_symbol, 'group' => 'branding']);
        Setting::updateOrCreate(['key' => 'currency_code'], ['value' => $request->currency_code, 'group' => 'branding']);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            Setting::updateOrCreate(['key' => 'app_logo'], ['value' => '/storage/' . $path, 'group' => 'branding']);
        }

        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('branding', 'public');
            Setting::updateOrCreate(['key' => 'app_favicon'], ['value' => '/storage/' . $path, 'group' => 'branding']);
        }

        return back()->with('success', 'Identidad visual actualizada correctamente.');
    }

    // The currency CRUD methods have been removed as per simplification request.

    // --- Payment Methods ---
    public function storePaymentMethod(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        PaymentMethod::create($data);
        return back()->with('success', 'Método de pago creado.');
    }

    public function updatePaymentMethod(Request $request, PaymentMethod $paymentMethod)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $paymentMethod->update($data);
        return back()->with('success', 'Método de pago actualizado.');
    }

    public function destroyPaymentMethod(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();
        return back()->with('success', 'Método de pago eliminado.');
    }

    // --- Payment Types ---
    public function storePaymentType(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        PaymentType::create($data);
        return back()->with('success', 'Tipo de pago creado.');
    }

    public function updatePaymentType(Request $request, PaymentType $paymentType)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $paymentType->update($data);
        return back()->with('success', 'Tipo de pago actualizado.');
    }

    public function destroyPaymentType(PaymentType $paymentType)
    {
        $paymentType->delete();
        return back()->with('success', 'Tipo de pago eliminado.');
    }
}
