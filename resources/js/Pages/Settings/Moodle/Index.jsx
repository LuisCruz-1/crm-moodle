import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import { CloudArrowUpIcon, BookOpenIcon, KeyIcon } from '@heroicons/react/24/outline';

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
        <AuthenticatedLayout header="Configuración · Integración Moodle">
            <Head title="Configuración - Moodle" />

            <div className="space-y-6">
                <SettingsSubnav />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Configuración de Conexión" icon={<KeyIcon className="h-6 w-6 text-primary-600" />}>
                            <form onSubmit={submit} className="space-y-6 mt-4">
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

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-surface-50 p-4 rounded-xl border border-surface-200">
                                    <div>
                                        <InputLabel value="SSO Client ID (opcional)" />
                                        <TextInput
                                            className="mt-1 block w-full bg-white"
                                            value={form.data.sso_client_id}
                                            onChange={(e) => form.setData('sso_client_id', e.target.value)}
                                        />
                                        <InputError className="mt-2" message={form.errors.sso_client_id} />
                                    </div>
                                    <div>
                                        <InputLabel value={`SSO Client Secret ${config?.has_sso_client_secret ? '(ya configurado)' : '(opcional)'}`} />
                                        <TextInput
                                            className="mt-1 block w-full bg-white"
                                            value={form.data.sso_client_secret}
                                            onChange={(e) => form.setData('sso_client_secret', e.target.value)}
                                            placeholder={config?.has_sso_client_secret ? 'Deja vacío para mantener' : 'Pega el secret'}
                                        />
                                        <InputError className="mt-2" message={form.errors.sso_client_secret} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                                    <div>
                                        <InputLabel value="Role ID estudiante" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.data.student_role_id}
                                            onChange={(e) => form.setData('student_role_id', e.target.value)}
                                        />
                                        <InputError className="mt-2" message={form.errors.student_role_id} />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-surface-200">
                                    <PrimaryButton disabled={form.processing}>Guardar Configuración</PrimaryButton>
                                </div>
                            </form>
                        </Card>

                        <Card className="border-l-4 border-l-primary-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <CloudArrowUpIcon className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-surface-900">Sincronización Manual</h3>
                                    <p className="text-sm text-surface-500">
                                        Fuerza una sincronización inmediata de Categorías, Cursos, Cohortes y Estudiantes desde Moodle hacia el CRM.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    router.post(route('settings.moodle.sync.run'), {}, { preserveScroll: true });
                                }}>
                                    <PrimaryButton type="submit" className="w-full sm:w-auto justify-center">Ejecutar Sincronización Ahora</PrimaryButton>
                                </form>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="Estado de sincronización">
                            <div className="mt-2 space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                                    <span className="text-sm font-medium text-surface-500">Estado</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        sync?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        sync?.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        sync?.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                        'bg-surface-100 text-surface-800'
                                    }`}>
                                        {sync?.status ?? '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                                    <span className="text-sm font-medium text-surface-500">Paso actual</span>
                                    <span className="text-sm text-surface-900">{sync?.step ?? '—'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                                    <span className="text-sm font-medium text-surface-500">Solicitado</span>
                                    <span className="text-sm text-surface-900">{sync?.requested_at ? new Date(sync.requested_at).toLocaleString() : '—'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                                    <span className="text-sm font-medium text-surface-500">Última ejecución</span>
                                    <span className="text-sm text-surface-900">{sync?.last_sync_at ? new Date(sync.last_sync_at).toLocaleString() : '—'}</span>
                                </div>
                                
                                {stats && (
                                    <div className="pt-4 pb-2">
                                        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Totales Sincronizados</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-surface-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-primary-600">{stats.categories ?? 0}</div>
                                                <div className="text-xs text-surface-500">Categorías</div>
                                            </div>
                                            <div className="bg-surface-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-primary-600">{stats.courses ?? 0}</div>
                                                <div className="text-xs text-surface-500">Cursos</div>
                                            </div>
                                            <div className="bg-surface-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-primary-600">{stats.cohorts ?? 0}</div>
                                                <div className="text-xs text-surface-500">Cohortes</div>
                                            </div>
                                            <div className="bg-surface-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-primary-600">{stats.users ?? 0}</div>
                                                <div className="text-xs text-surface-500">Usuarios</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {sync?.error && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                        <span className="font-semibold block mb-1">Error reportado:</span>
                                        {sync.error}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card title="Guía rápida" icon={<BookOpenIcon className="h-6 w-6 text-primary-600" />}>
                            <div className="mt-4 space-y-6 text-sm text-surface-600">
                                <div>
                                    <div className="font-semibold text-surface-900 mb-1">1) Activar Web Services (REST)</div>
                                    <p>En Moodle: Site administration → Server → Web services → Manage protocols → habilitar REST.</p>
                                    <p>Luego: Site administration → Server → Web services → Web services overview → habilitar Web services.</p>
                                </div>

                                <div>
                                    <div className="font-semibold text-surface-900 mb-1">2) Crear servicio y funciones</div>
                                    <p>Site administration → Server → Web services → External services → Add.</p>
                                    <div className="mt-2 rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-xs leading-relaxed text-surface-700">
                                        core_course_get_categories<br />
                                        core_course_get_courses<br />
                                        core_group_get_course_groups<br />
                                        core_enrol_get_enrolled_users<br />
                                        core_user_get_users_by_field<br />
                                        core_user_create_users<br />
                                        core_user_update_users<br />
                                        enrol_manual_enrol_users<br />
                                        enrol_manual_unenrol_users<br />
                                        core_group_add_group_members<br />
                                        core_group_delete_group_members
                                    </div>
                                </div>

                                <div>
                                    <div className="font-semibold text-surface-900 mb-1">3) Generar el token</div>
                                    <p>Site administration → Server → Web services → Manage tokens → Create token.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
