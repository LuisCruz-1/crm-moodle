import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Métodos de Pago</h2>
                    <p className="mt-1 text-sm text-gray-500">Configura las formas en las que los alumnos pueden realizar los pagos (Transferencia, Yape, Tarjeta, etc.).</p>
                </div>
                <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2 w-full md:w-auto justify-center">
                    <PlusIcon className="w-5 h-5" />
                    Nuevo Método
                </PrimaryButton>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                        <tr>
                            <th className="py-4 pl-6 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="relative py-4 pl-3 pr-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {paymentMethods.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                                    {item.is_active ? (
                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Inactivo</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <SecondaryButton onClick={() => openEditModal(item)} className="!px-2 !py-1" title="Editar">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </SecondaryButton>
                                        <DangerButton onClick={() => deleteItem(item)} className="!px-2 !py-1" title="Eliminar">
                                            <TrashIcon className="w-4 h-4" />
                                        </DangerButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paymentMethods.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No hay métodos de pago configurados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal show={isModalOpen} onClose={closeModals}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">{editingItem ? 'Editar Método' : 'Nuevo Método'}</h2>
                    <div className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre del Método" />
                            <TextInput id="name" type="text" className="mt-1 block w-full" placeholder="Ej. Transferencia Bancaria" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div className="flex items-center mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500 cursor-pointer"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                Método Activo (Visible para los usuarios)
                            </label>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                        <SecondaryButton type="button" onClick={closeModals}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}