import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import SettingsSubnav from '@/Components/Settings/SettingsSubnav';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ roles, permissions }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        permissions: []
    });

    const openCreateModal = () => {
        setEditingRole(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (role) => {
        setEditingRole(role);
        setData({
            name: role.name,
            permissions: role.permissions.map(p => p.name)
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModals = () => {
        setIsModalOpen(false);
        reset();
    };

    const handlePermissionChange = (e, permissionName) => {
        if (e.target.checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingRole) {
            put(route('settings.roles.update', editingRole.id), {
                onSuccess: () => closeModals(),
            });
        } else {
            post(route('settings.roles.store'), {
                onSuccess: () => closeModals(),
            });
        }
    };

    const deleteRole = (role) => {
        if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
            destroy(route('settings.roles.destroy', role.id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Configuración del Sistema</h2>}>
            <Head title="Configuración - Roles y Permisos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Gestión de Roles y Permisos</h3>
                            <button onClick={openCreateModal} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                Nuevo Rol
                            </button>
                        </div>

                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Rol</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Permisos Asignados</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {roles.map((role) => (
                                        <tr key={role.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{role.name}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500 max-w-xl">
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map(permission => (
                                                        <span key={permission.id} title={permission.description} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 cursor-help">
                                                            {permission.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => openEditModal(role)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                                {role.name !== 'superadmin' && (
                                                    <button onClick={() => deleteRole(role)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModals}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre del Rol" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={editingRole?.name === 'superadmin'}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Permisos" />
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {permissions.map(permission => (
                                    <div key={permission.id} className="relative flex items-start">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id={`permission-${permission.id}`}
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                                                checked={data.permissions.includes(permission.name) || editingRole?.name === 'superadmin'}
                                                onChange={(e) => handlePermissionChange(e, permission.name)}
                                                disabled={editingRole?.name === 'superadmin'}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-900">
                                                {permission.name}
                                            </label>
                                            <p className="text-gray-500">{permission.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.permissions} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModals}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            Guardar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
