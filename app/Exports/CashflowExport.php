<?php

namespace App\Exports;

use App\Models\Installment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CashflowExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Installment::query()
            ->where('status', 'pending')
            ->where('due_date', '>=', now()->startOfMonth());

        $installments = $query->get();

        $grouped = $installments->groupBy(function ($inst) {
            return Carbon::parse($inst->due_date)->format('Y-m');
        });

        // Sort by month keys
        $grouped = $grouped->sortKeys();

        $data = new Collection();

        foreach ($grouped as $month => $monthInstallments) {
            $expectedAmount = $monthInstallments->sum('balance');
            $count = $monthInstallments->count();

            $data->push([
                'Mes' => Carbon::createFromFormat('Y-m', $month)->translatedFormat('F Y'),
                'Cantidad de Cuotas Pendientes' => $count,
                'Monto Esperado' => number_format($expectedAmount, 2, '.', ''),
            ]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Mes',
            'Cantidad de Cuotas Pendientes',
            'Monto Esperado',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
