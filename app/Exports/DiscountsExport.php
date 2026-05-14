<?php

namespace App\Exports;

use App\Models\InstallmentAdjustment;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DiscountsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = InstallmentAdjustment::query()
            ->with(['installment.enrollment.student', 'installment.enrollment.course', 'createdBy'])
            ->where('type', 'discount');

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay()
            ]);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID Ajuste',
            'Fecha',
            'Alumno',
            'Curso',
            'Cuota',
            'Monto Descuento',
            'Motivo',
            'Agente Financiero',
        ];
    }

    public function map($adj): array
    {
        $studentName = 'N/A';
        $courseName = 'N/A';
        $installmentName = 'N/A';

        if ($adj->installment) {
            $installmentName = $adj->installment->name;
            if ($adj->installment->enrollment) {
                if ($adj->installment->enrollment->student) {
                    $student = $adj->installment->enrollment->student;
                    $studentName = $student->first_name . ' ' . $student->last_name;
                }
                if ($adj->installment->enrollment->course) {
                    $courseName = $adj->installment->enrollment->course->fullname;
                }
            }
        }

        return [
            $adj->id,
            $adj->created_at->format('Y-m-d H:i'),
            $studentName,
            $courseName,
            $installmentName,
            number_format(abs($adj->delta_amount), 2, '.', ''),
            $adj->reason,
            $adj->createdBy ? $adj->createdBy->name : 'Sistema',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
