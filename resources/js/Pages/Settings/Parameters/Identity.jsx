import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import { useState } from 'react';
import BrandingForm from './Partials/BrandingForm';
import CurrenciesTable from './Partials/CurrenciesTable';
import PaymentMethodsTable from './Partials/PaymentMethodsTable';
import PaymentTypesTable from './Partials/PaymentTypesTable';

export default function Identity({ branding }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Identidad Visual</h2>}>
            <Head title="Configuración - Identidad" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="mt-6">
                            <BrandingForm branding={branding} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
