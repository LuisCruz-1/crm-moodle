import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import CommsSubnav from '@/Components/CommsSubnav';
import Card from '@/Components/Card';
import SelectInput from '@/Components/SelectInput';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Index({ logs, filters }) {
    const handleFilterChange = (e) => {
        router.get(route('comms.logs.index'), { status: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header="Comunicaciones - Bandeja de Salida">
            <Head title="Logs de Correos" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CommsSubnav />
                    
                    <Card className="!p-0">
                        <header className="flex flex-col md:flex-row md:justify-between items-center gap-4 p-6 border-b border-gray-100 bg-gray-50/30">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Historial de Envíos (Logs)</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Revisa el estado de todos los correos transaccionales enviados por el sistema.
                                </p>
                            </div>
                            <div className="w-full md:w-auto">
                                <SelectInput 
                                    className="w-full md:w-64"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="sent">Enviados</option>
                                    <option value="queued">En Cola / Pendientes</option>
                                    <option value="failed">Fallidos</option>
                                </SelectInput>
                            </div>
                        </header>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plantilla (Key)</th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles / Error</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{new Date(log.created_at).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.to}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 font-mono">
                                                    {log.template_key}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {log.status === 'sent' && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Enviado</span>}
                                                {log.status === 'queued' && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">En Cola</span>}
                                                {log.status === 'failed' && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Fallido</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.error}>
                                                {log.error || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                    <EnvelopeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                                </div>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin registros</h3>
                                                <p className="mt-1 text-sm text-gray-500">No hay registros que coincidan con la búsqueda.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            {logs.links && logs.links.length > 3 && (
                                <div className="flex flex-wrap gap-1">
                                    {logs.links.map((link, k) => (
                                        <div key={k}>
                                            {link.url === null ? (
                                                <div
                                                    className="px-4 py-2 text-sm leading-4 text-gray-400 border border-gray-200 rounded-md bg-white"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <Link
                                                    className={`px-4 py-2 text-sm leading-4 border rounded-md transition-colors ${
                                                        link.active 
                                                            ? 'bg-primary-600 text-white border-primary-600' 
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                                    href={link.url}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}