import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';
import Modal from '@/Components/Modal';
import Card from '@/Components/Card';
import { UserIcon, BookOpenIcon, CurrencyDollarIcon, DocumentTextIcon, ClockIcon, PencilSquareIcon, TrashIcon, AcademicCapIcon, BanknotesIcon } from '@heroicons/react/24/outline';

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
        <AuthenticatedLayout header={`Expediente: ${student.first_name} ${student.last_name}`}>
            <Head title={`Expediente: ${student.first_name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    
                    {/* Header actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                                {student.first_name?.[0] ?? ''}{student.last_name?.[0] ?? ''}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{student.first_name} {student.last_name}</h2>
                                <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('students.edit', student.id)}>
                                <SecondaryButton className="flex items-center gap-2">
                                    <PencilSquareIcon className="w-4 h-4" />
                                    Editar
                                </SecondaryButton>
                            </Link>
                            <DangerButton onClick={deleteStudent} className="flex items-center gap-2">
                                <TrashIcon className="w-4 h-4" />
                                Eliminar
                            </DangerButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Col 1: Datos Personales */}
                        <Card className="flex flex-col">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900">Datos Personales</h3>
                            </div>
                            <dl className="space-y-4 text-sm flex-1">
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">DNI/Identificación</dt>
                                    <dd className="font-medium text-gray-900 bg-gray-50 p-2 rounded-md">{student.identity_doc ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Teléfono</dt>
                                    <dd className="font-medium text-gray-900 bg-gray-50 p-2 rounded-md">{student.phone ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Moodle ID</dt>
                                    <dd className="font-medium text-gray-900 bg-gray-50 p-2 rounded-md">{student.lms_user_id ?? 'No vinculado'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Acceso a Moodle</dt>
                                    <dd className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        {student.is_suspended ? (
                                            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Suspendido</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                        )}
                                        <button
                                            onClick={() => {
                                                if(confirm(student.is_suspended ? '¿Permitir acceso al aula virtual (Moodle)?' : '¿Bloquear acceso al aula virtual (Moodle)? El estudiante aún podrá entrar al portal para pagar.')) {
                                                    router.post(route('students.toggle_suspension', student.id), {}, { preserveScroll: true });
                                                }
                                            }}
                                            className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${student.is_suspended ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                        >
                                            {student.is_suspended ? 'Activar' : 'Suspender'}
                                        </button>
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        {/* Col 2: Cursos activos */}
                        <Card className="md:col-span-2">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">Cursos / Matriculaciones</h3>
                                </div>
                                <PrimaryButton onClick={() => setShowEnrollmentModal(true)} className="flex items-center gap-2 !py-1.5 !px-3 !text-sm">
                                    <BookOpenIcon className="w-4 h-4" />
                                    Matricular
                                </PrimaryButton>
                            </div>
                            {student.enrollments?.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {student.enrollments.map(e => (
                                        <div key={e.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="font-semibold text-gray-900 mb-1">{e.course?.fullname}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="inline-flex items-center rounded-md bg-white px-2 py-1 ring-1 ring-inset ring-gray-200">
                                                    Cohorte: {e.cohort?.name ?? '—'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-3 pt-3 border-t border-gray-200">
                                                <ClockIcon className="w-3 h-3" />
                                                Matriculado el {new Date(e.enrolled_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-300" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin matriculaciones</h3>
                                    <p className="mt-1 text-sm text-gray-500">Este estudiante no está inscrito en ningún curso.</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 !p-0 overflow-hidden">
                            <div className="flex items-center gap-2 p-6 border-b border-gray-100 bg-gray-50/30">
                                <BanknotesIcon className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900">Estado de Cuenta (Cuotas)</h3>
                            </div>
                            {student.installments?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso / Concepto</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {student.installments.map(i => (
                                                <tr key={i.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{i.concept ?? i.payment_type?.name ?? 'Cuota'}</div>
                                                        <div className="text-xs text-gray-500">{i.enrollment?.course?.fullname ?? '—'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(i.due_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${i.amount}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-primary-600 text-right">${i.balance}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                            i.status === 'paid' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                            i.status === 'overdue' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                            'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                        }`}>
                                                            {i.status === 'paid' ? 'Pagado' : i.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500">No hay cuotas registradas.</div>
                            )}
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
                                </div>
                                {student.payments?.length > 0 ? (
                                    <div className="space-y-3">
                                        {student.payments.map(p => (
                                            <div key={p.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-gray-900 text-lg">${p.amount}</span>
                                                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">{new Date(p.paid_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs font-medium text-gray-700 mb-1">
                                                    {p.payment_method?.name} {p.reference ? `(Ref: ${p.reference})` : ''}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {p.installment?.concept ?? '—'} - <span className="truncate max-w-[150px] inline-block align-bottom">{p.installment?.enrollment?.course?.fullname ?? '—'}</span>
                                                </div>
                                                {p.file_path && (
                                                    <div className="mt-3 pt-2 border-t border-gray-200">
                                                        <a href={`/storage/${p.file_path}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium">
                                                            <DocumentTextIcon className="w-3 h-3" />
                                                            Ver Comprobante
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-gray-500">Sin pagos registrados.</div>
                                )}
                            </Card>

                            <Card>
                                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                                    <ClockIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">Línea de Tiempo</h3>
                                </div>
                                {student.timelineEvents?.length > 0 ? (
                                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                        {student.timelineEvents.map(ev => (
                                            <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-gray-200 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-gray-900 text-xs">{ev.type}</span>
                                                        <time className="text-[10px] font-medium text-gray-500">{new Date(ev.created_at).toLocaleDateString()}</time>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500">Por: {ev.created_by?.name ?? 'Sistema'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-gray-500">Sin eventos.</div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showEnrollmentModal} onClose={() => setShowEnrollmentModal(false)}>
                <form onSubmit={submitEnrollment} className="p-6">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                            <BookOpenIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Matricular Estudiante</h2>
                            <p className="text-xs text-gray-500">Se autogenerará su plan de pagos y se enrolará en Moodle.</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {enrollForm.errors.general ? (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{enrollForm.errors.general}</div>
                        ) : null}

                        <div>
                            <InputLabel value="Curso" />
                            <SelectInput
                                className="mt-1 block w-full"
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
                            </SelectInput>
                            <InputError message={enrollForm.errors.course_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Cohorte (Opcional)" />
                            <SelectInput
                                className="mt-1 block w-full"
                                value={enrollForm.data.cohort_id}
                                onChange={(e) => enrollForm.setData('cohort_id', e.target.value)}
                            >
                                <option value="">—</option>
                                {filteredCohorts.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </SelectInput>
                            <InputError message={enrollForm.errors.cohort_id} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                        <SecondaryButton type="button" onClick={() => setShowEnrollmentModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={enrollForm.processing}>
                            Confirmar Matrícula
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
