import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Crons({ crons }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        moodle_sync_interval: crons.moodle_sync_interval || '6',
        finance_mark_overdue_time: crons.finance_mark_overdue_time || '00:05',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.crons.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tareas Programadas (Crons)</h2>}>
            <Head title="Configuración - Crons" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="mt-6">
                            <section className="bg-white">
                                <header className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">Automatización y Tareas en Segundo Plano</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Configura la frecuencia y horarios en los que el sistema ejecuta sus tareas automatizadas.
                                    </p>
                                </header>

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="border p-4 rounded-md">
                                            <h3 className="font-semibold text-gray-800 mb-3">Sincronización Moodle</h3>
                                            <InputLabel htmlFor="moodle_sync_interval" value="Intervalo de sincronización (Horas)" />
                                            <TextInput
                                                id="moodle_sync_interval"
                                                type="number"
                                                min="1"
                                                max="72"
                                                className="mt-1 block w-full"
                                                value={data.moodle_sync_interval}
                                                onChange={(e) => setData('moodle_sync_interval', e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Cada cuántas horas se ejecuta la sincronización de alumnos, cursos y cohortes de manera automática. Ej: 6.</p>
                                            <InputError className="mt-2" message={errors.moodle_sync_interval} />
                                        </div>

                                        <div className="border p-4 rounded-md">
                                            <h3 className="font-semibold text-gray-800 mb-3">Motor Financiero (Morosidad)</h3>
                                            <InputLabel htmlFor="finance_mark_overdue_time" value="Hora de ejecución diaria (HH:mm)" />
                                            <TextInput
                                                id="finance_mark_overdue_time"
                                                type="time"
                                                className="mt-1 block w-full"
                                                value={data.finance_mark_overdue_time}
                                                onChange={(e) => setData('finance_mark_overdue_time', e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Hora exacta a la que el sistema revisará las cuotas vencidas y suspenderá a los estudiantes en Moodle. Ej: 00:05.</p>
                                            <InputError className="mt-2" message={errors.finance_mark_overdue_time} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-6">
                                        <PrimaryButton disabled={processing}>Guardar Configuración</PrimaryButton>
                                        {recentlySuccessful && <p className="text-sm text-green-600">Configuración de crons guardada.</p>}
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
