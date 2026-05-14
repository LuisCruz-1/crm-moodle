import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Card from '@/Components/Card';
import FinanceSubnav from '@/Components/FinanceSubnav';
import { BanknotesIcon, TagIcon, PencilSquareIcon, CurrencyDollarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ installments, filters, paymentMethods, courses }) {
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
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);

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
            setReference('');
            setNotes('');
            setReceiptFile(null);
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
                reference: reference,
                notes: notes,
                file: receiptFile,
            }, { onSuccess: () => setSelectedInst(null), forceFormData: true });
        }
    };

    return (
        <AuthenticatedLayout header="Finanzas">
            <Head title="Cuotas" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FinanceSubnav />

                    <Card className="!p-0">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between items-center gap-4 bg-gray-50/30">
                            <SelectInput 
                                className="w-full md:w-1/4"
                                value={filters?.status ?? ''}
                                onChange={e => router.get(route('finance.installments.index'), { ...filters, status: e.target.value })}
                            >
                                <option value="">Pendientes y Vencidas</option>
                                <option value="pending">Pendientes</option>
                                <option value="overdue">Vencidas</option>
                                <option value="partial">Abono Parcial</option>
                                <option value="paid">Pagadas</option>
                            </SelectInput>

                            <SelectInput 
                                className="w-full md:w-1/4"
                                value={filters?.course_id ?? ''}
                                onChange={e => router.get(route('finance.installments.index'), { ...filters, course_id: e.target.value }, { preserveState: true })}
                            >
                                <option value="">Todos los cursos</option>
                                {(courses ?? []).map(c => (
                                    <option key={c.id} value={c.id}>{c.fullname}</option>
                                ))}
                            </SelectInput>
                            
                            <div className="relative w-full md:w-2/4">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <TextInput 
                                    className="block w-full pl-10" 
                                    placeholder="Buscar por estudiante, DNI o email..." 
                                    value={filters?.search ?? ''}
                                    onChange={e => router.get(route('finance.installments.index'), { ...filters, search: e.target.value }, { preserveState: true, replace: true })}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante / Curso</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Vencimiento</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Monto Orig.</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Saldo</th>
                                        <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {(installments?.data ?? []).map((inst) => (
                                        <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{inst.student?.first_name} {inst.student?.last_name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{inst.enrollment?.course?.fullname}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{new Date(inst.due_date).toLocaleDateString()}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">${inst.amount}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-primary-600">${inst.balance}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                    inst.status === 'paid' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                    inst.status === 'overdue' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                }`}>
                                                    {inst.status === 'paid' ? 'Pagado' : inst.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                {inst.status !== 'paid' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <SecondaryButton onClick={() => openModal(inst, 'edit')} className="!px-2 !py-1" title="Editar Cuota">
                                                            <PencilSquareIcon className="w-4 h-4" />
                                                        </SecondaryButton>
                                                        <SecondaryButton onClick={() => openModal(inst, 'discount')} className="!px-2 !py-1 text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300 hover:bg-orange-50" title="Aplicar Descuento">
                                                            <TagIcon className="w-4 h-4" />
                                                        </SecondaryButton>
                                                        <PrimaryButton onClick={() => openModal(inst, 'pay')} className="!px-2 !py-1 !bg-green-600 hover:!bg-green-700 !ring-green-600" title="Registrar Pago">
                                                            <CurrencyDollarIcon className="w-4 h-4" />
                                                        </PrimaryButton>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(installments?.data ?? []).length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                        <BanknotesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin cuotas</h3>
                                    <p className="mt-1 text-sm text-gray-500">No hay cuotas para los filtros seleccionados.</p>
                                </div>
                            ) : null}
                        </div>
                    </Card>
                </div>
            </div>

            <Modal show={!!selectedInst} onClose={() => setSelectedInst(null)}>
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            action === 'edit' ? 'bg-blue-50 text-blue-600' :
                            action === 'discount' ? 'bg-orange-50 text-orange-600' :
                            'bg-green-50 text-green-600'
                        }`}>
                            {action === 'edit' && <PencilSquareIcon className="h-5 w-5" />}
                            {action === 'discount' && <TagIcon className="h-5 w-5" />}
                            {action === 'pay' && <CurrencyDollarIcon className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                {action === 'edit' && 'Editar Cuota'}
                                {action === 'discount' && 'Aplicar Descuento'}
                                {action === 'pay' && 'Registrar Pago Manual'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {action === 'edit' && 'Modifica la fecha de vencimiento o el monto.'}
                                {action === 'discount' && 'Aplica un descuento a esta cuota específica.'}
                                {action === 'pay' && 'Registra un pago recibido por fuera del portal.'}
                            </p>
                        </div>
                    </div>
                    
                    {action === 'edit' && (
                        <div className="space-y-5">
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
                        <div className="space-y-5">
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
                        <div className="space-y-5">
                            <div>
                                <InputLabel value="Monto Pagado" />
                                <TextInput type="number" step="0.01" max={selectedInst?.balance} className="mt-1 block w-full font-bold text-primary-600" value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Fecha de Pago" />
                                <TextInput type="date" className="mt-1 block w-full" value={paidAt} onChange={e => setPaidAt(e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Método de Pago" />
                                <SelectInput className="mt-1 block w-full" value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} required>
                                    <option value="">Seleccione...</option>
                                    {(paymentMethods ?? []).map(pm => (
                                        <option key={pm.id} value={pm.id}>{pm.name}</option>
                                    ))}
                                </SelectInput>
                            </div>
                            <div>
                                <InputLabel value="Número de Operación / Referencia" />
                                <TextInput className="mt-1 block w-full" placeholder="Ej. TR-00123" value={reference} onChange={e => setReference(e.target.value)} />
                            </div>
                            <div>
                                <InputLabel value="Comprobante (Archivo)" />
                                <input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors" onChange={e => setReceiptFile(e.target.files[0])} />
                            </div>
                            <div>
                                <InputLabel value="Notas (Opcional)" />
                                <TextInput className="mt-1 block w-full" placeholder="Detalles adicionales..." value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                        <SecondaryButton type="button" onClick={() => setSelectedInst(null)}>Cancelar</SecondaryButton>
                        <PrimaryButton className={action === 'pay' ? '!bg-green-600 hover:!bg-green-700 !ring-green-600' : ''}>
                            Guardar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}