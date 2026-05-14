import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CommsSubnav from '@/Components/CommsSubnav';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import Card from '@/Components/Card';
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

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
        <AuthenticatedLayout header={`Editar Plantilla: ${template.name}`}>
            <Head title={`Editar Plantilla - ${template.name}`} />

            <div className="space-y-6">
                <CommsSubnav />
                
                <Card>
                    <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-surface-200 pb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                                <CodeBracketIcon className="h-5 w-5 text-primary-600" />
                                Configuración del Correo
                            </h2>
                            <p className="mt-2 text-sm text-surface-600 leading-relaxed">
                                Puedes utilizar las siguientes variables dinámicas en el asunto y el cuerpo del correo: <br/>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{app_name}'}</span>
                                    <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{student_name}'}</span>
                                    {template.key === 'welcome_student' && (
                                        <>
                                            <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{student_email}'}</span>
                                            <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{student_password}'}</span>
                                            <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{portal_url}'}</span>
                                        </>
                                    )}
                                    {(template.key === 'payment_receipt' || template.key === 'installment_reminder') && (
                                        <>
                                            <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{amount}'}</span>
                                            <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{concept}'}</span>
                                            <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{course_name}'}</span>
                                        </>
                                    )}
                                    {template.key === 'installment_reminder' && (
                                        <span className="font-mono bg-primary-50 px-2 py-1 rounded-md text-primary-700 text-xs font-medium border border-primary-100">{'{due_date}'}</span>
                                    )}
                                </div>
                            </p>
                        </div>
                        <Link href={route('comms.templates.index')}>
                            <SecondaryButton>Volver</SecondaryButton>
                        </Link>
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
                            <div className="mt-1 border border-surface-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                                <Editor
                                    onInit={(evt, editor) => editorRef.current = editor}
                                    initialValue={data.body}
                                    init={{
                                        height: 500,
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
                                        content_style: 'body { font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"; font-size:14px; line-height: 1.5; color: #334155; }'
                                    }}
                                    onEditorChange={(content) => setData('body', content)}
                                />
                            </div>
                            <InputError className="mt-2" message={errors.body} />
                        </div>

                        <div className="block bg-surface-50 p-4 rounded-lg border border-surface-200">
                            <label className="flex items-center">
                                <Checkbox
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <span className="ms-3 text-sm font-medium text-surface-700">Plantilla Activa</span>
                                <span className="ms-2 text-sm text-surface-500 hidden sm:inline">(Si se desactiva, el sistema no enviará este correo automático)</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-surface-200">
                            <PrimaryButton disabled={processing}>Guardar Cambios</PrimaryButton>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}