import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState, useEffect } from 'react';

export default function Index({ parameters }) {
    // We group parameters by 'group'
    const groupedParameters = parameters.reduce((acc, param) => {
        if (!acc[param.group]) {
            acc[param.group] = [];
        }
        acc[param.group].push(param);
        return acc;
    }, {});

    const { data, setData, put, processing, recentlySuccessful } = useForm({
        settings: parameters.map(p => ({
            id: p.id,
            value: p.is_encrypted ? '' : (p.value || '') // Don't pre-fill encrypted values
        }))
    });

    const handleValueChange = (id, newValue) => {
        setData('settings', data.settings.map(s => 
            s.id === id ? { ...s, value: newValue } : s
        ));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.parameters.update'));
    };

    const formatKeyToName = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Configuración del Sistema</h2>}>
            <Head title="Configuración - Parámetros" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Parámetros del Sistema</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Aquí podrás configurar variables globales y parámetros generales del CRM Académico.
                            </p>
                        </div>
                        
                        <form onSubmit={submit} className="space-y-8">
                            {Object.keys(groupedParameters).length === 0 ? (
                                <div className="rounded-md bg-yellow-50 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">No hay parámetros definidos</h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>Actualmente no existen parámetros globales configurados en la base de datos.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                Object.keys(groupedParameters).map(group => (
                                    <div key={group} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 capitalize">{group}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {groupedParameters[group].map(param => {
                                                const currentSetting = data.settings.find(s => s.id === param.id);
                                                return (
                                                    <div key={param.id}>
                                                        <InputLabel htmlFor={`param-${param.id}`} value={formatKeyToName(param.key)} />
                                                        <TextInput
                                                            id={`param-${param.id}`}
                                                            type={param.is_encrypted ? "password" : "text"}
                                                            className="mt-1 block w-full"
                                                            value={currentSetting?.value || ''}
                                                            onChange={(e) => handleValueChange(param.id, e.target.value)}
                                                            placeholder={param.is_encrypted ? "••••••••" : ""}
                                                        />
                                                        {param.is_encrypted && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Este valor está encriptado. Déjalo en blanco si no deseas cambiarlo.
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}

                            {Object.keys(groupedParameters).length > 0 && (
                                <div className="flex items-center gap-4 mt-6">
                                    <PrimaryButton disabled={processing}>Guardar Parámetros</PrimaryButton>
                                    {recentlySuccessful && <p className="text-sm text-green-600">Guardado correctamente.</p>}
                                </div>
                            )}
                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
