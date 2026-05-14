import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Card from '@/Components/Card';
import SecondaryButton from '@/Components/SecondaryButton';
import FinanceSubnav from '@/Components/FinanceSubnav';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import { CurrencyDollarIcon, MagnifyingGlassIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function Index({ payments, filters, paymentMethods, courses }) {
    const [selectedPayment, setSelectedPayment] = useState(null);

    return (
        <AuthenticatedLayout header="Historial de Pagos">
            <Head title="Historial de Pagos" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FinanceSubnav />

                    <Card className="!p-0">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between items-center gap-4 bg-gray-50/30">
                            <SelectInput 
                                className="w-full md:w-1/4"
                                value={filters?.payment_method_id ?? ''}
                                onChange={e => router.get(route('finance.payments.index'), { ...filters, payment_method_id: e.target.value }, { preserveState: true })}
                            >
                                <option value="">Todos los Métodos</option>
                                {(paymentMethods ?? []).map(pm => (
                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                ))}
                            </SelectInput>

                            <SelectInput 
                                className="w-full md:w-1/4"
                                value={filters?.course_id ?? ''}
                                onChange={e => router.get(route('finance.payments.index'), { ...filters, course_id: e.target.value }, { preserveState: true })}
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
                                    onChange={e => router.get(route('finance.payments.index'), { ...filters, search: e.target.value }, { preserveState: true, replace: true })}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante / Curso</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Método / Ref</th>
                                        <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Comprobante</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {(payments?.data ?? []).map((pay) => (
                                        <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{new Date(pay.paid_at).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">{new Date(pay.paid_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{pay.student?.first_name} {pay.student?.last_name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{pay.installment?.enrollment?.course?.fullname}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-green-600">
                                                ${pay.amount}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">{pay.payment_method?.name}</div>
                                                {pay.reference && <div className="text-xs text-gray-500">Ref: {pay.reference}</div>}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                {pay.file_path ? (
                                                    <a href={`/storage/${pay.file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-2 py-1 rounded-md">
                                                        <DocumentTextIcon className="w-4 h-4" />
                                                        Ver
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <SecondaryButton onClick={() => setSelectedPayment(pay)} className="!px-2 !py-1" title="Ver Detalles">
                                                    <EyeIcon className="w-4 h-4" />
                                                </SecondaryButton>
                                            </td>
                                        </tr>
                                    ))}
                                    {(payments?.data?.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                                </div>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin pagos</h3>
                                                <p className="mt-1 text-sm text-gray-500">No hay pagos registrados para los filtros seleccionados.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <Modal show={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                            <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Detalles del Pago</h2>
                            <p className="text-xs text-gray-500">Información completa de la transacción.</p>
                        </div>
                    </div>
                    
                    {selectedPayment && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Estudiante</span>
                                    <span className="font-semibold text-gray-900">{selectedPayment.student?.first_name} {selectedPayment.student?.last_name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Curso</span>
                                    <span className="font-semibold text-gray-900">{selectedPayment.installment?.enrollment?.course?.fullname}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Fecha de Pago</span>
                                    <span className="font-semibold text-gray-900">{new Date(selectedPayment.paid_at).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Monto</span>
                                    <span className="font-bold text-green-600 text-lg">${selectedPayment.amount}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Método de Pago</span>
                                    <span className="font-semibold text-gray-900">{selectedPayment.payment_method?.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Número de Referencia</span>
                                    <span className="font-semibold text-gray-900">{selectedPayment.reference || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Origen (Fuente)</span>
                                    <span className="font-semibold text-gray-900 uppercase bg-gray-200 px-2 py-0.5 rounded text-xs">{selectedPayment.source}</span>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-xs font-medium text-gray-500 uppercase mb-1">Notas / Observaciones</span>
                                <p className="text-gray-700">{selectedPayment.notes || 'Sin observaciones.'}</p>
                            </div>

                            {selectedPayment.file_path && (
                                <div className="pt-4 flex justify-center">
                                    <a href={`/storage/${selectedPayment.file_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 transition-colors shadow-sm">
                                        <DocumentTextIcon className="w-4 h-4" />
                                        Ver Comprobante Adjunto
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-8 flex justify-end bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                        <SecondaryButton onClick={() => setSelectedPayment(null)}>Cerrar</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
