import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

export default function Show({ student, courses, cohorts }) {
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const enrollForm = useForm({
        course_id: '',
        cohort_id: '',
    });

    const submitEnrollment = (e) => {
        e.preventDefault();
        enrollForm.post(route('students.enrollments.store', student.id), {
            onSuccess: () => {
                setShowEnrollmentModal(false);
                enrollForm.reset();
            }
        });
    };

    const deleteStudent = () => {
        if (confirm('¿Estás seguro de eliminar este estudiante? Esta acción puede ser bloqueada si tiene registros financieros.')) {
            router.delete(route('students.destroy', student.id));
        }
    };

    const filteredCohorts = (cohorts ?? []).filter((c) => String(c.course_id) === String(enrollForm.data.course_id));

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Expediente: {student.first_name} {student.last_name}</h2>}>
            <Head title={`Expediente: ${student.first_name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* flash messages here if needed */}

                    <div className="flex justify-end gap-3">
                        <button onClick={deleteStudent} className="text-sm text-red-600 hover:text-red-900 font-medium">Eliminar estudiante</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Col 1: Datos Personales */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Datos Personales</h3>
                                <Link href={route('students.edit', student.id)} className="text-sm text-indigo-600 hover:text-indigo-900">Editar</Link>
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500">Email</dt>
                                    <dd className="font-medium text-gray-900">{student.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">DNI/Identificación</dt>
                                    <dd className="font-medium text-gray-900">{student.identity_doc ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Teléfono</dt>
                                    <dd className="font-medium text-gray-900">{student.phone ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Moodle ID</dt>
                                    <dd className="font-medium text-gray-900">{student.lms_user_id ?? 'No vinculado'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Col 2: Cursos activos */}
                        <div className="md:col-span-2 bg-white p-6 shadow-sm sm:rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Cursos / Matriculaciones</h3>
                                <PrimaryButton onClick={() => setShowEnrollmentModal(true)}>Matricular</PrimaryButton>
                            </div>
                            {student.enrollments?.length > 0 ? (
                                <div className="space-y-3">
                                    {student.enrollments.map(e => (
                                        <div key={e.id} className="p-3 border rounded-md">
                                            <div className="font-medium">{e.course?.fullname}</div>
                                            <div className="text-sm text-gray-600">Cohorte: {e.cohort?.name ?? '—'} · Fecha: {new Date(e.enrolled_at).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No tiene cursos activos.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Cuenta (Cuotas)</h3>
                            {student.installments?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {student.installments.map(i => (
                                                <tr key={i.id}>
                                                    <td className="px-4 py-2 text-sm">{i.enrollment?.course?.fullname ?? '—'}</td>
                                                    <td className="px-4 py-2 text-sm">{i.concept ?? i.payment_type?.name ?? 'Cuota'}</td>
                                                    <td className="px-4 py-2 text-sm">{new Date(i.due_date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-sm">${i.amount}</td>
                                                    <td className="px-4 py-2 text-sm">${i.balance}</td>
                                                    <td className="px-4 py-2 text-sm">{i.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No hay cuotas registradas.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Historial</h3>
                            {student.timeline_events?.length > 0 ? (
                                <div className="space-y-4">
                                    {student.timeline_events.map(ev => (
                                        <div key={ev.id} className="text-sm">
                                            <div className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</div>
                                            <div className="font-medium text-gray-800">{ev.type}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Sin eventos.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showEnrollmentModal} onClose={() => setShowEnrollmentModal(false)}>
                <form onSubmit={submitEnrollment} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Matricular Estudiante
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Al matricular, se autogenerará su plan de pagos basándose en la plantilla activa del curso y se enrolará en Moodle.
                    </p>

                    <div className="mt-6 space-y-4">
                        {enrollForm.errors.general ? (
                            <div className="text-sm text-red-600">{enrollForm.errors.general}</div>
                        ) : null}

                        <div>
                            <InputLabel value="Curso" />
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={enrollForm.data.course_id}
                                onChange={(e) => {
                                    enrollForm.setData('course_id', e.target.value);
                                    enrollForm.setData('cohort_id', '');
                                }}
                                required
                            >
                                <option value="">Seleccione un curso...</option>
                                {(courses ?? []).map(c => (
                                    <option key={c.id} value={c.id}>{c.fullname}</option>
                                ))}
                            </select>
                            <InputError message={enrollForm.errors.course_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Cohorte (Opcional)" />
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={enrollForm.data.cohort_id}
                                onChange={(e) => enrollForm.setData('cohort_id', e.target.value)}
                            >
                                <option value="">—</option>
                                {filteredCohorts.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={enrollForm.errors.cohort_id} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setShowEnrollmentModal(false)} className="mr-3 text-sm text-gray-600 hover:text-gray-900">
                            Cancelar
                        </button>
                        <PrimaryButton disabled={enrollForm.processing}>
                            Confirmar Matrícula
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
