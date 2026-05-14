import PortalLayout from '@/Layouts/Portal/PortalLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Installments({ installments, paymentMethods, activeSubmissions }) {
    const { flash } = usePage().props;
    const [uploadingInstallment, setUploadingInstallment] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        installment_id: '',
        payment_method_id: '',
        reference: '',
        file: null,
    });

    const openUploadModal = (installment) => {
        setUploadingInstallment(installment);
        setData({
            installment_id: installment.id,
            payment_method_id: '',
            reference: '',
            file: null,
        });
    };

    const closeUploadModal = () => {
        setUploadingInstallment(null);
        reset();
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('portal.payments.store'), {
            preserveScroll: true,
            onSuccess: () => closeUploadModal(),
        });
    };

    return (
        <PortalLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Estado de Cuenta</h2>}
        >
            <Head title="Estado de Cuenta" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Curso</th>
                                        <th className="px-6 py-3">Concepto</th>
                                        <th className="px-6 py-3">Vencimiento</th>
                                        <th className="px-6 py-3 text-right">Monto Original</th>
                                        <th className="px-6 py-3 text-right">Saldo a Pagar</th>
                                        <th className="px-6 py-3 text-center">Estado</th>
                                        <th className="px-6 py-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {installments.map((inst) => {
                                        const isOverdue = inst.status === 'overdue';
                                        const isPaid = inst.status === 'paid';
                                        const isPartial = inst.status === 'partial';
                                        const inReview = activeSubmissions.includes(inst.id);

                                        let statusBadge = '';
                                        if (isPaid) statusBadge = <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Pagado</span>;
                                        else if (isOverdue) statusBadge = <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Vencido</span>;
                                        else if (isPartial) statusBadge = <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Parcial</span>;
                                        else statusBadge = <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Pendiente</span>;

                                        return (
                                            <tr key={inst.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{inst.enrollment?.course?.fullname}</td>
                                                <td className="px-6 py-4">{inst.payment_type?.name}</td>
                                                <td className="px-6 py-4">{inst.due_date}</td>
                                                <td className="px-6 py-4 text-right">${Number(inst.amount).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600">${Number(inst.balance).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-center">{statusBadge}</td>
                                                <td className="px-6 py-4 text-center space-y-2">
                                                    {!isPaid && (
                                                        inReview ? (
                                                            <span className="block text-xs text-orange-600 font-semibold">En revisión</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => openUploadModal(inst)}
                                                                className="block w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded"
                                                            >
                                                                Subir Pago
                                                            </button>
                                                        )
                                                    )}
                                                    
                                                    {/* Mostrar recibos si existen */}
                                                    {inst.payments && inst.payments.map((pay) => 
                                                        pay.file_path ? (
                                                            <a 
                                                                key={pay.id} 
                                                                href={`/storage/${pay.file_path}`} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="block text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                                                            >
                                                                Ver recibo
                                                            </a>
                                                        ) : null
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {installments.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                No tienes cuotas generadas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={uploadingInstallment !== null} onClose={closeUploadModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Subir Comprobante de Pago
                    </h2>
                    
                    {uploadingInstallment && (
                        <div className="mb-4 bg-gray-50 p-3 rounded text-sm">
                            <p><strong>Concepto:</strong> {uploadingInstallment.payment_type?.name}</p>
                            <p><strong>Saldo a pagar:</strong> ${Number(uploadingInstallment.balance).toFixed(2)}</p>
                        </div>
                    )}

                    <form onSubmit={submitPayment}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.payment_method_id}
                                onChange={e => setData('payment_method_id', e.target.value)}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {paymentMethods.map(pm => (
                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                ))}
                            </select>
                            {errors.payment_method_id && <p className="text-red-500 text-xs mt-1">{errors.payment_method_id}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Número de Referencia / Operación</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.reference}
                                onChange={e => setData('reference', e.target.value)}
                                placeholder="Ej: 12345678"
                            />
                            {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Comprobante (Imagen o PDF)</label>
                            <input
                                type="file"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={e => setData('file', e.target.files[0])}
                                accept=".jpg,.jpeg,.png,.pdf"
                                required
                            />
                            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={closeUploadModal}
                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 mr-2"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 border border-transparent text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {processing ? 'Subiendo...' : 'Enviar Comprobante'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </PortalLayout>
    );
}
