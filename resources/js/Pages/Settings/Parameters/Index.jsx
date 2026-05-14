import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';

export default function Index() {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Configuración del Sistema</h2>}>
            <Head title="Configuración - Parámetros" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Parámetros del Sistema</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Aquí podrás configurar variables globales y parámetros generales del CRM Académico.
                            </p>
                        </div>
                        
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">En Construcción</h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>Esta sección estará disponible en futuras actualizaciones.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
