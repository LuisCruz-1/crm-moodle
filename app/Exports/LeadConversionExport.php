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

class LeadConversionExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Lead::query()
            ->with(['assignedTo', 'course', 'stage'])
            ->whereNotNull('assigned_to_user_id');

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('created_at', [
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
            'Fecha de Ingreso',
            'Nombre del Lead',
            'Email',
            'Teléfono',
            'Asesor Asignado',
            'Curso de Interés',
            'Estado Actual',
            'Etapa',
            'Días hasta Cierre (Si aplica)',
        ];
    }

    public function map($lead): array
    {
        $daysToClose = 'N/A';
        if ($lead->status === 'won' && $lead->updated_at) {
            $daysToClose = $lead->created_at->diffInDays($lead->updated_at);
            if ($daysToClose === 0) {
                $daysToClose = '< 1 día';
            } else {
                $daysToClose .= ' días';
            }
        }

        return [
            $lead->id,
            $lead->created_at->format('Y-m-d H:i'),
            $lead->first_name . ' ' . $lead->last_name,
            $lead->email,
            $lead->phone,
            $lead->assignedTo ? $lead->assignedTo->name : 'Sin Asignar',
            $lead->course ? $lead->course->fullname : 'N/A',
            ucfirst($lead->status),
            $lead->stage ? $lead->stage->name : 'N/A',
            $daysToClose,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
