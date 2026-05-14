import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommsSubnav from '@/Components/CommsSubnav';

export default function Index({ templates }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Comunicaciones - Plantillas</h2>}>
            <Head title="Plantillas de Correo" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CommsSubnav />
                    
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <header className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Plantillas de Correo Electrónico</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Gestiona los correos transaccionales que el sistema envía automáticamente.
                            </p>
                        </header>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto (Subject)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {templates.map((template) => (
                                        <tr key={template.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {template.is_active ? (
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Inactivo</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('comms.templates.edit', template.id)} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {templates.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                No hay plantillas registradas en el sistema.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}