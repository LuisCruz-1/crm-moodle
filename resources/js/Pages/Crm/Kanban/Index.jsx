import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrmSubnav from '@/Components/CrmSubnav';
import { Head, Link, router } from '@inertiajs/react';

function leadTitle(lead) {
    const first = lead.first_name ?? '';
    const last = lead.last_name ?? '';
    const name = `${first} ${last}`.trim();
    return name || lead.email || `Lead #${lead.id}`;
}

export default function Index({ pipelines, selectedPipeline, leads, filters, courses, salesUsers }) {
    const stages = selectedPipeline?.stages ?? [];

    const grouped = Object.fromEntries(stages.map((s) => [s.id, []]));
    (leads ?? []).forEach((l) => {
        if (!grouped[l.stage_id]) grouped[l.stage_id] = [];
        grouped[l.stage_id].push(l);
    });

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
                                                draggable
                                                onDragStart={(e) => onDragStart(e, lead.id)}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <Link className="text-sm font-medium text-gray-900 hover:underline" href={route('crm.leads.show', lead.id)}>
                                                        {leadTitle(lead)}
                                                    </Link>
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">#{lead.id}</span>
                                                </div>
                                                <div className="mt-1 text-xs text-gray-600">{lead.email ?? '—'}</div>
                                                <div className="mt-1 text-xs text-gray-600">{lead.phone ?? '—'}</div>

                                                <div className="mt-3 grid grid-cols-1 gap-2">
                                                    <select
                                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                        value={lead.stage_id}
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
        </AuthenticatedLayout>
    );
}
