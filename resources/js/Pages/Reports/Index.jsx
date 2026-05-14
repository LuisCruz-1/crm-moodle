import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Card from '@/Components/Card';
import {
    DocumentArrowDownIcon,
    DocumentTextIcon,
    TableCellsIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';

export default function ReportsIndex({ advisors, courses, cohorts }) {
    const { data, setData } = useForm({
        start_date: '',
        end_date: '',
        course_id: '',
        cohort_id: '',
        advisor_id: '',
    });

    const handleExport = (type, format) => {
        const queryParams = new URLSearchParams({
            ...data,
            format: format,
        }).toString();

        window.location.href = route('reports.export', { type }) + '?' + queryParams;
    };

    const reportCategories = [
        {
            title: 'Reportes Comerciales y de Admisiones',
            reports: [
                {
                    id: 'lead_conversion',
                    name: 'Conversión y Trazabilidad de Leads',
                    description: 'Muestra cada lead ingresado en un periodo, qué asesor lo atendió, tiempo promedio que tardó en cerrarse y en qué curso se matriculó.',
                },
                {
                    id: 'lost_opportunities',
                    name: 'Oportunidades Perdidas',
                    description: 'Listado de leads movidos a etapas de rechazo/pérdida, agrupados por motivo de pérdida.',
                },
            ],
        },
        {
            title: 'Reportes Financieros y Contables',
            reports: [
                {
                    id: 'general_ledger',
                    name: 'Conciliación y Arqueo de Caja',
                    description: 'Detalla cada cuota marcada como Pagada en un rango de fechas. Indispensable para cruzar con extractos bancarios.',
                },
                {
                    id: 'debtors',
                    name: 'Deudores / Aging de Cartera',
                    description: 'Listado de todos los alumnos en mora. Herramienta clave para cobranzas.',
                },
                {
                    id: 'discounts',
                    name: 'Descuentos Aplicados',
                    description: 'Modificaciones de precio o descuentos manuales aplicados a las cuotas.',
                },
                {
                    id: 'cashflow',
                    name: 'Proyección de Flujo de Caja',
                    description: 'Listado de cuotas futuras pendientes agrupadas por mes.',
                },
            ],
        },
        {
            title: 'Reportes Académicos y de Sistema',
            reports: [
                {
                    id: 'enrollments',
                    name: 'Sábana de Matrículas',
                    description: 'Listado general de alumnos cruzados con los cursos y cohortes a los que pertenecen.',
                },
                {
                    id: 'audit',
                    name: 'Reporte de Auditoría',
                    description: 'Exportación de registros del sistema detallando acciones críticas (quién borró qué, etc.).',
                },
            ],
        },
    ];

    return (
        <AuthenticatedLayout header="Módulo de Reportes Avanzados">
            <Head title="Reportes" />

            <div className="space-y-6">
                {/* Filtros Globales */}
                <Card>
                    <div className="flex items-center space-x-2 mb-6">
                        <FunnelIcon className="h-6 w-6 text-primary-600" />
                        <h3 className="text-lg font-semibold text-surface-900">Filtros Globales</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <InputLabel htmlFor="start_date" value="Fecha Inicio" />
                            <TextInput
                                id="start_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="end_date" value="Fecha Fin" />
                            <TextInput
                                id="end_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="course_id" value="Curso" />
                            <SelectInput
                                id="course_id"
                                className="mt-1 block w-full"
                                value={data.course_id}
                                onChange={(e) => setData('course_id', e.target.value)}
                            >
                                <option value="">Todos los cursos</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.fullname}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <div>
                            <InputLabel htmlFor="cohort_id" value="Cohorte" />
                            <SelectInput
                                id="cohort_id"
                                className="mt-1 block w-full"
                                value={data.cohort_id}
                                onChange={(e) => setData('cohort_id', e.target.value)}
                            >
                                <option value="">Todas las cohortes</option>
                                {cohorts.map((cohort) => (
                                    <option key={cohort.id} value={cohort.id}>
                                        {cohort.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <div>
                            <InputLabel htmlFor="advisor_id" value="Asesor/Staff" />
                            <SelectInput
                                id="advisor_id"
                                className="mt-1 block w-full"
                                value={data.advisor_id}
                                onChange={(e) => setData('advisor_id', e.target.value)}
                            >
                                <option value="">Todos los usuarios</option>
                                {advisors.map((advisor) => (
                                    <option key={advisor.id} value={advisor.id}>
                                        {advisor.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
                            onClick={() => setData({ start_date: '', end_date: '', course_id: '', cohort_id: '', advisor_id: '' })}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </Card>

                {/* Listado de Reportes */}
                <div className="space-y-6">
                    {reportCategories.map((category) => (
                        <Card key={category.title} className="p-0 overflow-hidden border border-surface-200">
                            <div className="border-b border-surface-200 bg-surface-50 px-6 py-4">
                                <h3 className="text-base font-semibold text-surface-900">{category.title}</h3>
                            </div>
                            <ul className="divide-y divide-surface-100 bg-white">
                                {category.reports.map((report) => (
                                    <li key={report.id} className="p-6 hover:bg-surface-50 transition duration-150 group">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-base font-medium text-surface-900 group-hover:text-primary-700 transition-colors">{report.name}</h4>
                                                <p className="mt-1 text-sm text-surface-500 leading-relaxed">{report.description}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleExport(report.id, 'xlsx')}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm font-medium border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                                    title="Exportar a Excel"
                                                >
                                                    <TableCellsIcon className="h-4 w-4" />
                                                    Excel
                                                </button>
                                                <button
                                                    onClick={() => handleExport(report.id, 'csv')}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 px-3 py-2 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    title="Exportar a CSV"
                                                >
                                                    <DocumentTextIcon className="h-4 w-4" />
                                                    CSV
                                                </button>
                                                <button
                                                    onClick={() => handleExport(report.id, 'pdf')}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm font-medium border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                    title="Exportar a PDF"
                                                >
                                                    <DocumentArrowDownIcon className="h-4 w-4" />
                                                    PDF
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
