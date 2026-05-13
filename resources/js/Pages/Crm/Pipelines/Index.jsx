import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

function moveItem(list, fromIndex, toIndex) {
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

export default function Index({ pipelines }) {
    const createPipeline = useForm({
        name: '',
        type: '',
        is_active: true,
    });

    const addStageForms = Object.fromEntries(
        (pipelines ?? []).map((p) => [
            p.id,
            useForm({ name: '', is_won: false, is_active: true }),
        ]),
    );

    const submitCreatePipeline = (e) => {
        e.preventDefault();
        createPipeline.post(route('crm.pipelines.store'), {
            onSuccess: () => createPipeline.reset('name', 'type'),
        });
    };

    const updatePipeline = (pipeline) => {
        router.put(
            route('crm.pipelines.update', pipeline.id),
            {
                name: pipeline.name,
                type: pipeline.type ?? '',
                is_active: !!pipeline.is_active,
            },
            { preserveScroll: true },
        );
    };

    const deletePipeline = (pipelineId) => {
        router.delete(route('crm.pipelines.destroy', pipelineId), {
            preserveScroll: true,
        });
    };

    const submitAddStage = (pipelineId) => (e) => {
        e.preventDefault();
        const form = addStageForms[pipelineId];
        form.post(route('crm.pipelines.stages.store', pipelineId), {
            preserveScroll: true,
            onSuccess: () => form.reset('name'),
        });
    };

    const updateStage = (pipelineId, stage) => {
        router.put(
            route('crm.pipelines.stages.update', [pipelineId, stage.id]),
            {
                name: stage.name,
                position: stage.position,
                is_won: !!stage.is_won,
                is_active: !!stage.is_active,
            },
            { preserveScroll: true },
        );
    };

    const deleteStage = (pipelineId, stageId) => {
        router.delete(route('crm.pipelines.stages.destroy', [pipelineId, stageId]), {
            preserveScroll: true,
        });
    };

    const reorderStages = (pipelineId, stages, fromIndex, toIndex) => {
        const nextStages = moveItem(stages, fromIndex, toIndex);
        router.post(
            route('crm.pipelines.stages.reorder', pipelineId),
            { stage_ids: nextStages.map((s) => s.id) },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Pipelines</h2>}>
            <Head title="CRM · Pipelines" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
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
                            <div key={pipeline.id} className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="border-b border-gray-100 p-6">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="md:col-span-2">
                                                <InputLabel value="Nombre" />
                                                <TextInput
                                                    className="mt-1 block w-full"
                                                    value={pipeline.name}
                                                    onChange={(e) => {
                                                        pipeline.name = e.target.value;
                                                    }}
                                                    onBlur={() => updatePipeline(pipeline)}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Tipo" />
                                                <TextInput
                                                    className="mt-1 block w-full"
                                                    value={pipeline.type ?? ''}
                                                    onChange={(e) => {
                                                        pipeline.type = e.target.value;
                                                    }}
                                                    onBlur={() => updatePipeline(pipeline)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                className="rounded-md border px-3 py-2 text-sm"
                                                onClick={() => deletePipeline(pipeline.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-4 text-sm font-medium text-gray-700">Etapas</div>
                                    <div className="space-y-2">
                                        {(pipeline.stages ?? []).map((stage, idx) => (
                                            <div key={stage.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center">
                                                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                                                    <TextInput
                                                        className="block w-full md:max-w-md"
                                                        value={stage.name}
                                                        onChange={(e) => {
                                                            stage.name = e.target.value;
                                                        }}
                                                        onBlur={() => updateStage(pipeline.id, stage)}
                                                    />
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!stage.is_won}
                                                            onChange={(e) => {
                                                                stage.is_won = e.target.checked;
                                                                updateStage(pipeline.id, stage);
                                                            }}
                                                        />
                                                        Ganado
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!stage.is_active}
                                                            onChange={(e) => {
                                                                stage.is_active = e.target.checked;
                                                                updateStage(pipeline.id, stage);
                                                            }}
                                                        />
                                                        Activa
                                                    </label>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                                        disabled={idx === 0}
                                                        onClick={() => reorderStages(pipeline.id, pipeline.stages, idx, idx - 1)}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                                        disabled={idx === (pipeline.stages?.length ?? 0) - 1}
                                                        onClick={() => reorderStages(pipeline.id, pipeline.stages, idx, idx + 1)}
                                                    >
                                                        ↓
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-md border px-3 py-2 text-sm"
                                                        onClick={() => deleteStage(pipeline.id, stage.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        <form onSubmit={submitAddStage(pipeline.id)} className="flex flex-col gap-3 md:flex-row md:items-end">
                                            <div className="flex-1">
                                                <InputLabel value="Nueva etapa" />
                                                <TextInput
                                                    className="mt-1 block w-full"
                                                    value={addStageForms[pipeline.id].data.name}
                                                    onChange={(e) => addStageForms[pipeline.id].setData('name', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={addStageForms[pipeline.id].errors.name} />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={!!addStageForms[pipeline.id].data.is_won}
                                                    onChange={(e) => addStageForms[pipeline.id].setData('is_won', e.target.checked)}
                                                />
                                                Ganado
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={!!addStageForms[pipeline.id].data.is_active}
                                                    onChange={(e) => addStageForms[pipeline.id].setData('is_active', e.target.checked)}
                                                />
                                                Activa
                                            </label>
                                            <PrimaryButton disabled={addStageForms[pipeline.id].processing}>Agregar</PrimaryButton>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

