import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    DocumentArrowDownIcon,
    DocumentTextIcon,
    TableCellsIcon,
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
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Módulo de Reportes Avanzados</h2>}
        >
            <Head title="Reportes" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Filtros Globales */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros Globales</h3>
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
                                <select
                                    id="course_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                >
                                    <option value="">Todos los cursos</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.fullname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="cohort_id" value="Cohorte" />
                                <select
                                    id="cohort_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.cohort_id}
                                    onChange={(e) => setData('cohort_id', e.target.value)}
                                >
                                    <option value="">Todas las cohortes</option>
                                    {cohorts.map((cohort) => (
                                        <option key={cohort.id} value={cohort.id}>
                                            {cohort.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="advisor_id" value="Asesor/Staff" />
                                <select
                                    id="advisor_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.advisor_id}
                                    onChange={(e) => setData('advisor_id', e.target.value)}
                                >
                                    <option value="">Todos los usuarios</option>
                                    {advisors.map((advisor) => (
                                        <option key={advisor.id} value={advisor.id}>
                                            {advisor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                                onClick={() => setData({ start_date: '', end_date: '', course_id: '', cohort_id: '', advisor_id: '' })}
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Listado de Reportes */}
                    <div className="space-y-8">
                        {reportCategories.map((category) => (
                            <div key={category.title} className="bg-white shadow sm:rounded-lg overflow-hidden">
                                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                    <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {category.reports.map((report) => (
                                        <li key={report.id} className="p-6 hover:bg-gray-50 transition duration-150">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-base font-semibold text-gray-900">{report.name}</h4>
                                                    <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleExport(report.id, 'xlsx')}
                                                        className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                                    >
                                                        <TableCellsIcon className="h-4 w-4" />
                                                        Excel
                                                    </button>
                                                    <button
                                                        onClick={() => handleExport(report.id, 'csv')}
                                                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                    >
                                                        <DocumentTextIcon className="h-4 w-4" />
                                                        CSV
                                                    </button>
                                                    <button
                                                        onClick={() => handleExport(report.id, 'pdf')}
                                                        className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                                    >
                                                        <DocumentArrowDownIcon className="h-4 w-4" />
                                                        PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
