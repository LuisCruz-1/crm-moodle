import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        identity_doc: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('portal.login'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title="Portal del Estudiante - Iniciar Sesión" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Portal del Estudiante</h2>
                    <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder</p>
                </div>

                <form onSubmit={submit}>
                    <div>
                        <label htmlFor="identity_doc" className="block font-medium text-sm text-gray-700">
                            Documento de Identidad
                        </label>
                        <input
                            id="identity_doc"
                            type="text"
                            name="identity_doc"
                            value={data.identity_doc}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('identity_doc', e.target.value)}
                        />
                        {errors.identity_doc && (
                            <p className="text-sm text-red-600 mt-2">{errors.identity_doc}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="password" className="block font-medium text-sm text-gray-700">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600 mt-2">{errors.password}</p>
                        )}
                    </div>

                    <div className="block mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Mantener sesión iniciada</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ml-4"
                            disabled={processing}
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
