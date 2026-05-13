import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import FinanceSubnav from '@/Components/FinanceSubnav';

export default function Index({ payments, filters, paymentMethods }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Historial de Pagos</h2>}>
            <Head title="Historial de Pagos" />

            <FinanceSubnav />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 border-b flex flex-col md:flex-row md:justify-between items-center gap-4">
                            <select 
                                className="rounded-md border-gray-300 shadow-sm"
                                value={filters?.payment_method_id ?? ''}
                                onChange={e => router.get(route('finance.payments.index'), { ...filters, payment_method_id: e.target.value }, { preserveState: true })}
                            >
                                <option value="">Todos los Métodos</option>
                                {(paymentMethods ?? []).map(pm => (
                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                ))}
                            </select>
                            
                            <TextInput 
                                className="w-full md:w-1/3" 
                                placeholder="Buscar por estudiante, DNI, email o curso..." 
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
                                        </tr>
                                    ))}
                                    {(payments?.data?.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No hay pagos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
