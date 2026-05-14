<?php

namespace App\Http\Controllers\Comms;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        // Notification logs could be populated using an event listener on the Mailer,
        // or by explicitly writing to the `notification_logs` table inside the Job.
        // For now we'll query the existing table to display whatever is there.

        $status = $request->input('status', '');

        $logs = DB::table('notification_logs')
            ->when($status, function($q) use ($status) {
                return $q->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Comms/Logs/Index', [
            'logs' => $logs,
            'filters' => [
                'status' => $status,
            ]
        ]);
    }
}
