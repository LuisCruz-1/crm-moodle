import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CrmSubnav from '@/Components/CrmSubnav';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

function moveItem(list, fromIndex, toIndex) {
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

function PipelineCard({ pipeline }) {
    const addStage = useForm({ name: '', is_won: false, is_active: true });

    const updatePipelineFromEvent = (field) => (e) => {
        router.put(
            route('crm.pipelines.update', pipeline.id),
            {
                name: field === 'name' ? e.target.value : pipeline.name,
                type: field === 'type' ? e.target.value : pipeline.type ?? '',
                is_active: !!pipeline.is_active,
            },
            { preserveScroll: true },
        );
    };

    const deletePipeline = () => {
        router.delete(route('crm.pipelines.destroy', pipeline.id), { preserveScroll: true });
    };

    const submitAddStage = (e) => {
        e.preventDefault();
        addStage.post(route('crm.pipelines.stages.store', pipeline.id), {
            preserveScroll: true,
            onSuccess: () => addStage.reset('name'),
        });
    };

    const updateStage = (stageId, data) => {
        router.put(route('crm.pipelines.stages.update', [pipeline.id, stageId]), data, { preserveScroll: true });
    };

    const deleteStage = (stageId) => {
        router.delete(route('crm.pipelines.stages.destroy', [pipeline.id, stageId]), { preserveScroll: true });
    };

    const reorderStages = (stages, fromIndex, toIndex) => {
        const nextStages = moveItem(stages, fromIndex, toIndex);
        router.post(
            route('crm.pipelines.stages.reorder', pipeline.id),
            { stage_ids: nextStages.map((s) => s.id) },
            { preserveScroll: true },
        );
    };

    const onStageDragStart = (e, stageId) => {
        e.dataTransfer.setData('text/plain', String(stageId));
        e.dataTransfer.effectAllowed = 'move';
    };

    const onStageDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onStageDrop = (e, stages, toStageId) => {
        e.preventDefault();
        const fromStageId = Number(e.dataTransfer.getData('text/plain'));
        if (!fromStageId) return;
        const fromIndex = stages.findIndex((s) => s.id === fromStageId);
        const toIndex = stages.findIndex((s) => s.id === toStageId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
        reorderStages(stages, fromIndex, toIndex);
    };

    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="border-b border-gray-100 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <InputLabel value="Nombre" />
                            <TextInput className="mt-1 block w-full" defaultValue={pipeline.name} onBlur={updatePipelineFromEvent('name')} />
                        </div>
                        <div>
                            <InputLabel value="Tipo" />
                            <TextInput className="mt-1 block w-full" defaultValue={pipeline.type ?? ''} onBlur={updatePipelineFromEvent('type')} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={deletePipeline}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-4 text-sm font-medium text-gray-700">Etapas</div>
                <div className="space-y-2">
                    {(pipeline.stages ?? []).map((stage, idx) => (
                        <div
                            key={stage.id}
                            className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center"
                            draggable
                            onDragStart={(e) => onStageDragStart(e, stage.id)}
                            onDragOver={onStageDragOver}
                            onDrop={(e) => onStageDrop(e, pipeline.stages ?? [], stage.id)}
                        >
                            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                                <TextInput
                                    className="block w-full md:max-w-md"
                                    defaultValue={stage.name}
                                    onBlur={(e) =>
                                        updateStage(stage.id, {
                                            name: e.target.value,
                                            position: stage.position,
                                            is_won: !!stage.is_won,
                                            is_active: !!stage.is_active,
                                        })
                                    }
                                />
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        defaultChecked={!!stage.is_won}
                                        onChange={(e) =>
                                            updateStage(stage.id, {
                                                name: stage.name,
                                                position: stage.position,
                                                is_won: e.target.checked,
                                                is_active: !!stage.is_active,
                                            })
                                        }
                                    />
                                    Ganado
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        defaultChecked={!!stage.is_active}
                                        onChange={(e) =>
                                            updateStage(stage.id, {
                                                name: stage.name,
                                                position: stage.position,
                                                is_won: !!stage.is_won,
                                                is_active: e.target.checked,
                                            })
                                        }
                                    />
                                    Activa
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                    disabled={idx === 0}
                                    onClick={() => reorderStages(pipeline.stages ?? [], idx, idx - 1)}
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                    disabled={idx === (pipeline.stages?.length ?? 0) - 1}
                                    onClick={() => reorderStages(pipeline.stages ?? [], idx, idx + 1)}
                                >
                                    ↓
                                </button>
                                <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => deleteStage(stage.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <form onSubmit={submitAddStage} className="flex flex-col gap-3 md:flex-row md:items-end">
                        <div className="flex-1">
                            <InputLabel value="Nueva etapa" />
                            <TextInput className="mt-1 block w-full" value={addStage.data.name} onChange={(e) => addStage.setData('name', e.target.value)} />
                            <InputError className="mt-2" message={addStage.errors.name} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={!!addStage.data.is_won} onChange={(e) => addStage.setData('is_won', e.target.checked)} />
                            Ganado
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={!!addStage.data.is_active} onChange={(e) => addStage.setData('is_active', e.target.checked)} />
                            Activa
                        </label>
                        <PrimaryButton disabled={addStage.processing}>Agregar</PrimaryButton>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Index({ pipelines }) {
    const createPipeline = useForm({
        name: '',
        type: '',
        is_active: true,
    });

    const submitCreatePipeline = (e) => {
        e.preventDefault();
        createPipeline.post(route('crm.pipelines.store'), {
            onSuccess: () => createPipeline.reset('name', 'type'),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Pipelines</h2>}>
            <Head title="CRM · Pipelines" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CrmSubnav />
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submitCreatePipeline} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="pipeline_name" value="Nombre" />
                                <TextInput
                                    id="pipeline_name"
                                    className="mt-1 block w-full"
                                    value={createPipeline.data.name}
                                    onChange={(e) => createPipeline.setData('name', e.target.value)}
                                />
                                <InputError className="mt-2" message={createPipeline.errors.name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="pipeline_type" value="Tipo (opcional)" />
                                <TextInput
                                    id="pipeline_type"
                                    className="mt-1 block w-full"
                                    value={createPipeline.data.type}
                                    onChange={(e) => createPipeline.setData('type', e.target.value)}
                                />
                                <InputError className="mt-2" message={createPipeline.errors.type} />
                            </div>
                            <div className="flex items-end">
                                <PrimaryButton disabled={createPipeline.processing}>Crear</PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {(pipelines ?? []).map((pipeline) => (
                            <PipelineCard key={pipeline.id} pipeline={pipeline} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
