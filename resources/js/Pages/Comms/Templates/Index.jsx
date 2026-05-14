import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommsSubnav from '@/Components/CommsSubnav';
import Card from '@/Components/Card';
import { EnvelopeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function Index({ templates }) {
    return (
        <AuthenticatedLayout header="Comunicaciones - Plantillas">
            <Head title="Plantillas de Correo" />

            <div className="space-y-6">
                <CommsSubnav />
                
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-surface-200 bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary-100 p-2 rounded-lg">
                                <EnvelopeIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-surface-900">Plantillas de Correo Electrónico</h2>
                                <p className="mt-1 text-sm text-surface-500">
                                    Gestiona los correos transaccionales que el sistema envía automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-surface-200">
                            <thead className="bg-surface-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Asunto (Subject)</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-surface-100">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">{template.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">{template.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            {template.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Activo</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Inactivo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('comms.templates.edit', template.id)} 
                                                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 transition-colors"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                                <span>Editar</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {templates.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 whitespace-nowrap text-sm text-center text-surface-500">
                                            No hay plantillas registradas en el sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}