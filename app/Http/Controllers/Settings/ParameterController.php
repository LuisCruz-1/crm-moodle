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
    public function index()
    {
        return Inertia::render('Settings/Parameters/Index', [
            'currencies' => Currency::all(),
            'paymentMethods' => PaymentMethod::all(),
            'paymentTypes' => PaymentType::all(),
            'branding' => [
                'app_name' => Setting::where('key', 'app_name')->value('value') ?? config('app.name'),
                'app_logo' => Setting::where('key', 'app_logo')->value('value'),
                'app_favicon' => Setting::where('key', 'app_favicon')->value('value'),
            ]
        ]);
    }

    public function updateBranding(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
            'favicon' => 'nullable|mimes:ico,png,svg|max:1024',
        ]);

        Setting::updateOrCreate(['key' => 'app_name'], ['value' => $request->app_name, 'group' => 'branding']);

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

    // --- Currencies ---
    public function storeCurrency(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
            'is_default' => 'boolean',
        ]);

        if (!empty($data['is_default'])) {
            Currency::query()->update(['is_default' => false]);
        }

        Currency::create($data);
        return back()->with('success', 'Moneda creada correctamente.');
    }

    public function updateCurrency(Request $request, Currency $currency)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
            'is_default' => 'boolean',
        ]);

        if (!empty($data['is_default']) && !$currency->is_default) {
            Currency::query()->update(['is_default' => false]);
        }

        $currency->update($data);
        return back()->with('success', 'Moneda actualizada correctamente.');
    }

    public function destroyCurrency(Currency $currency)
    {
        $currency->delete();
        return back()->with('success', 'Moneda eliminada.');
    }

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
