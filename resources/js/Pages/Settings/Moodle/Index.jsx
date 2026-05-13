import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ config, sync }) {
    let stats = null;
    try {
        stats = sync?.stats ? JSON.parse(sync.stats) : null;
    } catch (e) {
        stats = null;
    }

    const form = useForm({
        url: config?.url ?? '',
        token: '',
        sso_client_id: config?.sso_client_id ?? '',
        sso_client_secret: '',
        sync_interval_hours: config?.sync_interval_hours ?? 6,
        sync_courses_limit: config?.sync_courses_limit ?? 0,
        student_role_id: config?.student_role_id ?? 5,
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
                            <div>Paso: {sync?.step ?? '—'}</div>
                            <div>Solicitado: {sync?.requested_at ?? '—'}</div>
                            <div>Última: {sync?.last_sync_at ?? '—'}</div>
                            <div>Inicio: {sync?.started_at ?? '—'}</div>
                            <div>Fin: {sync?.finished_at ?? '—'}</div>
                            {stats ? (
                                <div>
                                    Totales: categorías {stats.categories ?? 0}, cursos {stats.courses ?? 0}, cohortes {stats.cohorts ?? 0}, usuarios {stats.users ?? 0}
                                </div>
                            ) : null}
                            {sync?.error ? <div className="text-red-600">Error: {sync.error}</div> : null}
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Guía rápida (Moodle)</div>
                        <div className="mt-3 space-y-4 text-sm text-gray-800">
                            <div className="font-medium">1) Activar Web Services (REST)</div>
                            <div>
                                En Moodle: Site administration → Server → Web services → Manage protocols → habilitar REST.
                                Luego: Site administration → Server → Web services → Web services overview → habilitar Web services.
                            </div>

                            <div className="font-medium">2) Crear el servicio y habilitar funciones</div>
                            <div>
                                Site administration → Server → Web services → External services → Add.
                                En “Functions” agregar como mínimo:
                                <div className="mt-2 rounded-md border bg-gray-50 p-3 font-mono text-xs">
                                    core_course_get_categories<br />
                                    core_course_get_courses<br />
                                    core_group_get_course_groups<br />
                                    core_enrol_get_enrolled_users
                                </div>
                                Para funciones del CRM (acciones futuras desde esta plataforma) agrega también:
                                <div className="mt-2 rounded-md border bg-gray-50 p-3 font-mono text-xs">
                                    core_user_get_users_by_field<br />
                                    core_user_create_users<br />
                                    enrol_manual_enrol_users<br />
                                    enrol_manual_unenrol_users<br />
                                    core_group_add_group_members<br />
                                    core_group_delete_group_members
                                </div>
                                Si al crear usuarios te sale “accessexception”, revisa que el usuario del token tenga permisos/capabilities para crear usuarios.
                            </div>

                            <div className="font-medium">3) Generar el token</div>
                            <div>
                                Site administration → Server → Web services → Manage tokens → Create token.
                                Usa un usuario con permisos suficientes para ver cursos/grupos/inscritos.
                            </div>

                            <div className="font-medium">4) URL de Moodle</div>
                            <div>
                                Usa la URL base de tu Moodle (ej: https://tudominio.com o https://tudominio.com/moodle).
                                El endpoint REST lo arma el sistema automáticamente.
                            </div>

                            <div className="font-medium">5) SSO Client ID / Secret (opcional)</div>
                            <div>
                                Si usarás SSO vía OAuth2/OpenID Connect, normalmente se obtiene en:
                                Site administration → Server → OAuth 2 services (o el plugin de OpenID Connect) al crear una credencial.
                                Si no usarás SSO ahora, puedes dejarlo vacío.
                            </div>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Role ID estudiante (Moodle)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={form.data.student_role_id}
                                        onChange={(e) => form.setData('student_role_id', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.student_role_id} />
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
