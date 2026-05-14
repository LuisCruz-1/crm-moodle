<?php

namespace App\Exports;

use Spatie\Activitylog\Models\Activity;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AuditExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Activity::query()->with('causer');

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay()
            ]);
        }

        if (!empty($this->filters['advisor_id'])) {
            $query->where('causer_id', $this->filters['advisor_id'])
                  ->where('causer_type', 'App\Models\User');
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID Log',
            'Fecha',
            'Módulo / Entidad',
            'Acción',
            'Usuario (Staff)',
            'Detalles / Propiedades',
        ];
    }

    public function map($activity): array
    {
        return [
            $activity->id,
            $activity->created_at->format('Y-m-d H:i:s'),
            class_basename($activity->subject_type),
            $activity->description,
            $activity->causer ? $activity->causer->name : 'Sistema',
            json_encode($activity->properties),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
