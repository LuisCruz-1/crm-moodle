import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function BrandingForm({ branding }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_name: branding.app_name || '',
        currency_symbol: branding.currency_symbol || '$',
        currency_code: branding.currency_code || 'USD',
        logo: null,
        favicon: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.identity.branding'), {
            preserveScroll: true,
        });
    };

    return (
        <section className="bg-white">
            <header className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Identidad Visual y Ajustes Generales</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Actualiza el nombre, el logotipo principal, el ícono de pestaña (favicon) de tu sistema y la moneda por defecto.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="app_name" value="Nombre de la Plataforma" />
                        <TextInput
                            id="app_name"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.app_name}
                            onChange={(e) => setData('app_name', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.app_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="currency_symbol" value="Símbolo de Moneda (Ej: $, €, S/)" />
                        <TextInput
                            id="currency_symbol"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.currency_symbol}
                            onChange={(e) => setData('currency_symbol', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.currency_symbol} />
                    </div>

                    <div>
                        <InputLabel htmlFor="currency_code" value="Código de Moneda (Ej: USD, EUR, PEN)" />
                        <TextInput
                            id="currency_code"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.currency_code}
                            onChange={(e) => setData('currency_code', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.currency_code} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Logo Upload */}
                    <div>
                        <InputLabel value="Logotipo Principal (Recomendado: Horizontal, PNG/SVG)" />
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                            <div className="text-center">
                                {branding.app_logo ? (
                                    <img src={branding.app_logo} alt="Logo" className="mx-auto h-12 object-contain mb-4" />
                                ) : (
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                )}
                                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                        htmlFor="logo-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <span>Subir nuevo logo</span>
                                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={(e) => setData('logo', e.target.files[0])} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs leading-5 text-gray-600">{data.logo ? data.logo.name : 'PNG, JPG, SVG hasta 2MB'}</p>
                            </div>
                        </div>
                        <InputError className="mt-2" message={errors.logo} />
                    </div>

                    {/* Favicon Upload */}
                    <div>
                        <InputLabel value="Ícono de Pestaña - Favicon (Recomendado: Cuadrado, ICO/PNG)" />
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                            <div className="text-center">
                                {branding.app_favicon ? (
                                    <img src={branding.app_favicon} alt="Favicon" className="mx-auto h-12 w-12 object-contain mb-4" />
                                ) : (
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                )}
                                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                        htmlFor="favicon-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <span>Subir nuevo ícono</span>
                                        <input id="favicon-upload" name="favicon-upload" type="file" className="sr-only" onChange={(e) => setData('favicon', e.target.files[0])} accept="image/x-icon,image/png,image/svg+xml" />
                                    </label>
                                </div>
                                <p className="text-xs leading-5 text-gray-600">{data.favicon ? data.favicon.name : 'ICO, PNG hasta 1MB'}</p>
                            </div>
                        </div>
                        <InputError className="mt-2" message={errors.favicon} />
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <PrimaryButton disabled={processing}>Guardar Identidad Visual</PrimaryButton>
                    {recentlySuccessful && <p className="text-sm text-green-600">Identidad guardada.</p>}
                </div>
            </form>
        </section>
    );
}