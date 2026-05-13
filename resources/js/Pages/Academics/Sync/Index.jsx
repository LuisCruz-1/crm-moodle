import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ sync }) {
    const run = () => {
        router.post(route('academics.sync.run'), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Académico · Sincronización Moodle</h2>}>
            <Head title="Académico · Sincronización Moodle" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-700">Estado</div>
                            <PrimaryButton onClick={run}>Sincronizar ahora</PrimaryButton>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-gray-800">
                            <div>Estado: {sync?.status ?? '—'}</div>
                            <div>Última: {sync?.last_sync_at ?? '—'}</div>
                            <div>Inicio: {sync?.started_at ?? '—'}</div>
                            <div>Fin: {sync?.finished_at ?? '—'}</div>
                            {sync?.error ? <div className="text-red-600">Error: {sync.error}</div> : null}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

