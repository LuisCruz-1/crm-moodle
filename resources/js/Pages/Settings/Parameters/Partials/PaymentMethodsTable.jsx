import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PaymentMethodsTable({ paymentMethods }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            name: item.name,
            is_active: item.is_active,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModals = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('settings.parameters.payment_methods.update', editingItem.id), {
                onSuccess: () => closeModals(),
            });
        } else {
            post(route('settings.parameters.payment_methods.store'), {
                onSuccess: () => closeModals(),
            });
        }
    };

    const deleteItem = (item) => {
        if (confirm('¿Eliminar este método de pago?')) {
            destroy(route('settings.parameters.payment_methods.destroy', item.id));
        }
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Métodos de Pago</h2>
                    <p className="mt-1 text-sm text-gray-600">Configura las formas en las que los alumnos pueden realizar los pagos (Transferencia, Yape, Tarjeta, etc.).</p>
                </div>
                <button onClick={openCreateModal} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Nuevo Método
                </button>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                            <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Estado</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {paymentMethods.map((item) => (
                            <tr key={item.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                    {item.is_active ? (
                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Inactivo</span>
                                    )}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                    <button onClick={() => deleteItem(item)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={isModalOpen} onClose={closeModals}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{editingItem ? 'Editar Método' : 'Nuevo Método'}</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre del Método" />
                            <TextInput id="name" type="text" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div className="flex items-center mt-4">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                Método Activo (Visible para los usuarios)
                            </label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModals}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>Guardar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}