import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Bienvenido de nuevo</h2>
                <p className="mt-2 text-sm text-surface-500">Ingresa a tu cuenta para continuar</p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-sm font-medium text-green-700 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" className="text-surface-700 font-medium" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full py-2.5"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="ejemplo@correo.com"
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <InputLabel htmlFor="password" value="Contraseña" className="text-surface-700 font-medium mb-0" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full py-2.5"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="text-primary-600 focus:ring-primary-500 transition-colors"
                        />
                        <span className="ms-2 text-sm text-surface-600 group-hover:text-surface-900 transition-colors">
                            Recordarme en este equipo
                        </span>
                    </label>
                </div>

                <div className="pt-4">
                    <PrimaryButton className="w-full justify-center py-3 text-base shadow-lg shadow-primary-500/30 group" disabled={processing}>
                        <span>Iniciar Sesión</span>
                        <ArrowRightOnRectangleIcon className="ml-2 -mr-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
