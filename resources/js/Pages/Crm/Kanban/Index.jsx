import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrmSubnav from '@/Components/CrmSubnav';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Card from '@/Components/Card';
import Modal from '@/Components/Modal';
import { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

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
        e.currentTarget.classList.remove('ring-2', 'ring-primary-500', 'bg-surface-100');
        const leadId = Number(e.dataTransfer.getData('text/plain'));
        if (!leadId) return;
        moveLead({ leadId, pipelineId: selectedPipeline.id, stageId });
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDragEnter = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('ring-2', 'ring-primary-500', 'bg-surface-100');
    };

    const onDragLeave = (e) => {
        e.currentTarget.classList.remove('ring-2', 'ring-primary-500', 'bg-surface-100');
    };

    const moveLeadToOtherPipeline = (leadId, toPipelineId) => {
        const pipeline = (pipelines ?? []).find((p) => String(p.id) === String(toPipelineId));
        const firstStageId = pipeline?.stages?.[0]?.id;
        if (!firstStageId) return;
        moveLead({ leadId, pipelineId: pipeline.id, stageId: firstStageId });
    };

    return (
        <AuthenticatedLayout header="CRM · Kanban">
            <Head title="CRM · Kanban" />

            <div className="space-y-6">
                <CrmSubnav />
                
                <Card>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
                        <div>
                            <InputLabel value="Pipeline" />
                            <SelectInput
                                className="mt-1 w-full"
                                value={filters?.pipeline_id ?? selectedPipeline?.id ?? ''}
                                onChange={(e) => applyFilters({ pipeline_id: e.target.value })}
                            >
                                {(pipelines ?? []).map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <div>
                            <InputLabel value="Curso" />
                            <SelectInput
                                className="mt-1 w-full"
                                value={filters?.course_id ?? ''}
                                onChange={(e) => applyFilters({ course_id: e.target.value })}
                            >
                                <option value="">Todos</option>
                                {(courses ?? []).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.fullname}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <div>
                            <InputLabel value="Vendedor" />
                            <SelectInput
                                className="mt-1 w-full"
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
                            </SelectInput>
                        </div>
                        <div className="flex justify-end">
                            <Link className="btn-primary flex items-center" href={route('crm.leads.create')}>
                                <PlusIcon className="w-5 h-5 mr-1" />
                                Crear lead
                            </Link>
                        </div>
                    </div>
                </Card>

                {!selectedPipeline ? (
                    <Card>
                        <p className="text-surface-500 text-center py-8">No hay pipelines activos.</p>
                    </Card>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-4 items-start">
                        {stages.map((stage) => (
                            <div
                                key={stage.id}
                                className="flex-shrink-0 w-80 bg-surface-100/50 border border-surface-200 rounded-xl overflow-hidden flex flex-col max-h-[75vh] transition-colors"
                                onDragOver={onDragOver}
                                onDragEnter={onDragEnter}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDropToStage(e, stage.id)}
                            >
                                <div className="p-4 bg-surface-100 border-b border-surface-200">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-semibold text-surface-800 uppercase tracking-wider">{stage.name}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white text-surface-600 text-xs font-medium px-2.5 py-0.5 rounded-full border border-surface-200">
                                                {(grouped[stage.id] ?? []).length}
                                            </span>
                                            {stage.is_won ? (
                                                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 font-medium">Ganado</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[100px]">
                                    {(grouped[stage.id] ?? []).map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="bg-white rounded-lg p-4 shadow-sm border border-surface-200 cursor-grab active:cursor-grabbing hover:border-primary-300 hover:shadow-md transition-all group"
                                            draggable={lead.status !== 'won'}
                                            onDragStart={(e) => onDragStart(e, lead.id)}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <Link className="text-sm font-semibold text-surface-900 hover:text-primary-600 transition-colors" href={route('crm.leads.show', lead.id)}>
                                                    {leadTitle(lead)}
                                                </Link>
                                                <span className="text-xs font-medium text-surface-400">#{lead.id}</span>
                                            </div>
                                            <div className="text-xs text-surface-500 mb-1 truncate" title={lead.student?.email ?? lead.email}>{lead.student?.email ?? lead.email ?? '—'}</div>
                                            <div className="text-xs text-surface-500 mb-3">{lead.student?.phone ?? lead.phone ?? '—'}</div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {lead.status === 'converting' && (
                                                    <span className="rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 border border-yellow-200">Convirtiendo</span>
                                                )}
                                                {lead.status === 'conversion_failed' && (
                                                    <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 border border-red-200">Error</span>
                                                )}
                                                {lead.status === 'won' && (
                                                    <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">Ganado</span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 pt-3 border-t border-surface-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <SelectInput
                                                    className="w-full text-xs py-1"
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
                                                </SelectInput>
                                            </div>
                                        </div>
                                    ))}
                                    {(grouped[stage.id] ?? []).length === 0 ? (
                                        <div className="text-sm text-surface-400 text-center py-6 border-2 border-dashed border-surface-200 rounded-lg">Arrastra un lead aquí</div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal show={conversion.open} onClose={closeConversion} maxWidth="2xl">
                <div className="p-6">
                    <div className="border-b border-surface-100 pb-4 mb-4">
                        <h2 className="text-lg font-semibold text-surface-900">Confirmar Conversión a Estudiante</h2>
                        <p className="mt-1 text-sm text-surface-500">
                            Lead: <span className="font-medium text-surface-800">{leadTitle(conversion.lead)}</span> · Curso: <span className="font-medium text-surface-800">{coursesById?.[String(conversion.lead?.course_id)]?.fullname ?? '—'}</span>
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        {conversion.loading ? <div className="text-sm text-primary-600 font-medium animate-pulse">Preparando datos de matriculación...</div> : null}
                        {conversion.errors?.general ? <div className="p-3 rounded-lg bg-red-50 text-sm text-red-600 border border-red-200">{conversion.errors.general}</div> : null}

                        {conversion.preview?.plan ? (
                            <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 text-sm text-primary-800 shadow-sm">
                                Al confirmar, el lead será matriculado en <strong className="font-semibold">{conversion.preview.course?.fullname ?? '—'}</strong>
                                {conversion.preview.cohort ? (
                                    <> - Cohorte <strong className="font-semibold">{conversion.preview.cohort.name}</strong></>
                                ) : null}
                                , y se generará automáticamente su plan de pagos por un total de <strong className="font-semibold">{conversion.preview.plan.total}</strong>.
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
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
                    
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-100">
                        <button type="button" className="btn-secondary" onClick={closeConversion}>
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
                            {conversion.loading ? 'Procesando...' : 'Confirmar Conversión'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
