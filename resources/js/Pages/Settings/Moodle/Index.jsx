import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ config, sync }) {
    const form = useForm({
        url: config?.url ?? '',
        token: '',
        sso_client_id: config?.sso_client_id ?? '',
        sso_client_secret: '',
        sync_interval_hours: config?.sync_interval_hours ?? 6,
        sync_courses_limit: config?.sync_courses_limit ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('settings.moodle.update'), {
            preserveScroll: true,
            onSuccess: () => form.reset('token', 'sso_client_secret'),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Configuración · Integración Moodle</h2>}>
            <Head title="Configuración · Integración Moodle" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Estado de sincronización</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-800">
                            <div>Estado: {sync?.status ?? '—'}</div>
                            <div>Última: {sync?.last_sync_at ?? '—'}</div>
                            <div>Inicio: {sync?.started_at ?? '—'}</div>
                            <div>Fin: {sync?.finished_at ?? '—'}</div>
                            {sync?.error ? <div className="text-red-600">Error: {sync.error}</div> : null}
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel value="URL de Moodle" />
                                <TextInput className="mt-1 block w-full" value={form.data.url} onChange={(e) => form.setData('url', e.target.value)} />
                                <InputError className="mt-2" message={form.errors.url} />
                            </div>

                            <div>
                                <InputLabel value={`Token REST ${config?.has_token ? '(ya configurado)' : ''}`} />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.data.token}
                                    onChange={(e) => form.setData('token', e.target.value)}
                                    placeholder={config?.has_token ? 'Deja vacío para mantener' : 'Pega el token'}
                                />
                                <InputError className="mt-2" message={form.errors.token} />
                            </div>

                            <div>
                                <InputLabel value="SSO Client ID (opcional)" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.data.sso_client_id}
                                    onChange={(e) => form.setData('sso_client_id', e.target.value)}
                                />
                                <InputError className="mt-2" message={form.errors.sso_client_id} />
                            </div>

                            <div>
                                <InputLabel value={`SSO Client Secret ${config?.has_sso_client_secret ? '(ya configurado)' : '(opcional)'}`} />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.data.sso_client_secret}
                                    onChange={(e) => form.setData('sso_client_secret', e.target.value)}
                                    placeholder={config?.has_sso_client_secret ? 'Deja vacío para mantener' : 'Pega el secret'}
                                />
                                <InputError className="mt-2" message={form.errors.sso_client_secret} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Intervalo de sync (horas)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={form.data.sync_interval_hours}
                                        onChange={(e) => form.setData('sync_interval_hours', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.sync_interval_hours} />
                                </div>
                                <div>
                                    <InputLabel value="Límite de cursos (0 = sin límite)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={form.data.sync_courses_limit}
                                        onChange={(e) => form.setData('sync_courses_limit', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.sync_courses_limit} />
                                </div>
                            </div>

                            <PrimaryButton disabled={form.processing}>Guardar</PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

