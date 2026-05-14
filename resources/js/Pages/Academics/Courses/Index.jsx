import AcademicsSubnav from '@/Components/AcademicsSubnav';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';

export default function Index({ courses }) {
    return (
        <AuthenticatedLayout header="Académico · Cursos">
            <Head title="Académico · Cursos" />

            <div className="space-y-6">
                <AcademicsSubnav />
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-surface-200">
                            <thead className="bg-surface-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Curso</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Shortname</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Cohortes</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Visible</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-surface-100">
                                {(courses?.data ?? []).map((c) => (
                                    <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">
                                            <Link className="text-primary-600 hover:text-primary-900" href={route('academics.courses.show', c.id)}>
                                                {c.fullname}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">{c.shortname}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                {c.cohorts_count} cohortes
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">
                                            {c.visible ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Sí
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    No
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(courses?.data ?? []).length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-surface-500 text-sm">No hay cursos disponibles.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
