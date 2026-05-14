<?php

namespace App\Exports;

use App\Models\Payment;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GeneralLedgerExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Payment::query()
            ->with(['student', 'installment.enrollment.course', 'paymentMethod', 'approvedBy']);

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay()
            ]);
        }

        if (!empty($this->filters['course_id'])) {
            $query->whereHas('installment.enrollment', function ($q) {
                $q->where('course_id', $this->filters['course_id']);
            });
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID Pago',
            'Fecha de Aprobación',
            'Nombre del Alumno',
            'Curso',
            'Cuota',
            'Monto',
            'Método de Pago',
            'Usuario Staff (Aprobador)',
            'Notas/Referencia',
        ];
    }

    public function map($payment): array
    {
        $courseName = $payment->installment && $payment->installment->enrollment && $payment->installment->enrollment->course
            ? $payment->installment->enrollment->course->fullname
            : 'N/A';
            
        $installmentName = $payment->installment ? $payment->installment->name : 'N/A';

        return [
            $payment->id,
            $payment->created_at->format('Y-m-d H:i'),
            $payment->student ? $payment->student->first_name . ' ' . $payment->student->last_name : 'N/A',
            $courseName,
            $installmentName,
            number_format($payment->amount, 2, '.', ''),
            $payment->paymentMethod ? $payment->paymentMethod->name : 'N/A',
            $payment->approvedBy ? $payment->approvedBy->name : 'Sistema',
            trim($payment->reference . ' ' . $payment->notes),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
