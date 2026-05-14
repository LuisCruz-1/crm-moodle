<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\LmsCourse;
use App\Models\LmsCohort;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LeadConversionExport;
use App\Exports\LostOpportunitiesExport;
use App\Exports\GeneralLedgerExport;
use App\Exports\DebtorsExport;
use App\Exports\DiscountsExport;
use App\Exports\CashflowExport;
use App\Exports\EnrollmentExport;
use App\Exports\AuditExport;

class ReportController extends Controller
{
    public function index()
    {
        // Prevent RoleDoesNotExist by using available roles or just getting all users if roles are not yet correctly seeded.
        try {
            $advisors = User::role(['ventas', 'superadmin'])->get(['id', 'name']);
        } catch (\Exception $e) {
            $advisors = User::get(['id', 'name']);
        }
        
        $courses = LmsCourse::where('visible', 1)->get(['id', 'fullname']);
        $cohorts = LmsCohort::where('visible', 1)->get(['id', 'name']);

        return Inertia::render('Reports/Index', [
            'advisors' => $advisors,
            'courses' => $courses,
            'cohorts' => $cohorts,
        ]);
    }

    public function export(Request $request, $type)
    {
        $filters = $request->all();
        $format = $request->query('format', 'xlsx');

        $reportName = match ($type) {
            'lead_conversion' => 'Trazabilidad_Leads',
            'lost_opportunities' => 'Oportunidades_Perdidas',
            'general_ledger' => 'Arqueo_Caja',
            'debtors' => 'Deudores_Morosos',
            'discounts' => 'Descuentos_Aplicados',
            'cashflow' => 'Flujo_Caja',
            'enrollments' => 'Sabana_Matriculas',
            'audit' => 'Auditoria_Sistema',
            default => 'Reporte',
        };

        $fileName = "{$reportName}_" . now()->format('Ymd_Hi') . ".{$format}";

        $exportClass = match ($type) {
            'lead_conversion' => new LeadConversionExport($filters),
            'lost_opportunities' => new LostOpportunitiesExport($filters),
            'general_ledger' => new GeneralLedgerExport($filters),
            'debtors' => new DebtorsExport($filters),
            'discounts' => new DiscountsExport($filters),
            'cashflow' => new CashflowExport($filters),
            'enrollments' => new EnrollmentExport($filters),
            'audit' => new AuditExport($filters),
            default => abort(404),
        };

        $writerType = match ($format) {
            'csv' => \Maatwebsite\Excel\Excel::CSV,
            'pdf' => \Maatwebsite\Excel\Excel::DOMPDF,
            default => \Maatwebsite\Excel\Excel::XLSX,
        };

        return Excel::download($exportClass, $fileName, $writerType);
    }
}


