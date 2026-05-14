<?php

namespace App\Exports;

use App\Models\Enrollment;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EnrollmentExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Enrollment::query()
            ->with(['student', 'course', 'cohort']);

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('enrolled_at', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay()
            ]);
        }

        if (!empty($this->filters['course_id'])) {
            $query->where('course_id', $this->filters['course_id']);
        }

        if (!empty($this->filters['cohort_id'])) {
            $query->where('cohort_id', $this->filters['cohort_id']);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID Matrícula',
            'Fecha',
            'Nombre del Alumno',
            'Correo',
            'Documento Identidad',
            'Curso',
            'Cohorte',
            'Estado en Moodle',
        ];
    }

    public function map($enrollment): array
    {
        $status = $enrollment->moodle_status === 1 ? 'Suspendido' : 'Activo';

        return [
            $enrollment->id,
            $enrollment->enrolled_at ? $enrollment->enrolled_at->format('Y-m-d') : 'N/A',
            $enrollment->student ? $enrollment->student->first_name . ' ' . $enrollment->student->last_name : 'N/A',
            $enrollment->student ? $enrollment->student->email : 'N/A',
            $enrollment->student ? $enrollment->student->identity_doc : 'N/A',
            $enrollment->course ? $enrollment->course->fullname : 'N/A',
            $enrollment->cohort ? $enrollment->cohort->name : 'N/A',
            $status,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
