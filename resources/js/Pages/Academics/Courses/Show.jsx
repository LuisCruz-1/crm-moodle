import AcademicsSubnav from '@/Components/AcademicsSubnav';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

function moveItem(list, fromIndex, toIndex) {
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

export default function Show({ course, activePlan, paymentTypes }) {
    const createPlan = useForm({ name: 'Plan principal' });
    const addItem = useForm({
        payment_type_id: paymentTypes?.[0]?.id ?? '',
        quantity: 1,
        unit_amount: 0,
        frequency: '',
        interval_count: '',
    });

    const submitCreatePlan = (e) => {
        e.preventDefault();
        createPlan.post(route('academics.courses.plans.store', course.id), { preserveScroll: true });
    };

    const submitAddItem = (e) => {
        e.preventDefault();
        addItem.post(route('academics.courses.plans.items.store', [course.id, activePlan.id]), {
            preserveScroll: true,
            onSuccess: () => addItem.reset('quantity', 'unit_amount', 'frequency', 'interval_count'),
        });
    };

    const updateItem = (itemId, data) => {
        router.put(route('academics.courses.plans.items.update', [course.id, activePlan.id, itemId]), data, { preserveScroll: true });
    };

    const deleteItem = (itemId) => {
        router.delete(route('academics.courses.plans.items.destroy', [course.id, activePlan.id, itemId]), { preserveScroll: true });
    };

    const reorderItems = (items, fromIndex, toIndex) => {
        const nextItems = moveItem(items, fromIndex, toIndex);
        router.post(
            route('academics.courses.plans.items.reorder', [course.id, activePlan.id]),
            { item_ids: nextItems.map((i) => i.id) },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Académico · {course.fullname}</h2>}>
            <Head title={`Académico · ${course.fullname}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <AcademicsSubnav />

                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Cohortes (Grupos)</div>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Moodle ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {(course?.cohorts ?? []).map((cohort) => (
                                        <tr key={cohort.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{cohort.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{cohort.moodle_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {(course?.cohorts ?? []).length === 0 ? <div className="mt-3 text-sm text-gray-500">Sin cohortes</div> : null}
                    </div>

                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Plantilla de pagos</div>

                        {!activePlan ? (
                            <form onSubmit={submitCreatePlan} className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
                                <div className="flex-1">
                                    <InputLabel value="Nombre del plan" />
                                    <TextInput className="mt-1 block w-full" value={createPlan.data.name} onChange={(e) => createPlan.setData('name', e.target.value)} />
                                    <InputError className="mt-2" message={createPlan.errors.name} />
                                </div>
                                <PrimaryButton disabled={createPlan.processing}>Crear plan</PrimaryButton>
                            </form>
                        ) : (
                            <div className="mt-4 space-y-6">
                                <div className="text-sm text-gray-800">
                                    Activo: {activePlan.name} (v{activePlan.version})
                                </div>

                                <div className="space-y-2">
                                    {(activePlan.items ?? []).map((item, idx) => (
                                        <div key={item.id} className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-end">
                                            <div className="flex-1">
                                                <InputLabel value="Tipo" />
                                                <select
                                                    className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                    value={item.payment_type_id}
                                                    onChange={(e) =>
                                                        updateItem(item.id, {
                                                            payment_type_id: Number(e.target.value),
                                                            quantity: item.quantity,
                                                            unit_amount: item.unit_amount,
                                                            frequency: item.frequency ?? '',
                                                            interval_count: item.interval_count ?? '',
                                                        })
                                                    }
                                                >
                                                    {(paymentTypes ?? []).map((pt) => (
                                                        <option key={pt.id} value={pt.id}>
                                                            {pt.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <InputLabel value="Cantidad" />
                                                <TextInput
                                                    className="mt-1 block w-full"
                                                    defaultValue={item.quantity}
                                                    onBlur={(e) =>
                                                        updateItem(item.id, {
                                                            payment_type_id: item.payment_type_id,
                                                            quantity: Number(e.target.value || 1),
                                                            unit_amount: item.unit_amount,
                                                            frequency: item.frequency ?? '',
                                                            interval_count: item.interval_count ?? '',
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <InputLabel value="Valor unitario" />
                                                <TextInput
                                                    className="mt-1 block w-full"
                                                    defaultValue={item.unit_amount}
                                                    onBlur={(e) =>
                                                        updateItem(item.id, {
                                                            payment_type_id: item.payment_type_id,
                                                            quantity: item.quantity,
                                                            unit_amount: Number(e.target.value || 0),
                                                            frequency: item.frequency ?? '',
                                                            interval_count: item.interval_count ?? '',
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <InputLabel>
                                                    Frecuencia (opc)
                                                    <span className="ml-1 cursor-help text-gray-400" title="Unidad de tiempo para generar cuotas (Ej: 'days', 'weeks', 'months', 'years').">
                                                        &#9432;
                                                    </span>
                                                </InputLabel>
                                                <select
                                                    className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                    defaultValue={item.frequency ?? ''}
                                                    onChange={(e) =>
                                                        updateItem(item.id, {
                                                            payment_type_id: item.payment_type_id,
                                                            quantity: item.quantity,
                                                            unit_amount: item.unit_amount,
                                                            frequency: e.target.value,
                                                            interval_count: item.interval_count ?? '',
                                                        })
                                                    }
                                                >
                                                    <option value="">Ninguna</option>
                                                    <option value="days">Días</option>
                                                    <option value="weeks">Semanas</option>
                                                    <option value="months">Meses</option>
                                                    <option value="years">Años</option>
                                                </select>
                                            </div>

                                            <div>
                                                <InputLabel>
                                                    Intervalo (opc)
                                                    <span className="ml-1 cursor-help text-gray-400" title="Cantidad de tiempo (Ej: Si es 1 mes, pon 1. Si es bimestral, pon 2).">
                                                        &#9432;
                                                    </span>
                                                </InputLabel>
                                                <TextInput
                                                    type="number"
                                                    min="1"
                                                    className="mt-1 block w-full"
                                                    defaultValue={item.interval_count ?? ''}
                                                    onBlur={(e) =>
                                                        updateItem(item.id, {
                                                            payment_type_id: item.payment_type_id,
                                                            quantity: item.quantity,
                                                            unit_amount: item.unit_amount,
                                                            frequency: item.frequency ?? '',
                                                            interval_count: e.target.value === '' ? '' : Number(e.target.value),
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                                    disabled={idx === 0}
                                                    onClick={() => reorderItems(activePlan.items ?? [], idx, idx - 1)}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                                    disabled={idx === (activePlan.items?.length ?? 0) - 1}
                                                    onClick={() => reorderItems(activePlan.items ?? [], idx, idx + 1)}
                                                >
                                                    ↓
                                                </button>
                                                <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => deleteItem(item.id)}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(activePlan.items ?? []).length === 0 ? <div className="text-sm text-gray-500">Aún no hay reglas.</div> : null}
                                </div>

                                <form onSubmit={submitAddItem} className="rounded-md border p-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                        <div className="md:col-span-2">
                                            <InputLabel value="Tipo de pago" />
                                            <select
                                                className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                value={addItem.data.payment_type_id}
                                                onChange={(e) => addItem.setData('payment_type_id', e.target.value)}
                                            >
                                                {(paymentTypes ?? []).map((pt) => (
                                                    <option key={pt.id} value={pt.id}>
                                                        {pt.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError className="mt-2" message={addItem.errors.payment_type_id} />
                                        </div>
                                        <div>
                                            <InputLabel value="Cantidad" />
                                            <TextInput className="mt-1 block w-full" value={addItem.data.quantity} onChange={(e) => addItem.setData('quantity', e.target.value)} />
                                            <InputError className="mt-2" message={addItem.errors.quantity} />
                                        </div>
                                        <div>
                                            <InputLabel value="Valor unitario" />
                                            <TextInput className="mt-1 block w-full" value={addItem.data.unit_amount} onChange={(e) => addItem.setData('unit_amount', e.target.value)} />
                                            <InputError className="mt-2" message={addItem.errors.unit_amount} />
                                        </div>
                                        <div>
                                            <InputLabel>
                                                Frecuencia
                                                <span className="ml-1 cursor-help text-gray-400" title="Unidad de tiempo para generar cuotas (Ej: 'days', 'weeks', 'months', 'years').">
                                                    &#9432;
                                                </span>
                                            </InputLabel>
                                            <select
                                                className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                value={addItem.data.frequency}
                                                onChange={(e) => addItem.setData('frequency', e.target.value)}
                                            >
                                                <option value="">Ninguna (Pago Único)</option>
                                                <option value="days">Días</option>
                                                <option value="weeks">Semanas</option>
                                                <option value="months">Meses</option>
                                                <option value="years">Años</option>
                                            </select>
                                            <InputError className="mt-2" message={addItem.errors.frequency} />
                                        </div>
                                        <div>
                                            <InputLabel>
                                                Intervalo
                                                <span className="ml-1 cursor-help text-gray-400" title="Cantidad de tiempo (Ej: Si es 1 mes, pon 1. Si es bimestral, pon 2).">
                                                    &#9432;
                                                </span>
                                            </InputLabel>
                                            <TextInput type="number" min="1" className="mt-1 block w-full" value={addItem.data.interval_count} onChange={(e) => addItem.setData('interval_count', e.target.value)} />
                                            <InputError className="mt-2" message={addItem.errors.interval_count} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <PrimaryButton disabled={addItem.processing}>Agregar regla</PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

