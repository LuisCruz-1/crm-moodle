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
import Card from '@/Components/Card';
import { ShieldCheckIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

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
        <AuthenticatedLayout header="Configuración · Roles y Permisos">
            <Head title="Configuración - Roles y Permisos" />

            <div className="space-y-6">
                <SettingsSubnav />
                
                <Card className="p-0 overflow-hidden border border-surface-200">
                    <div className="p-6 border-b border-surface-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary-100 p-2 rounded-lg">
                                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-surface-900">Gestión de Roles y Permisos</h3>
                                <p className="mt-1 text-sm text-surface-500">
                                    Administra los roles del sistema y asigna permisos específicos a cada uno.
                                </p>
                            </div>
                        </div>
                        <PrimaryButton onClick={openCreateModal} className="shrink-0 flex items-center gap-1.5">
                            <PlusIcon className="h-5 w-5" />
                            <span>Nuevo Rol</span>
                        </PrimaryButton>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-surface-200">
                            <thead className="bg-surface-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Rol</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Permisos Asignados</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-surface-100">
                                {roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">{role.name}</td>
                                        <td className="px-6 py-4 text-sm text-surface-500 max-w-xl">
                                            <div className="flex flex-wrap gap-1.5">
                                                {role.permissions.map(permission => (
                                                    <span key={permission.id} title={permission.description} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200 cursor-help transition-colors hover:bg-green-100">
                                                        {permission.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(role)} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50 transition-colors" title="Editar">
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                {role.name !== 'superadmin' && (
                                                    <button onClick={() => deleteRole(role)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Modal show={isModalOpen} onClose={closeModals}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
                        <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                        {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                    </h2>

                    <div className="space-y-6">
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
                            <InputLabel value="Permisos" className="mb-3" />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-surface-50 p-4 rounded-xl border border-surface-200">
                                {permissions.map(permission => (
                                    <div key={permission.id} className="relative flex items-start p-2 hover:bg-white rounded-lg transition-colors">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id={`permission-${permission.id}`}
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                                                checked={data.permissions.includes(permission.name) || editingRole?.name === 'superadmin'}
                                                onChange={(e) => handlePermissionChange(e, permission.name)}
                                                disabled={editingRole?.name === 'superadmin'}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor={`permission-${permission.id}`} className="font-medium text-surface-900 cursor-pointer">
                                                {permission.name}
                                            </label>
                                            <p className="text-surface-500 text-xs mt-0.5 leading-relaxed">{permission.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.permissions} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-surface-100">
                        <SecondaryButton onClick={closeModals}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Guardar Cambios
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
