import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Card from '@/Components/Card';
import { useState } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function Index({ students, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('students.index'), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header="Estudiantes">
            <Head title="Estudiantes" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <Card className="!p-0">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
                            <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
                                <div className="relative flex-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <TextInput
                                        className="block w-full pl-10"
                                        placeholder="Buscar por email, nombre, DNI..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <PrimaryButton type="submit">Buscar</PrimaryButton>
                            </form>
                            <Link href={route('students.create')}>
                                <PrimaryButton className="flex w-full items-center justify-center gap-2 md:w-auto">
                                    <UserPlusIcon className="h-5 w-5" />
                                    Nuevo estudiante
                                </PrimaryButton>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estudiante</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">DNI</th>
                                        <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Cursos</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Moodle ID</th>
                                        <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {(students?.data ?? []).map((student) => (
                                        <tr key={student.id} className="transition-colors hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                                                        {student.first_name?.[0] ?? ''}{student.last_name?.[0] ?? ''}
                                                    </div>
                                                    <Link className="text-sm font-medium text-primary-600 hover:text-primary-800" href={route('students.show', student.id)}>
                                                        {`${student.first_name ?? ''} ${student.last_name ?? ''}`.trim()}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{student.email}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{student.identity_doc ?? '—'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-600">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                    {student.enrollments_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {student.lms_user_id ? `#${student.lms_user_id}` : '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                {student.is_suspended ? (
                                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Suspendido</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(students?.data ?? []).length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin resultados</h3>
                                    <p className="mt-1 text-sm text-gray-500">No se encontraron estudiantes con los criterios de búsqueda.</p>
                                </div>
                            ) : null}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
