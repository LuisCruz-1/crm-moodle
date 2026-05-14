import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import Card from '@/Components/Card';
import { ClockIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

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
        <AuthenticatedLayout header="Configuración · Tareas Programadas (Crons)">
            <Head title="Configuración - Crons" />

            <div className="space-y-6">
                <SettingsSubnav />
                
                <Card>
                    <header className="mb-6 flex items-center space-x-3 border-b border-surface-200 pb-4">
                        <div className="bg-primary-100 p-2 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-surface-900">Automatización y Tareas en Segundo Plano</h2>
                            <p className="mt-1 text-sm text-surface-500">
                                Configura la frecuencia y horarios en los que el sistema ejecuta sus tareas automatizadas.
                            </p>
                        </div>
                    </header>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="border border-surface-200 p-5 rounded-xl bg-surface-50 hover:border-primary-300 transition-colors">
                                <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
                                    <ArrowPathIcon className="h-5 w-5 text-primary-500" />
                                    Sincronización Moodle
                                </h3>
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
                                <p className="text-xs text-surface-500 mt-3 leading-relaxed">Cada cuántas horas se ejecuta la sincronización de alumnos, cursos y cohortes de manera automática. Ej: 6.</p>
                                <InputError className="mt-2" message={errors.moodle_sync_interval} />
                            </div>

                            <div className="border border-surface-200 p-5 rounded-xl bg-surface-50 hover:border-primary-300 transition-colors">
                                <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
                                    <CurrencyDollarIcon className="h-5 w-5 text-primary-500" />
                                    Motor Financiero (Morosidad)
                                </h3>
                                <InputLabel htmlFor="finance_mark_overdue_time" value="Hora de ejecución diaria (HH:mm)" />
                                <TextInput
                                    id="finance_mark_overdue_time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.finance_mark_overdue_time}
                                    onChange={(e) => setData('finance_mark_overdue_time', e.target.value)}
                                    required
                                />
                                <p className="text-xs text-surface-500 mt-3 leading-relaxed">Hora exacta a la que el sistema revisará las cuotas vencidas y suspenderá a los estudiantes en Moodle. Ej: 00:05.</p>
                                <InputError className="mt-2" message={errors.finance_mark_overdue_time} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-8 pt-4 border-t border-surface-200">
                            {recentlySuccessful && <p className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Configuración guardada correctamente.</p>}
                            <PrimaryButton disabled={processing}>Guardar Configuración</PrimaryButton>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
