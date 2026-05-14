import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function Index({ students, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('students.index'), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Estudiantes</h2>}>
            <Head title="Estudiantes" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                            <TextInput
                                className="w-full"
                                placeholder="Buscar por email, nombre, DNI..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <PrimaryButton type="submit">Buscar</PrimaryButton>
                        </form>
                        <Link className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white" href={route('students.create')}>
                            Nuevo estudiante
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">DNI</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cursos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Moodle ID</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {(students?.data ?? []).map((student) => (
                                    <tr key={student.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            <Link className="hover:underline text-indigo-600 font-medium" href={route('students.show', student.id)}>
                                                {`${student.first_name ?? ''} ${student.last_name ?? ''}`.trim()}
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{student.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{student.identity_doc ?? '—'}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{student.enrollments_count ?? 0}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{student.lms_user_id ?? '—'}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                                            {student.is_suspended ? (
                                                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Suspendido</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(students?.data ?? []).length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">No se encontraron estudiantes.</div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
