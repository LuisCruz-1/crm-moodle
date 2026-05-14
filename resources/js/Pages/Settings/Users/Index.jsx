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
import { UsersIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Index({ users, roles }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        roles: []
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            roles: user.roles.map(r => r.name)
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModals = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleRoleChange = (e, roleName) => {
        if (e.target.checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter(r => r !== roleName));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('settings.users.update', editingUser.id), {
                onSuccess: () => closeModals(),
            });
        } else {
            post(route('settings.users.store'), {
                onSuccess: () => closeModals(),
            });
        }
    };

    const deleteUser = (user) => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            destroy(route('settings.users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout header="Configuración · Usuarios">
            <Head title="Configuración - Usuarios" />

            <div className="space-y-6">
                <SettingsSubnav />
                
                <Card className="p-0 overflow-hidden border border-surface-200">
                    <div className="p-6 border-b border-surface-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary-100 p-2 rounded-lg">
                                <UsersIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-surface-900">Usuarios de la Plataforma (Staff)</h3>
                                <p className="mt-1 text-sm text-surface-500">
                                    Administra las cuentas del personal que accede al sistema CRM.
                                </p>
                            </div>
                        </div>
                        <PrimaryButton onClick={openCreateModal} className="shrink-0 flex items-center gap-1.5">
                            <PlusIcon className="h-5 w-5" />
                            <span>Nuevo Usuario</span>
                        </PrimaryButton>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-surface-200">
                            <thead className="bg-surface-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Roles</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-surface-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles.map(role => (
                                                    <span key={role.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(user)} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50 transition-colors" title="Editar">
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => deleteUser(user)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
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
                        <UsersIcon className="h-6 w-6 text-primary-600" />
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Correo Electrónico" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'} />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Roles Asignados" className="mb-3" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
                                {roles.map(role => (
                                    <div key={role.id} className="flex items-center p-2 hover:bg-white rounded-lg transition-colors">
                                        <input
                                            id={`role-${role.id}`}
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-600"
                                            checked={data.roles.includes(role.name)}
                                            onChange={(e) => handleRoleChange(e, role.name)}
                                        />
                                        <label htmlFor={`role-${role.id}`} className="ml-3 block text-sm font-medium text-surface-900 cursor-pointer">
                                            {role.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.roles} className="mt-2" />
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
