import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import FinanceSubnav from '@/Components/FinanceSubnav';
import Modal from '@/Components/Modal';
import { useState } from 'react';

export default function Index({ payments, filters, paymentMethods, courses }) {
    const [selectedPayment, setSelectedPayment] = useState(null);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Historial de Pagos</h2>}>
            <Head title="Historial de Pagos" />

            <FinanceSubnav />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 border-b flex flex-col md:flex-row md:justify-between items-center gap-4">
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm md:w-1/4"
                                value={filters?.payment_method_id ?? ''}
                                onChange={e => router.get(route('finance.payments.index'), { ...filters, payment_method_id: e.target.value }, { preserveState: true })}
                            >
                                <option value="">Todos los Métodos</option>
                                {(paymentMethods ?? []).map(pm => (
                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                ))}
                            </select>

                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm md:w-1/4"
                                value={filters?.course_id ?? ''}
                                onChange={e => router.get(route('finance.payments.index'), { ...filters, course_id: e.target.value }, { preserveState: true })}
                            >
                                <option value="">Todos los cursos</option>
                                {(courses ?? []).map(c => (
                                    <option key={c.id} value={c.id}>{c.fullname}</option>
                                ))}
                            </select>
                            
                            <TextInput 
                                className="w-full md:w-2/4" 
                                placeholder="Buscar por estudiante, DNI o email..." 
                                value={filters?.search ?? ''}
                                onChange={e => router.get(route('finance.payments.index'), { ...filters, search: e.target.value }, { preserveState: true, replace: true })}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante / Curso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Método / Ref</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Comprobante</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {(payments?.data ?? []).map((pay) => (
                                        <tr key={pay.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {new Date(pay.paid_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="font-medium">{pay.student?.first_name} {pay.student?.last_name}</div>
                                                <div className="text-xs text-gray-500">{pay.installment?.enrollment?.course?.fullname}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                                                ${pay.amount}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                <div>{pay.payment_method?.name}</div>
                                                {pay.reference && <div className="text-xs text-gray-500">Ref: {pay.reference}</div>}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                {pay.file_path ? (
                                                    <a href={`/storage/${pay.file_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 font-medium">
                                                        Ver Archivo
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button onClick={() => setSelectedPayment(pay)} className="text-indigo-600 hover:text-indigo-900">Ver Detalles</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(payments?.data?.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No hay pagos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Detalles del Pago</h2>
                    
                    {selectedPayment && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block font-semibold text-gray-700">Estudiante:</span>
                                    <span>{selectedPayment.student?.first_name} {selectedPayment.student?.last_name}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700">Curso:</span>
                                    <span>{selectedPayment.installment?.enrollment?.course?.fullname}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700">Fecha de Pago:</span>
                                    <span>{new Date(selectedPayment.paid_at).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700">Monto:</span>
                                    <span className="font-bold text-green-600">${selectedPayment.amount}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700">Método de Pago:</span>
                                    <span>{selectedPayment.payment_method?.name}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700">Número de Referencia:</span>
                                    <span>{selectedPayment.reference || '—'}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700">Origen (Fuente):</span>
                                    <span className="uppercase">{selectedPayment.source}</span>
                                </div>
                            </div>
                            
                            <div className="pt-2 border-t mt-4">
                                <span className="block font-semibold text-gray-700">Notas / Observaciones:</span>
                                <p className="text-gray-600 mt-1">{selectedPayment.notes || 'Sin observaciones.'}</p>
                            </div>

                            {selectedPayment.file_path && (
                                <div className="pt-4 flex justify-center">
                                    <a href={`/storage/${selectedPayment.file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700">
                                        Ver Comprobante Adjunto
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setSelectedPayment(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cerrar</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
