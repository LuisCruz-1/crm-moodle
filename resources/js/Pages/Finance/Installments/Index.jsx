import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FinanceSubnav from '@/Components/FinanceSubnav';

export default function Index({ installments, filters, paymentMethods }) {
    const [selectedInst, setSelectedInst] = useState(null);
    const [action, setAction] = useState(null); // 'edit', 'discount', 'pay'
    
    // For edit
    const [dueDate, setDueDate] = useState('');
    const [amount, setAmount] = useState('');
    
    // For discount
    const [discountAmount, setDiscountAmount] = useState('');
    const [reason, setReason] = useState('');

    // For pay
    const [payAmount, setPayAmount] = useState('');
    const [paymentMethodId, setPaymentMethodId] = useState('');
    const [paidAt, setPaidAt] = useState('');

    const openModal = (inst, type) => {
        setSelectedInst(inst);
        setAction(type);
        if (type === 'edit') {
            setDueDate(inst.due_date.split('T')[0]);
            setAmount(inst.amount);
        } else if (type === 'discount') {
            setDiscountAmount('');
            setReason('');
        } else if (type === 'pay') {
            setPayAmount(inst.balance);
            setPaymentMethodId('');
            setPaidAt(new Date().toISOString().split('T')[0]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (action === 'edit') {
            router.put(route('finance.installments.update', selectedInst.id), {
                due_date: dueDate,
                amount: amount,
            }, { onSuccess: () => setSelectedInst(null) });
        } else if (action === 'discount') {
            router.post(route('finance.installments.discount', selectedInst.id), {
                discount_amount: discountAmount,
                reason: reason,
            }, { onSuccess: () => setSelectedInst(null) });
        } else if (action === 'pay') {
            router.post(route('finance.installments.pay', selectedInst.id), {
                amount: payAmount,
                payment_method_id: paymentMethodId,
                paid_at: paidAt,
            }, { onSuccess: () => setSelectedInst(null) });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Finanzas</h2>}>
            <Head title="Cuotas" />

            <FinanceSubnav />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 border-b flex justify-between items-center">
                            <select 
                                className="rounded-md border-gray-300 shadow-sm"
                                value={filters?.status ?? ''}
                                onChange={e => router.get(route('finance.installments.index'), { status: e.target.value })}
                            >
                                <option value="">Pendientes y Vencidas</option>
                                <option value="pending">Pendientes</option>
                                <option value="overdue">Vencidas</option>
                                <option value="partial">Abono Parcial</option>
                                <option value="paid">Pagadas</option>
                            </select>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante / Curso</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Vencimiento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto Orig.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Saldo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {(installments?.data ?? []).map((inst) => (
                                    <tr key={inst.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{inst.student?.first_name} {inst.student?.last_name}</div>
                                            <div className="text-xs text-gray-500">{inst.enrollment?.course?.fullname}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{new Date(inst.due_date).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">${inst.amount}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">${inst.balance}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs ${inst.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                                                {inst.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            {inst.status !== 'paid' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => openModal(inst, 'edit')} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                    <button onClick={() => openModal(inst, 'discount')} className="text-orange-600 hover:text-orange-900">Desc.</button>
                                                    <button onClick={() => openModal(inst, 'pay')} className="text-green-600 hover:text-green-900">Pagar</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={!!selectedInst} onClose={() => setSelectedInst(null)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {action === 'edit' && 'Editar Cuota'}
                        {action === 'discount' && 'Aplicar Descuento'}
                        {action === 'pay' && 'Registrar Pago Manual'}
                    </h2>
                    
                    {action === 'edit' && (
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Fecha de Vencimiento" />
                                <TextInput type="date" className="mt-1 block w-full" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Monto Original" />
                                <TextInput type="number" step="0.01" className="mt-1 block w-full" value={amount} onChange={e => setAmount(e.target.value)} required />
                                <p className="text-xs text-gray-500 mt-1">El saldo se recalculará proporcionalmente.</p>
                            </div>
                        </div>
                    )}

                    {action === 'discount' && (
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Monto del Descuento" />
                                <TextInput type="number" step="0.01" max={selectedInst?.balance} className="mt-1 block w-full" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Motivo (para auditoría)" />
                                <TextInput className="mt-1 block w-full" value={reason} onChange={e => setReason(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    {action === 'pay' && (
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Monto Pagado" />
                                <TextInput type="number" step="0.01" max={selectedInst?.balance} className="mt-1 block w-full" value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Fecha de Pago" />
                                <TextInput type="date" className="mt-1 block w-full" value={paidAt} onChange={e => setPaidAt(e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Método de Pago" />
                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} required>
                                    <option value="">Seleccione...</option>
                                    {(paymentMethods ?? []).map(pm => (
                                        <option key={pm.id} value={pm.id}>{pm.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setSelectedInst(null)} className="mr-3 text-sm text-gray-600">Cancelar</button>
                        <PrimaryButton>Guardar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}