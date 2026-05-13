import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrmSubnav from '@/Components/CrmSubnav';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useEffect, useMemo, useState } from 'react';

function leadTitle(lead) {
    const first = lead.student?.first_name ?? lead.first_name ?? '';
    const last = lead.student?.last_name ?? lead.last_name ?? '';
    const name = `${first} ${last}`.trim();
    return name || lead.student?.email || lead.email || `Lead #${lead.id}`;
}

export default function Index({ pipelines, selectedPipeline, leads, filters, courses, salesUsers }) {
    const stages = selectedPipeline?.stages ?? [];
    const coursesById = useMemo(() => Object.fromEntries((courses ?? []).map((c) => [String(c.id), c])), [courses]);

    const grouped = Object.fromEntries(stages.map((s) => [s.id, []]));
    (leads ?? []).forEach((l) => {
        if (!grouped[l.stage_id]) grouped[l.stage_id] = [];
        grouped[l.stage_id].push(l);
    });

    const [conversion, setConversion] = useState({
        open: false,
        loading: false,
        lead: null,
        pipeline_id: null,
        stage_id: null,
        preview: null,
        use_student: false,
        errors: {},
        data: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            identity_doc: '',
        },
    });

    const openConversion = async ({ lead, pipelineId, stageId }) => {
        setConversion((s) => ({
            ...s,
            open: true,
            loading: true,
            lead,
            pipeline_id: pipelineId,
            stage_id: stageId,
            preview: null,
            errors: {},
            data: {
                first_name: lead.student?.first_name ?? lead.first_name ?? '',
                last_name: lead.student?.last_name ?? lead.last_name ?? '',
                email: lead.student?.email ?? lead.email ?? '',
                phone: lead.student?.phone ?? lead.phone ?? '',
                identity_doc: lead.student?.identity_doc ?? lead.identity_doc ?? '',
            },
        }));

        try {
            const res = await axios.post(route('crm.leads.conversion.preview', lead.id), { pipeline_id: pipelineId, stage_id: stageId });
            const student = res.data?.student ?? null;
            setConversion((s) => ({
                ...s,
                loading: false,
                preview: res.data,
                use_student: !!student,
                data: student
                    ? {
                          first_name: student.first_name ?? '',
                          last_name: student.last_name ?? '',
                          email: student.email ?? '',
                          phone: student.phone ?? '',
                          identity_doc: student.identity_doc ?? '',
                      }
                    : s.data,
                errors: {},
            }));
        } catch (e) {
            const message = e?.response?.data?.message ?? 'No se pudo preparar la conversión.';
            setConversion((s) => ({ ...s, loading: false, preview: null, errors: { general: message } }));
        }
    };

    const closeConversion = () => {
        setConversion((s) => ({ ...s, open: false, loading: false, lead: null, preview: null, errors: {} }));
    };

    const hasConverting = (leads ?? []).some((l) => l.status === 'converting');
    useEffect(() => {
        if (!hasConverting) return;
        const t = setInterval(() => {
            router.reload({ preserveScroll: true });
        }, 5000);
        return () => clearInterval(t);
    }, [hasConverting]);

    const applyFilters = (next) => {
        router.get(
            route('crm.kanban.index'),
            {
                pipeline_id: next.pipeline_id ?? filters?.pipeline_id ?? '',
                course_id: next.course_id ?? filters?.course_id ?? '',
                assigned_to_user_id: next.assigned_to_user_id ?? filters?.assigned_to_user_id ?? '',
            },
            { preserveState: true, replace: true },
        );
    };

    const moveLead = ({ leadId, pipelineId, stageId }) => {
        const stage = stages.find((s) => String(s.id) === String(stageId));
        const lead = (leads ?? []).find((l) => String(l.id) === String(leadId));
        if (stage?.is_won && lead) {
            openConversion({ lead, pipelineId, stageId });
            return;
        }

        router.post(route('crm.leads.move', leadId), { pipeline_id: pipelineId, stage_id: stageId }, { preserveScroll: true });
    };

    const onDragStart = (e, leadId) => {
        e.dataTransfer.setData('text/plain', String(leadId));
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDropToStage = (e, stageId) => {
        e.preventDefault();
        const leadId = Number(e.dataTransfer.getData('text/plain'));
        if (!leadId) return;
        moveLead({ leadId, pipelineId: selectedPipeline.id, stageId });
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const moveLeadToOtherPipeline = (leadId, toPipelineId) => {
        const pipeline = (pipelines ?? []).find((p) => String(p.id) === String(toPipelineId));
        const firstStageId = pipeline?.stages?.[0]?.id;
        if (!firstStageId) return;
        moveLead({ leadId, pipelineId: pipeline.id, stageId: firstStageId });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Kanban</h2>}>
            <Head title="CRM · Kanban" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-4 sm:px-6 lg:px-8">
                    <CrmSubnav />
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <div className="text-sm font-medium text-gray-700">Pipeline</div>
                                <select
                                    className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                    value={filters?.pipeline_id ?? selectedPipeline?.id ?? ''}
                                    onChange={(e) => applyFilters({ pipeline_id: e.target.value })}
                                >
                                    {(pipelines ?? []).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">Curso</div>
                                <select
                                    className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                    value={filters?.course_id ?? ''}
                                    onChange={(e) => applyFilters({ course_id: e.target.value })}
                                >
                                    <option value="">Todos</option>
                                    {(courses ?? []).map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.fullname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">Vendedor</div>
                                <select
                                    className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm"
                                    value={filters?.assigned_to_user_id ?? ''}
                                    onChange={(e) => applyFilters({ assigned_to_user_id: e.target.value })}
                                >
                                    <option value="">Todos</option>
                                    <option value="unassigned">Sin asignar</option>
                                    {(salesUsers ?? []).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end justify-end">
                                <Link className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white" href={route('crm.leads.create')}>
                                    Crear lead
                                </Link>
                            </div>
                        </div>
                    </div>

                    {!selectedPipeline ? (
                        <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">No hay pipelines activos.</div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-4">
                            {stages.map((stage) => (
                                <div
                                    key={stage.id}
                                    className="overflow-hidden rounded-lg bg-white shadow-sm"
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDropToStage(e, stage.id)}
                                >
                                    <div className="border-b border-gray-100 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm font-semibold text-gray-800">{stage.name}</div>
                                            {stage.is_won ? (
                                                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Ganado</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-4">
                                        {(grouped[stage.id] ?? []).map((lead) => (
                                            <div
                                                key={lead.id}
                                                className="rounded-md border p-3"
                                                draggable={lead.status !== 'won'}
                                                onDragStart={(e) => onDragStart(e, lead.id)}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <Link className="text-sm font-medium text-gray-900 hover:underline" href={route('crm.leads.show', lead.id)}>
                                                        {leadTitle(lead)}
                                                    </Link>
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">#{lead.id}</span>
                                                </div>
                                                <div className="mt-1 text-xs text-gray-600">{lead.student?.email ?? lead.email ?? '—'}</div>
                                                <div className="mt-1 text-xs text-gray-600">{lead.student?.phone ?? lead.phone ?? '—'}</div>
                                                <div className="mt-2">
                                                    {lead.status === 'converting' ? (
                                                        <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Convirtiendo</span>
                                                    ) : null}
                                                    {lead.status === 'conversion_failed' ? (
                                                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">Error</span>
                                                    ) : null}
                                                    {lead.status === 'won' ? (
                                                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Ganado</span>
                                                    ) : null}
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-2">
                                                    <select
                                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                        value={lead.stage_id}
                                                        disabled={lead.status === 'won'}
                                                        onChange={(e) =>
                                                            moveLead({
                                                                leadId: lead.id,
                                                                pipelineId: selectedPipeline.id,
                                                                stageId: Number(e.target.value),
                                                            })
                                                        }
                                                    >
                                                        {stages.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                        value={lead.pipeline_id}
                                                        disabled={lead.status === 'won'}
                                                        onChange={(e) => moveLeadToOtherPipeline(lead.id, e.target.value)}
                                                    >
                                                        {(pipelines ?? []).map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                        {(grouped[stage.id] ?? []).length === 0 ? (
                                            <div className="text-sm text-gray-500">Sin leads</div>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {conversion.open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
                        <div className="border-b border-gray-100 p-4">
                            <div className="text-sm font-semibold text-gray-900">Confirmar conversión</div>
                            <div className="mt-1 text-sm text-gray-600">
                                Lead: {leadTitle(conversion.lead)} · Curso: {coursesById?.[String(conversion.lead?.course_id)]?.fullname ?? '—'}
                            </div>
                        </div>
                        <div className="space-y-4 p-4">
                            {conversion.loading ? <div className="text-sm text-gray-700">Preparando…</div> : null}
                            {conversion.errors?.general ? <div className="text-sm text-red-600">{conversion.errors.general}</div> : null}

                            {conversion.preview?.plan ? (
                                <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-800">
                                    Al confirmar, se matricula en <span className="font-medium">{conversion.preview.course?.fullname ?? '—'}</span>
                                    {conversion.preview.cohort ? (
                                        <>
                                            {' '}
                                            - Cohorte <span className="font-medium">{conversion.preview.cohort.name}</span>
                                        </>
                                    ) : null}
                                    , y se generará un plan de pagos por un total de <span className="font-medium">{conversion.preview.plan.total}</span>.
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Nombres" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        disabled={conversion.use_student && (conversion.preview?.student?.first_name ?? '') !== ''}
                                        value={conversion.data.first_name}
                                        onChange={(e) => setConversion((s) => ({ ...s, data: { ...s.data, first_name: e.target.value } }))}
                                    />
                                    <InputError className="mt-2" message={conversion.errors.first_name} />
                                </div>
                                <div>
                                    <InputLabel value="Apellidos" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        disabled={conversion.use_student && (conversion.preview?.student?.last_name ?? '') !== ''}
                                        value={conversion.data.last_name}
                                        onChange={(e) => setConversion((s) => ({ ...s, data: { ...s.data, last_name: e.target.value } }))}
                                    />
                                    <InputError className="mt-2" message={conversion.errors.last_name} />
                                </div>
                                <div>
                                    <InputLabel value="Email" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        disabled={conversion.use_student && (conversion.preview?.student?.email ?? '') !== ''}
                                        value={conversion.data.email}
                                        onChange={(e) => setConversion((s) => ({ ...s, data: { ...s.data, email: e.target.value } }))}
                                    />
                                    <InputError className="mt-2" message={conversion.errors.email} />
                                </div>
                                <div>
                                    <InputLabel value="Teléfono (opcional)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        disabled={conversion.use_student && (conversion.preview?.student?.phone ?? '') !== ''}
                                        value={conversion.data.phone}
                                        onChange={(e) => setConversion((s) => ({ ...s, data: { ...s.data, phone: e.target.value } }))}
                                    />
                                    <InputError className="mt-2" message={conversion.errors.phone} />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel value="Documento (DNI)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        disabled={conversion.use_student && (conversion.preview?.student?.identity_doc ?? '') !== ''}
                                        value={conversion.data.identity_doc}
                                        onChange={(e) => setConversion((s) => ({ ...s, data: { ...s.data, identity_doc: e.target.value } }))}
                                    />
                                    <InputError className="mt-2" message={conversion.errors.identity_doc} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">
                            <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={closeConversion}>
                                Cancelar
                            </button>
                            <PrimaryButton
                                onClick={() => {
                                    setConversion((s) => ({ ...s, loading: true }));
                                    axios
                                        .post(route('crm.leads.conversion.confirm', conversion.lead.id), {
                                            pipeline_id: conversion.pipeline_id,
                                            stage_id: conversion.stage_id,
                                            ...conversion.data,
                                        })
                                        .then(() => {
                                            closeConversion();
                                            router.reload({ preserveScroll: true });
                                        })
                                        .catch((e) => {
                                            const errors = e?.response?.data?.errors ?? {};
                                            const message = e?.response?.data?.message ?? null;
                                            setConversion((s) => ({
                                                ...s,
                                                errors: {
                                                    ...errors,
                                                    ...(message ? { general: message } : {}),
                                                },
                                            }));
                                        })
                                        .finally(() => setConversion((s) => ({ ...s, loading: false })));
                                }}
                                disabled={conversion.loading}
                            >
                                {conversion.loading ? 'Procesando…' : 'Confirmar'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            ) : null}
        </AuthenticatedLayout>
    );
}
