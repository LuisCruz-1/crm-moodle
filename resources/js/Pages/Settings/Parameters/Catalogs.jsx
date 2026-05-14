import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import Card from '@/Components/Card';
import { useState } from 'react';
import PaymentMethodsTable from './Partials/PaymentMethodsTable';
import PaymentTypesTable from './Partials/PaymentTypesTable';

export default function Catalogs({ paymentMethods, paymentTypes }) {
    const [activeTab, setActiveTab] = useState('payment_methods');

    return (
        <AuthenticatedLayout header="Catálogos">
            <Head title="Configuración - Catálogos" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <SettingsSubnav />
                    
                    <Card className="!p-0">
                        <div className="border-b border-gray-200 bg-gray-50/50 px-6 pt-2">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('payment_methods')}
                                    className={`${activeTab === 'payment_methods' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                                >
                                    Métodos de Pago
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment_types')}
                                    className={`${activeTab === 'payment_types' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                                >
                                    Tipos / Conceptos de Pago
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'payment_methods' && <PaymentMethodsTable paymentMethods={paymentMethods} />}
                            {activeTab === 'payment_types' && <PaymentTypesTable paymentTypes={paymentTypes} />}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
