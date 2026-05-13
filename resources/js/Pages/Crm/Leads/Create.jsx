import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function Create({ pipelines, courses, cohorts }) {
    const form = useForm({
        pipeline_id: pipelines?.[0]?.id ?? '',
        stage_id: pipelines?.[0]?.stages?.[0]?.id ?? '',
        course_id: courses?.[0]?.id ?? '',
        cohort_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        identity_doc: '',
    });

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

    const submit = (e) => {
        e.preventDefault();
        form.post(route('crm.leads.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CRM · Crear lead</h2>}>
            <Head title="CRM · Crear lead" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
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
                                <PrimaryButton disabled={form.processing}>Guardar</PrimaryButton>
                                <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => router.visit(route('crm.leads.index'))}>
                                    Volver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

