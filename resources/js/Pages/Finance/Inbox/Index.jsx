import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import FinanceSubnav from '@/Components/FinanceSubnav';

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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Finanzas</h2>}>
            <Head title="Inbox Financiero" />

            <FinanceSubnav />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 border-b flex flex-col md:flex-row md:justify-between items-center gap-4">
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm md:w-1/4"
                                value={filters?.status ?? 'in_review'}
                                onChange={e => router.get(route('finance.inbox.index'), { ...filters, status: e.target.value })}
                            >
                                <option value="in_review">En Revisión</option>
                                <option value="approved">Aprobados</option>
                                <option value="rejected">Rechazados</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Curso / Cuota</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ref / Método</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Comprobante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {(submissions?.data ?? []).map((sub) => (
                                    <tr key={sub.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {sub.student?.first_name} {sub.student?.last_name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium">{sub.installment?.enrollment?.course?.fullname}</div>
                                            <div className="text-xs">Saldo cuota: ${sub.installment?.balance}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            {sub.reference ?? '—'} <br/>
                                            <span className="text-xs text-gray-500">{sub.payment_method?.name}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-600">
                                            <a href={`/storage/${sub.file_path}`} target="_blank" rel="noreferrer">Ver archivo</a>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{sub.status}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <button onClick={() => openModal(sub, 'details')} className="text-blue-600 hover:text-blue-900 mr-3">Ver Detalles</button>
                                            {sub.status === 'in_review' && (
                                                <>
                                                    <button onClick={() => openModal(sub, 'approve')} className="text-green-600 hover:text-green-900 mr-3">Aprobar</button>
                                                    <button onClick={() => openModal(sub, 'reject')} className="text-red-600 hover:text-red-900">Rechazar</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(submissions?.data ?? []).length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">No hay comprobantes para el estado seleccionado.</div>
                        ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={!!selectedSub} onClose={() => setSelectedSub(null)}>
                {action === 'details' ? (
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Detalles del Comprobante</h2>
                        
                        {selectedSub && (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block font-semibold text-gray-700">Estudiante:</span>
                                        <span>{selectedSub.student?.first_name} {selectedSub.student?.last_name}</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-700">Curso:</span>
                                        <span>{selectedSub.installment?.enrollment?.course?.fullname}</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-700">Fecha de Subida:</span>
                                        <span>{new Date(selectedSub.created_at).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-700">Estado:</span>
                                        <span className="uppercase font-bold">{selectedSub.status}</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-700">Método de Pago Sugerido:</span>
                                        <span>{selectedSub.payment_method?.name}</span>
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-700">Número de Referencia:</span>
                                        <span>{selectedSub.reference || '—'}</span>
                                    </div>
                                </div>

                                {selectedSub.rejection_reason && (
                                    <div className="pt-2 border-t mt-4">
                                        <span className="block font-semibold text-red-700">Motivo de Rechazo:</span>
                                        <p className="text-red-600 mt-1">{selectedSub.rejection_reason}</p>
                                    </div>
                                )}

                                {selectedSub.file_path && (
                                    <div className="pt-4 flex justify-center">
                                        <a href={`/storage/${selectedSub.file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700">
                                            Ver Comprobante Adjunto
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setSelectedSub(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cerrar</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={submit} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {action === 'approve' ? 'Aprobar Pago' : 'Rechazar Comprobante'}
                        </h2>
                        
                        {action === 'approve' ? (
                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Monto exacto aprobado" />
                                    <TextInput type="number" step="0.01" className="mt-1 block w-full" value={amount} onChange={e => setAmount(e.target.value)} required />
                                </div>
                                <div>
                                    <InputLabel value="Método de pago real" />
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} required>
                                        <option value="">Seleccione...</option>
                                        {(paymentMethods ?? []).map(pm => (
                                            <option key={pm.id} value={pm.id}>{pm.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <InputLabel value="Motivo de rechazo" />
                                <textarea 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    rows="3" 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                    required
                                ></textarea>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={() => setSelectedSub(null)} className="mr-3 text-sm text-gray-600">Cancelar</button>
                            <PrimaryButton>{action === 'approve' ? 'Confirmar Aprobación' : 'Rechazar'}</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}