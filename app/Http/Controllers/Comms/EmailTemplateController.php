<?php

namespace App\Http\Controllers\Comms;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    public function index()
    {
        $templates = EmailTemplate::orderBy('name')->get();
        return Inertia::render('Comms/Templates/Index', [
            'templates' => $templates
        ]);
    }

    public function edit(EmailTemplate $template)
    {
        return Inertia::render('Comms/Templates/Edit', [
            'template' => $template
        ]);
    }

    public function update(Request $request, EmailTemplate $template)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->route('comms.templates.index')->with('success', 'Plantilla actualizada correctamente.');
    }
}
