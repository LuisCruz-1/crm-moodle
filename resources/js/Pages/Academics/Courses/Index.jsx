import AcademicsSubnav from '@/Components/AcademicsSubnav';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ courses }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Académico · Cursos</h2>}>
            <Head title="Académico · Cursos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <AcademicsSubnav />
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Curso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Shortname</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cohortes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Visible</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {(courses?.data ?? []).map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <Link className="hover:underline" href={route('academics.courses.show', c.id)}>
                                                    {c.fullname}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{c.shortname}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{c.cohorts_count}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{c.visible ? 'Sí' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
