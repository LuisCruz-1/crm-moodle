import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

function leadTitle(lead) {
    const first = lead.first_name ?? '';
    const last = lead.last_name ?? '';
    const name = `${first} ${last}`.trim();
    return name || lead.email || `Lead #${lead.id}`;
}

export default function Index({ pipelines, selectedPipeline, leads }) {
    const stages = selectedPipeline?.stages ?? [];

    const grouped = Object.fromEntries(stages.map((s) => [s.id, []]));
    (leads ?? []).forEach((l) => {
        if (!grouped[l.stage_id]) grouped[l.stage_id] = [];
        grouped[l.stage_id].push(l);
    });

    const onPipelineChange = (e) => {
        const pipelineId = e.target.value;
        router.get(route('crm.kanban.index'), { pipeline_id: pipelineId }, { preserveState: true });
    };

    const moveLead = (leadId, stageId) => {
        router.post(route('crm.leads.move', leadId), { pipeline_id: selectedPipeline.id, stage_id: stageId }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Kanban</h2>}>
            <Head title="CRM · Kanban" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm font-medium text-gray-700">Pipeline</div>
                            <select
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm md:w-80"
                                value={selectedPipeline?.id ?? ''}
                                onChange={onPipelineChange}
                            >
                                {(pipelines ?? []).map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!selectedPipeline ? (
                        <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">No hay pipelines activos.</div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-4">
                            {stages.map((stage) => (
                                <div key={stage.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
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
                                            <div key={lead.id} className="rounded-md border p-3">
                                                <div className="text-sm font-medium text-gray-900">{leadTitle(lead)}</div>
                                                <div className="mt-1 text-xs text-gray-600">{lead.email ?? '—'}</div>
                                                <div className="mt-1 text-xs text-gray-600">{lead.phone ?? '—'}</div>

                                                <div className="mt-3">
                                                    <select
                                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm"
                                                        value={lead.stage_id}
                                                        onChange={(e) => moveLead(lead.id, Number(e.target.value))}
                                                    >
                                                        {stages.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.name}
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

