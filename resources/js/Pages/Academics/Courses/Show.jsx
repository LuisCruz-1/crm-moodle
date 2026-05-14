import AcademicsSubnav from '@/Components/AcademicsSubnav';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { InformationCircleIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline';

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
        <AuthenticatedLayout header={`Académico · ${course.fullname}`}>
            <Head title={`Académico · ${course.fullname}`} />

            <div className="space-y-6">
                <AcademicsSubnav />

                <Card title="Cohortes (Grupos)" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-surface-200">
                            <thead className="bg-surface-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Moodle ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-surface-100">
                                {(course?.cohorts ?? []).map((cohort) => (
                                    <tr key={cohort.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">{cohort.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">{cohort.moodle_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(course?.cohorts ?? []).length === 0 && (
                            <div className="text-center py-8 text-sm text-surface-500">Sin cohortes asignadas.</div>
                        )}
                    </div>
                </Card>

                <Card title="Plantilla de Pagos">
                    {!activePlan ? (
                        <form onSubmit={submitCreatePlan} className="mt-4 flex flex-col gap-4 md:flex-row md:items-end bg-surface-50 p-4 rounded-lg border border-surface-200">
                            <div className="flex-1">
                                <InputLabel value="Nombre del plan" />
                                <TextInput className="mt-1 block w-full" value={createPlan.data.name} onChange={(e) => createPlan.setData('name', e.target.value)} />
                                <InputError className="mt-2" message={createPlan.errors.name} />
                            </div>
                            <PrimaryButton disabled={createPlan.processing}>Crear plan</PrimaryButton>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 text-sm font-medium text-primary-700 bg-primary-50 p-3 rounded-lg border border-primary-100">
                                <InformationCircleIcon className="h-5 w-5" />
                                <span>Activo: {activePlan.name} (v{activePlan.version})</span>
                            </div>

                            <div className="space-y-3">
                                {(activePlan.items ?? []).map((item, idx) => (
                                    <div key={item.id} className="flex flex-col gap-4 rounded-xl border border-surface-200 bg-white p-4 md:flex-row md:items-end shadow-sm hover:border-primary-300 transition-colors">
                                        <div className="flex-1">
                                            <InputLabel value="Tipo" />
                                            <SelectInput
                                                className="mt-1 w-full"
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
                                            </SelectInput>
                                        </div>

                                        <div className="w-full md:w-24">
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

                                        <div className="w-full md:w-32">
                                            <InputLabel value="Valor unit." />
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

                                        <div className="w-full md:w-36">
                                            <InputLabel className="flex items-center">
                                                Frecuencia
                                                <span className="ml-1 cursor-help text-surface-400" title="Unidad de tiempo para generar cuotas (Ej: 'days', 'weeks', 'months', 'years').">
                                                    &#9432;
                                                </span>
                                            </InputLabel>
                                            <SelectInput
                                                className="mt-1 w-full"
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
                                            </SelectInput>
                                        </div>

                                        <div className="w-full md:w-24">
                                            <InputLabel className="flex items-center">
                                                Intervalo
                                                <span className="ml-1 cursor-help text-surface-400" title="Cantidad de tiempo (Ej: Si es 1 mes, pon 1. Si es bimestral, pon 2).">
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

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                disabled={idx === 0}
                                                onClick={() => reorderItems(activePlan.items ?? [], idx, idx - 1)}
                                            >
                                                <ArrowUpIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                disabled={idx === (activePlan.items?.length ?? 0) - 1}
                                                onClick={() => reorderItems(activePlan.items ?? [], idx, idx + 1)}
                                            >
                                                <ArrowDownIcon className="h-5 w-5" />
                                            </button>
                                            <button 
                                                type="button" 
                                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors" 
                                                onClick={() => deleteItem(item.id)}
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(activePlan.items ?? []).length === 0 && (
                                    <div className="text-center py-8 text-sm text-surface-500 border-2 border-dashed border-surface-200 rounded-xl">
                                        Aún no hay reglas en este plan.
                                    </div>
                                )}
                            </div>

                            <form onSubmit={submitAddItem} className="rounded-xl border border-surface-200 bg-surface-50 p-5 mt-6">
                                <h4 className="text-sm font-semibold text-surface-700 mb-4">Agregar nueva regla de pago</h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                    <div className="md:col-span-2">
                                        <InputLabel value="Tipo de pago" />
                                        <SelectInput
                                            className="mt-1 w-full"
                                            value={addItem.data.payment_type_id}
                                            onChange={(e) => addItem.setData('payment_type_id', e.target.value)}
                                        >
                                            {(paymentTypes ?? []).map((pt) => (
                                                <option key={pt.id} value={pt.id}>
                                                    {pt.name}
                                                </option>
                                            ))}
                                        </SelectInput>
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
                                        <InputLabel className="flex items-center">
                                            Frecuencia
                                            <span className="ml-1 cursor-help text-surface-400" title="Unidad de tiempo para generar cuotas (Ej: 'days', 'weeks', 'months', 'years').">
                                                &#9432;
                                            </span>
                                        </InputLabel>
                                        <SelectInput
                                            className="mt-1 w-full"
                                            value={addItem.data.frequency}
                                            onChange={(e) => addItem.setData('frequency', e.target.value)}
                                        >
                                            <option value="">Ninguna (Pago Único)</option>
                                            <option value="days">Días</option>
                                            <option value="weeks">Semanas</option>
                                            <option value="months">Meses</option>
                                            <option value="years">Años</option>
                                        </SelectInput>
                                        <InputError className="mt-2" message={addItem.errors.frequency} />
                                    </div>
                                    <div>
                                        <InputLabel className="flex items-center">
                                            Intervalo
                                            <span className="ml-1 cursor-help text-surface-400" title="Cantidad de tiempo (Ej: Si es 1 mes, pon 1. Si es bimestral, pon 2).">
                                                &#9432;
                                            </span>
                                        </InputLabel>
                                        <TextInput type="number" min="1" className="mt-1 block w-full" value={addItem.data.interval_count} onChange={(e) => addItem.setData('interval_count', e.target.value)} />
                                        <InputError className="mt-2" message={addItem.errors.interval_count} />
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-end">
                                    <PrimaryButton disabled={addItem.processing}>Agregar regla</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

