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
import { DocumentMagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Index({ submissions, filters, paymentMethods }) {
    const [selectedSub, setSelectedSub] = useState(null);
    const [action, setAction] = useState(null); // 'approve' or 'reject'
    
    const [amount, setAmount] = useState('');
    const [paymentMethodId, setPaymentMethodId] = useState('');
    const [reason, setReason] = useState('');

    const openModal = (sub, type) => {
        setSelectedSub(sub);
        setAction(type);
        setAmount(sub.installment?.amount ?? '');
        setPaymentMethodId(sub.payment_method_id ?? '');
        setReason('');
    };

    const submit = (e) => {
        e.preventDefault();
        if (action === 'approve') {
            router.post(route('finance.inbox.approve', selectedSub.id), {
                amount,
                payment_method_id: paymentMethodId,
            }, {
                onSuccess: () => setSelectedSub(null)
            });
        } else {
            router.post(route('finance.inbox.reject', selectedSub.id), {
                rejection_reason: reason,
            }, {
                onSuccess: () => setSelectedSub(null)
            });
        }
    };

    return (
        <AuthenticatedLayout header="Finanzas">
            <Head title="Inbox Financiero" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FinanceSubnav />

                    <Card className="!p-0">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between items-center gap-4 bg-gray-50/30">
                            <h3 className="text-lg font-medium text-gray-900">Bandeja de Comprobantes</h3>
                            <SelectInput 
                                className="w-full md:w-64"
                                value={filters?.status ?? 'in_review'}
                                onChange={e => router.get(route('finance.inbox.index'), { ...filters, status: e.target.value })}
                            >
                                <option value="in_review">En Revisión</option>
                                <option value="approved">Aprobados</option>
                                <option value="rejected">Rechazados</option>
                            </SelectInput>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Curso / Cuota</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ref / Método</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Comprobante</th>
                                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {(submissions?.data ?? []).map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                                                    {sub.student?.first_name?.[0] ?? ''}{sub.student?.last_name?.[0] ?? ''}
                                                </div>
                                                <div>
                                                    {sub.student?.first_name} {sub.student?.last_name}
                                                    <div className="text-xs text-gray-500 font-normal">{sub.student?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">{sub.installment?.enrollment?.course?.fullname}</div>
                                            <div className="text-xs text-primary-600 font-semibold mt-0.5">Saldo cuota: ${sub.installment?.balance}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">{sub.reference ?? 'Sin referencia'}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{sub.payment_method?.name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <a href={`/storage/${sub.file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium">
                                                <DocumentTextIcon className="w-4 h-4" />
                                                Ver archivo
                                            </a>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                sub.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                sub.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}>
                                                {sub.status === 'approved' ? 'Aprobado' : sub.status === 'rejected' ? 'Rechazado' : 'En Revisión'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <SecondaryButton onClick={() => openModal(sub, 'details')} className="!px-2 !py-1" title="Ver Detalles">
                                                    <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                                                </SecondaryButton>
                                                {sub.status === 'in_review' && (
                                                    <>
                                                        <PrimaryButton onClick={() => openModal(sub, 'approve')} className="!px-2 !py-1 !bg-green-600 hover:!bg-green-700 !ring-green-600" title="Aprobar">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                        </PrimaryButton>
                                                        <DangerButton onClick={() => openModal(sub, 'reject')} className="!px-2 !py-1" title="Rechazar">
                                                            <XCircleIcon className="w-4 h-4" />
                                                        </DangerButton>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(submissions?.data ?? []).length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin comprobantes</h3>
                                <p className="mt-1 text-sm text-gray-500">No hay comprobantes para el estado seleccionado.</p>
                            </div>
                        ) : null}
                        </div>
                    </Card>
                </div>
            </div>

            <Modal show={!!selectedSub} onClose={() => setSelectedSub(null)}>
                {action === 'details' ? (
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                                <DocumentMagnifyingGlassIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Detalles del Comprobante</h2>
                                <p className="text-xs text-gray-500">Información completa de la subida.</p>
                            </div>
                        </div>
                        
                        {selectedSub && (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Estudiante</span>
                                        <span className="font-semibold text-gray-900">{selectedSub.student?.first_name} {selectedSub.student?.last_name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Curso</span>
                                        <span className="font-semibold text-gray-900">{selectedSub.installment?.enrollment?.course?.fullname}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Fecha de Subida</span>
                                        <span className="font-semibold text-gray-900">{new Date(selectedSub.created_at).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Estado</span>
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                selectedSub.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                selectedSub.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}>
                                            {selectedSub.status === 'approved' ? 'Aprobado' : selectedSub.status === 'rejected' ? 'Rechazado' : 'En Revisión'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Método de Pago</span>
                                        <span className="font-semibold text-gray-900">{selectedSub.payment_method?.name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Referencia</span>
                                        <span className="font-semibold text-gray-900">{selectedSub.reference || '—'}</span>
                                    </div>
                                </div>

                                {selectedSub.rejection_reason && (
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                        <span className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Motivo de Rechazo</span>
                                        <p className="text-red-600">{selectedSub.rejection_reason}</p>
                                    </div>
                                )}

                                {selectedSub.file_path && (
                                    <div className="pt-4 flex justify-center">
                                        <a href={`/storage/${selectedSub.file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 transition-colors shadow-sm">
                                            <DocumentTextIcon className="w-4 h-4" />
                                            Ver Comprobante Adjunto
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="mt-8 flex justify-end bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                            <SecondaryButton onClick={() => setSelectedSub(null)}>Cerrar</SecondaryButton>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={submit} className="p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
                                {action === 'approve' ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">
                                    {action === 'approve' ? 'Aprobar Pago' : 'Rechazar Comprobante'}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {action === 'approve' ? 'Confirma el monto y el método de pago.' : 'Ingresa el motivo del rechazo para notificar al estudiante.'}
                                </p>
                            </div>
                        </div>
                        
                        {action === 'approve' ? (
                            <div className="space-y-5">
                                <div>
                                    <InputLabel value="Monto exacto aprobado" />
                                    <TextInput type="number" step="0.01" className="mt-1 block w-full" value={amount} onChange={e => setAmount(e.target.value)} required />
                                </div>
                                <div>
                                    <InputLabel value="Método de pago real" />
                                    <SelectInput className="mt-1 block w-full" value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} required>
                                        <option value="">Seleccione...</option>
                                        {(paymentMethods ?? []).map(pm => (
                                            <option key={pm.id} value={pm.id}>{pm.name}</option>
                                        ))}
                                    </SelectInput>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <InputLabel value="Motivo de rechazo" />
                                <textarea 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                                    rows="4" 
                                    placeholder="Ej. El comprobante está borroso o el monto no coincide..."
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                    required
                                ></textarea>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                            <SecondaryButton type="button" onClick={() => setSelectedSub(null)}>Cancelar</SecondaryButton>
                            {action === 'approve' ? (
                                <PrimaryButton className="!bg-green-600 hover:!bg-green-700 !ring-green-600">Confirmar Aprobación</PrimaryButton>
                            ) : (
                                <DangerButton>Rechazar Comprobante</DangerButton>
                            )}
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}