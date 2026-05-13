import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ leads }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Leads</h2>}>
            <Head title="CRM · Leads" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">Listado</div>
                            <Link className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white" href={route('crm.leads.create')}>
                                Crear lead
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lead</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pipeline</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Etapa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Curso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cohorte</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {(leads?.data ?? []).map((lead) => (
                                        <tr key={lead.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                <Link className="hover:underline" href={route('crm.leads.show', lead.id)}>
                                                    {(lead.first_name || lead.last_name)
                                                        ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim()
                                                        : lead.email ?? `#${lead.id}`}
                                                </Link>
                                                <div className="text-xs text-gray-600">{lead.email ?? '—'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{lead.pipeline?.name ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{lead.stage?.name ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{lead.course?.fullname ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{lead.cohort?.name ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{lead.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
