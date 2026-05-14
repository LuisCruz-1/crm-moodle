import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function CurrenciesTable({ currencies }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        symbol: '',
        exchange_rate: 1,
        is_base: false,
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
            code: item.code,
            symbol: item.symbol,
            exchange_rate: item.exchange_rate,
            is_base: item.is_base,
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
            put(route('settings.parameters.currencies.update', editingItem.id), {
                onSuccess: () => closeModals(),
            });
        } else {
            post(route('settings.parameters.currencies.store'), {
                onSuccess: () => closeModals(),
            });
        }
    };

    const deleteItem = (item) => {
        if (confirm('¿Eliminar esta moneda?')) {
            destroy(route('settings.parameters.currencies.destroy', item.id));
        }
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Monedas del Sistema</h2>
                    <p className="mt-1 text-sm text-gray-600">Configura las divisas disponibles y marca una como predeterminada.</p>
                </div>
                <button onClick={openCreateModal} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Nueva Moneda
                </button>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Código</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Símbolo</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tasa de Cambio</th>
                            <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Por defecto</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {currencies.map((item) => (
                            <tr key={item.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.code}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.symbol}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.exchange_rate}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                    {item.is_base ? (
                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Predeterminada</span>
                                    ) : '-'}
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{editingItem ? 'Editar Moneda' : 'Nueva Moneda'}</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre (Ej: Dólar Estadounidense)" />
                            <TextInput id="name" type="text" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="code" value="Código (Ej: USD)" />
                                <TextInput id="code" type="text" className="mt-1 block w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                                <InputError message={errors.code} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="symbol" value="Símbolo (Ej: $)" />
                                <TextInput id="symbol" type="text" className="mt-1 block w-full" value={data.symbol} onChange={(e) => setData('symbol', e.target.value)} required />
                                <InputError message={errors.symbol} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="exchange_rate" value="Tasa de Cambio (respecto a la base)" />
                            <div className="flex flex-col gap-1">
                                <TextInput id="exchange_rate" type="number" step="0.0001" className="mt-1 block w-full" value={data.exchange_rate} onChange={(e) => setData('exchange_rate', e.target.value)} required />
                                <p className="text-xs text-gray-500 mt-1">
                                    Ejemplo: Si tu moneda base (predeterminada) es USD y estás agregando EUR, y 1 USD equivale a 0.93 EUR, la tasa de cambio sería 0.93. Si esta es la moneda base, la tasa debe ser 1.
                                </p>
                            </div>
                            <InputError message={errors.exchange_rate} className="mt-2" />
                        </div>
                        <div className="flex items-center mt-4">
                            <input
                                id="is_base"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={data.is_base}
                                onChange={(e) => setData('is_base', e.target.checked)}
                            />
                            <label htmlFor="is_base" className="ml-2 block text-sm text-gray-900">
                                Establecer como moneda base/predeterminada
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