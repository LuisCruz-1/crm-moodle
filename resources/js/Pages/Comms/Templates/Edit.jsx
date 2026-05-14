import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CommsSubnav from '@/Components/CommsSubnav';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

export default function Edit({ template }) {
    const editorRef = useRef(null);

    const { data, setData, put, processing, errors } = useForm({
        subject: template.subject || '',
        body: template.body || '',
        is_active: template.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        if (editorRef.current) {
            data.body = editorRef.current.getContent();
        }
        put(route('comms.templates.update', template.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Plantilla: {template.name}</h2>}>
            <Head title={`Editar Plantilla - ${template.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <CommsSubnav />
                    
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <header className="mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Configuración del Correo</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Puedes utilizar las siguientes variables en el asunto y el cuerpo del correo: <br/>
                                    <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{app_name}'}</span>, 
                                    <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600"> {'{student_name}'}</span>
                                    {template.key === 'welcome_student' && <>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{student_email}'}</span>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{student_password}'}</span>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{portal_url}'}</span></>}
                                    {(template.key === 'payment_receipt' || template.key === 'installment_reminder') && <>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{amount}'}</span>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{concept}'}</span>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{course_name}'}</span></>}
                                    {template.key === 'installment_reminder' && <>, <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{'{due_date}'}</span></>}
                                </p>
                            </div>
                            <Link href={route('comms.templates.index')} className="text-sm text-gray-600 underline hover:text-gray-900">Volver</Link>
                        </header>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="subject" value="Asunto del Correo" />
                                <TextInput
                                    id="subject"
                                    className="mt-1 block w-full"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={errors.subject} />
                            </div>

                            <div>
                                <InputLabel htmlFor="body" value="Cuerpo del Correo (HTML)" />
                                <div className="mt-1 border border-gray-300 rounded-md">
                                    <Editor
                                        onInit={(evt, editor) => editorRef.current = editor}
                                        initialValue={data.body}
                                        init={{
                                            height: 400,
                                            menubar: false,
                                            plugins: [
                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                            ],
                                            toolbar: 'undo redo | blocks | ' +
                                                'bold italic forecolor | alignleft aligncenter ' +
                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                'removeformat | help',
                                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                        }}
                                        onEditorChange={(content) => setData('body', content)}
                                    />
                                </div>
                                <InputError className="mt-2" message={errors.body} />
                            </div>

                            <div className="block">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">Plantilla Activa (Si se desactiva, el sistema no enviará este correo automático)</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Guardar Plantilla</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}