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

class DebtorsExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Installment::query()
            ->with(['enrollment.student', 'enrollment.course'])
            ->where('status', 'overdue');

        if (!empty($this->filters['course_id'])) {
            $query->whereHas('enrollment', function ($q) {
                $q->where('course_id', $this->filters['course_id']);
            });
        }

        $installments = $query->get();

        // Group by enrollment to show Debt per Student-Course
        $grouped = $installments->groupBy('enrollment_id');

        $data = new Collection();

        foreach ($grouped as $enrollmentId => $enrollmentInstallments) {
            $first = $enrollmentInstallments->first();
            if (!$first || !$first->enrollment || !$first->enrollment->student) {
                continue;
            }

            $student = $first->enrollment->student;
            $course = $first->enrollment->course;

            // Calculate max delay
            $maxDelay = 0;
            $totalDebt = 0;
            $overdueCount = 0;

            foreach ($enrollmentInstallments as $inst) {
                $totalDebt += $inst->balance;
                $overdueCount++;
                $days = Carbon::parse($inst->due_date)->diffInDays(now(), false);
                if ($days > $maxDelay) {
                    $maxDelay = $days;
                }
            }

            $data->push([
                'Nombre' => $student->first_name . ' ' . $student->last_name,
                'Teléfono' => $student->phone,
                'Correo' => $student->email,
                'Curso' => $course ? $course->fullname : 'N/A',
                'Días de retraso' => (int) $maxDelay,
                'Cuotas vencidas' => $overdueCount,
                'Monto total adeudado' => number_format($totalDebt, 2, '.', ''),
            ]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Nombre',
            'Teléfono',
            'Correo',
            'Curso',
            'Días de retraso',
            'Cuotas vencidas',
            'Monto total adeudado',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
