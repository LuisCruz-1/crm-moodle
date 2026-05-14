import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import CommsSubnav from '@/Components/CommsSubnav';

export default function Index({ logs, filters }) {
    const handleFilterChange = (e) => {
        router.get(route('comms.logs.index'), { status: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Comunicaciones - Bandeja de Salida</h2>}>
            <Head title="Logs de Correos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CommsSubnav />
                    
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <header className="mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Historial de Envíos (Logs)</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Revisa el estado de todos los correos transaccionales enviados por el sistema.
                                </p>
                            </div>
                            <div>
                                <select 
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="sent">Enviados</option>
                                    <option value="queued">En Cola / Pendientes</option>
                                    <option value="failed">Fallidos</option>
                                </select>
                            </div>
                        </header>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plantilla (Key)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles / Error</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.to}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{log.template_key}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
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
                                            <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                No hay registros que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            {logs.links && logs.links.length > 3 && (
                                <div className="flex flex-wrap -mb-1">
                                    {logs.links.map((link, k) => (
                                        <div key={k} className="mb-1 mr-1">
                                            {link.url === null ? (
                                                <div
                                                    className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <Link
                                                    className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${
                                                        link.active ? 'bg-indigo-500 text-white' : 'bg-white'
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}