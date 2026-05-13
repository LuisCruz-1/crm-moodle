import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ student }) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: student.first_name ?? '',
        last_name: student.last_name ?? '',
        email: student.email ?? '',
        identity_doc: student.identity_doc ?? '',
        phone: student.phone ?? '',
    });

    const { data: pwdData, setData: setPwdData, put: putPwd, processing: pwdProcessing, errors: pwdErrors, reset: resetPwd } = useForm({
        password: '',
        update_moodle: true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('students.update', student.id));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        putPwd(route('students.update_password', student.id), {
            preserveScroll: true,
            onSuccess: () => resetPwd(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Estudiante</h2>}>
            <Head title="Editar Estudiante" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Nombres" />
                                    <TextInput className="mt-1 block w-full" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
                                    <InputError message={errors.first_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Apellidos" />
                                    <TextInput className="mt-1 block w-full" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                                    <InputError message={errors.last_name} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Email" />
                                <TextInput className="mt-1 block w-full" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="DNI/Identificación" />
                                    <TextInput className="mt-1 block w-full" value={data.identity_doc} onChange={(e) => setData('identity_doc', e.target.value)} required />
                                    <InputError message={errors.identity_doc} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Teléfono (opcional)" />
                                    <TextInput className="mt-1 block w-full" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Guardar cambios</PrimaryButton>
                                <Link href={route('students.show', student.id)} className="text-sm text-gray-600 hover:text-gray-900">
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>

                    <div className="mt-6 overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Gestionar Contraseña (Portal y Moodle)</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Asigna una nueva contraseña al estudiante. Esta será usada para acceder al Portal del Alumno. 
                            Si marcas la opción, también se actualizará su contraseña en el Aula Virtual (Moodle).
                        </p>
                        
                        <form onSubmit={submitPassword} className="space-y-6">
                            <div>
                                <InputLabel value="Nueva Contraseña" />
                                <TextInput 
                                    className="mt-1 block w-full" 
                                    type="text" 
                                    value={pwdData.password} 
                                    onChange={(e) => setPwdData('password', e.target.value)} 
                                    required 
                                />
                                <InputError message={pwdErrors.password} className="mt-2" />
                            </div>

                            <div className="block mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="update_moodle"
                                        checked={pwdData.update_moodle}
                                        onChange={(e) => setPwdData('update_moodle', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Actualizar también en Moodle (Aula Virtual)</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={pwdProcessing}>Actualizar Contraseña</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
