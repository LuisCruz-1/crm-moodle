import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrmSubnav from '@/Components/CrmSubnav';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Index({ leads }) {
    return (
        <AuthenticatedLayout header="CRM · Leads">
            <Head title="CRM · Leads" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CrmSubnav />
                    
                    <Card className="!p-0">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <h3 className="text-lg font-medium text-gray-900">Listado de Leads</h3>
                            <Link href={route('crm.leads.create')}>
                                <PrimaryButton className="flex items-center gap-2">
                                    <PlusIcon className="h-5 w-5" />
                                    Crear Lead
                                </PrimaryButton>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lead</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pipeline</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Etapa</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Curso</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cohorte</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {(leads?.data ?? []).map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex flex-col">
                                                    <Link className="text-sm font-medium text-primary-600 hover:text-primary-800" href={route('crm.leads.show', lead.id)}>
                                                        {(lead.student?.first_name || lead.student?.last_name || lead.first_name || lead.last_name)
                                                            ? `${lead.student?.first_name ?? lead.first_name ?? ''} ${lead.student?.last_name ?? lead.last_name ?? ''}`.trim()
                                                            : lead.student?.email ?? lead.email ?? `#${lead.id}`}
                                                    </Link>
                                                    <span className="text-xs text-gray-500">{lead.student?.email ?? lead.email ?? '—'}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {lead.pipeline?.name ?? '—'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    {lead.stage?.name ?? '—'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{lead.course?.fullname ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{lead.cohort?.name ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                    lead.status === 'won' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                    lead.status === 'lost' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                }`}>
                                                    {lead.status === 'won' ? 'Ganado' : lead.status === 'lost' ? 'Perdido' : 'Abierto'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
