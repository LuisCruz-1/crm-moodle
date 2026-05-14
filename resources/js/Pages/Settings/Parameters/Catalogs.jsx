import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import { useState } from 'react';
import PaymentMethodsTable from './Partials/PaymentMethodsTable';
import PaymentTypesTable from './Partials/PaymentTypesTable';

export default function Catalogs({ paymentMethods, paymentTypes }) {
    const [activeTab, setActiveTab] = useState('payment_methods');

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Catálogos</h2>}>
            <Head title="Configuración - Catálogos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="mb-8 border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('payment_methods')}
                                    className={`${activeTab === 'payment_methods' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                                >
                                    Métodos de Pago
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment_types')}
                                    className={`${activeTab === 'payment_types' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                                >
                                    Tipos / Conceptos de Pago
                                </button>
                            </nav>
                        </div>

                        <div className="mt-6">
                            {activeTab === 'payment_methods' && <PaymentMethodsTable paymentMethods={paymentMethods} />}
                            {activeTab === 'payment_types' && <PaymentTypesTable paymentTypes={paymentTypes} />}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
