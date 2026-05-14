<?php

namespace App\Exports;

use App\Models\Lead;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LostOpportunitiesExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Lead::query()
            ->with(['assignedTo', 'course'])
            ->where('status', 'lost');

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('updated_at', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay()
            ]);
        }

        if (!empty($this->filters['advisor_id'])) {
            $query->where('assigned_to_user_id', $this->filters['advisor_id']);
        }

        if (!empty($this->filters['course_id'])) {
            $query->where('course_id', $this->filters['course_id']);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Fecha de Pérdida',
            'Nombre del Lead',
            'Teléfono',
            'Email',
            'Asesor Asignado',
            'Curso de Interés',
            'Motivo de Pérdida',
        ];
    }

    public function map($lead): array
    {
        $lostReason = $lead->metadata['lost_reason'] ?? 'No especificado';

        return [
            $lead->id,
            $lead->updated_at->format('Y-m-d H:i'),
            $lead->first_name . ' ' . $lead->last_name,
            $lead->phone,
            $lead->email,
            $lead->assignedTo ? $lead->assignedTo->name : 'Sin Asignar',
            $lead->course ? $lead->course->fullname : 'N/A',
            $lostReason,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
