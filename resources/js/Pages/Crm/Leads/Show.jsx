import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrmSubnav from '@/Components/CrmSubnav';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Show({ lead, pipelines, courses, cohorts, salesUsers }) {
    const form = useForm({
        pipeline_id: lead.pipeline_id,
        stage_id: lead.stage_id,
        course_id: lead.course_id,
        cohort_id: lead.cohort_id ?? '',
        assigned_to_user_id: lead.assigned_to_user_id ?? '',
        student_id: lead.student_id ?? '',
        first_name: lead.first_name ?? '',
        last_name: lead.last_name ?? '',
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        identity_doc: lead.identity_doc ?? '',
    });

    const [studentQuery, setStudentQuery] = useState(
        lead.student ? `${lead.student.first_name ?? ''} ${lead.student.last_name ?? ''}`.trim() || lead.student.email || '' : '',
    );
    const [studentResults, setStudentResults] = useState([]);

    useEffect(() => {
        const q = studentQuery.trim();
        if (q.length < 2) {
            setStudentResults([]);
            return;
        }

        const t = setTimeout(async () => {
            const res = await axios.get(route('crm.students.search'), { params: { q } });
            setStudentResults(res.data?.data ?? []);
        }, 250);

        return () => clearTimeout(t);
    }, [studentQuery]);

    const selectedPipeline = (pipelines ?? []).find((p) => String(p.id) === String(form.data.pipeline_id));
    const stages = selectedPipeline?.stages ?? [];
    const filteredCohorts = (cohorts ?? []).filter((c) => String(c.course_id) === String(form.data.course_id));

    const onPipelineChange = (e) => {
        const nextPipelineId = e.target.value;
        const nextPipeline = (pipelines ?? []).find((p) => String(p.id) === String(nextPipelineId));
        form.setData((data) => ({
            ...data,
            pipeline_id: nextPipelineId,
            stage_id: nextPipeline?.stages?.[0]?.id ?? '',
        }));
    };

    const onCourseChange = (e) => {
        const nextCourseId = e.target.value;
        form.setData((data) => ({
            ...data,
            course_id: nextCourseId,
            cohort_id: '',
        }));
    };

    const save = (e) => {
        e.preventDefault();
        form.put(route('crm.leads.update', lead.id), { preserveScroll: true });
    };

    const noteForm = useForm({ body: '' });

    const addNote = (e) => {
        e.preventDefault();
        noteForm.post(route('crm.leads.notes.store', lead.id), {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('body'),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Lead #{lead.id}</h2>}>
            <Head title={`CRM · Lead #${lead.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CrmSubnav />
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">Detalle</div>
                            <Link className="rounded-md border px-3 py-2 text-sm" href={route('crm.kanban.index', { pipeline_id: lead.pipeline_id })}>
                                Volver al Kanban
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                            <form onSubmit={save} className="space-y-6">
                                <div>
                                    <InputLabel value="Vincular a estudiante existente (upselling, opcional)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={studentQuery}
                                        onChange={(e) => setStudentQuery(e.target.value)}
                                        placeholder="Busca por email, DNI o nombre (mínimo 2 caracteres)"
                                    />
                                    <div className="mt-2 grid gap-2">
                                        {studentResults.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                className="rounded-md border px-3 py-2 text-left text-sm"
                                                onClick={() => {
                                                    form.setData('student_id', s.id);
                                                    setStudentQuery(`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.email || String(s.id));
                                                    setStudentResults([]);
                                                }}
                                            >
                                                <div className="font-medium">{`${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || '—'}</div>
                                                <div className="text-xs text-gray-600">{s.email ?? '—'} · {s.identity_doc ?? '—'}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {form.data.student_id ? (
                                        <div className="mt-2 text-sm text-gray-700">
                                            Seleccionado: {studentQuery || `ID ${form.data.student_id}`}
                                            <button
                                                type="button"
                                                className="ml-3 rounded-md border px-2 py-1 text-xs"
                                                onClick={() => {
                                                    form.setData('student_id', '');
                                                    setStudentQuery('');
                                                    setStudentResults([]);
                                                }}
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    ) : null}
                                    <InputError className="mt-2" message={form.errors.student_id} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value="Pipeline" />
                                        <select className="mt-1 w-full rounded-md border-gray-300 shadow-sm" value={form.data.pipeline_id} onChange={onPipelineChange}>
                                            {(pipelines ?? []).map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={form.errors.pipeline_id} />
                                    </div>
                                    <div>
                                        <InputLabel value="Etapa" />
                                        <select
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
                                            value={form.data.stage_id}
                                            onChange={(e) => form.setData('stage_id', e.target.value)}
                                        >
                                            {stages.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={form.errors.stage_id} />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Vendedor (asignación)" />
                                    <select
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
                                        value={form.data.assigned_to_user_id}
                                        onChange={(e) => form.setData('assigned_to_user_id', e.target.value)}
                                    >
                                        <option value="">Sin asignar</option>
                                        {(salesUsers ?? []).map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={form.errors.assigned_to_user_id} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value="Curso (obligatorio)" />
                                        <select className="mt-1 w-full rounded-md border-gray-300 shadow-sm" value={form.data.course_id} onChange={onCourseChange}>
                                            {(courses ?? []).map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.fullname}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={form.errors.course_id} />
                                    </div>
                                    <div>
                                        <InputLabel value="Cohorte (opcional)" />
                                        <select
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
                                            value={form.data.cohort_id}
                                            onChange={(e) => form.setData('cohort_id', e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {filteredCohorts.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={form.errors.cohort_id} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value="Nombre" />
                                        <TextInput className="mt-1 block w-full" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} />
                                        <InputError className="mt-2" message={form.errors.first_name} />
                                    </div>
                                    <div>
                                        <InputLabel value="Apellidos" />
                                        <TextInput className="mt-1 block w-full" value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} />
                                        <InputError className="mt-2" message={form.errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value="Email" />
                                        <TextInput className="mt-1 block w-full" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                        <InputError className="mt-2" message={form.errors.email} />
                                    </div>
                                    <div>
                                        <InputLabel value="Teléfono" />
                                        <TextInput className="mt-1 block w-full" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                                        <InputError className="mt-2" message={form.errors.phone} />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="DNI/Identificación" />
                                    <TextInput className="mt-1 block w-full" value={form.data.identity_doc} onChange={(e) => form.setData('identity_doc', e.target.value)} />
                                    <InputError className="mt-2" message={form.errors.identity_doc} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <PrimaryButton disabled={form.processing}>Guardar cambios</PrimaryButton>
                                    <span className="text-sm text-gray-600">Estado: {lead.status}</span>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                                <div className="mb-4 text-sm font-medium text-gray-700">Notas</div>
                                <form onSubmit={addNote} className="space-y-3">
                                    <textarea
                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        rows={4}
                                        value={noteForm.data.body}
                                        onChange={(e) => noteForm.setData('body', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={noteForm.errors.body} />
                                    <PrimaryButton disabled={noteForm.processing}>Agregar nota</PrimaryButton>
                                </form>
                                <div className="mt-6 space-y-3">
                                    {(lead.notes ?? []).map((n) => (
                                        <div key={n.id} className="rounded-md border p-3">
                                            <div className="text-xs text-gray-500">
                                                {n.createdBy?.name ?? '—'} · {new Date(n.created_at).toLocaleString()}
                                            </div>
                                            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{n.body}</div>
                                        </div>
                                    ))}
                                    {(lead.notes ?? []).length === 0 ? <div className="text-sm text-gray-500">Sin notas</div> : null}
                                </div>
                            </div>

                            <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                                <div className="mb-4 text-sm font-medium text-gray-700">Historial</div>
                                <div className="space-y-2">
                                    {(lead.histories ?? []).map((h) => (
                                        <div key={h.id} className="rounded-md border p-3 text-sm text-gray-800">
                                            <div className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString()}</div>
                                            <div className="mt-1">
                                                {(h.from_pipeline?.name ?? '—')}/{(h.from_stage?.name ?? '—')} → {(h.to_pipeline?.name ?? '—')}/
                                                {(h.to_stage?.name ?? '—')}
                                            </div>
                                        </div>
                                    ))}
                                    {(lead.histories ?? []).length === 0 ? <div className="text-sm text-gray-500">Sin movimientos</div> : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
