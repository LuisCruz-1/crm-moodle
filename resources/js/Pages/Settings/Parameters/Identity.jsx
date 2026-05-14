import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import Card from '@/Components/Card';
import BrandingForm from './Partials/BrandingForm';

export default function Identity({ branding }) {
    return (
        <AuthenticatedLayout header="Identidad Visual">
            <Head title="Configuración - Identidad" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <SettingsSubnav />
                    
                    <Card>
                        <BrandingForm branding={branding} />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
