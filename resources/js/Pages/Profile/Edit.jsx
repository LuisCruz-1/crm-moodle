import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import Card from '@/Components/Card';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout header="Mi Perfil">
            <Head title="Perfil" />

            <div className="space-y-6">
                <Card>
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </Card>

                <Card>
                    <UpdatePasswordForm className="max-w-xl" />
                </Card>

                <Card>
                    <DeleteUserForm className="max-w-xl" />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
