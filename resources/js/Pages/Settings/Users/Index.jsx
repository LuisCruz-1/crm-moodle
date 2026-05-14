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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Configuración del Sistema</h2>}>
            <Head title="Configuración - Usuarios" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <SettingsSubnav />
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Usuarios de la Plataforma (Staff)</h3>
                            <button onClick={openCreateModal} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                Nuevo Usuario
                            </button>
                        </div>

                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roles</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.roles.map(role => (
                                                    <span key={role.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-2">
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                                <button onClick={() => deleteUser(user)} className="text-red-600 hover:text-red-900">Eliminar</button>
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
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>

                    <div className="space-y-4">
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
                            <InputLabel value="Roles Asignados" />
                            <div className="mt-2 space-y-2">
                                {roles.map(role => (
                                    <div key={role.id} className="flex items-center">
                                        <input
                                            id={`role-${role.id}`}
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            checked={data.roles.includes(role.name)}
                                            onChange={(e) => handleRoleChange(e, role.name)}
                                        />
                                        <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900">
                                            {role.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.roles} className="mt-2" />
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
