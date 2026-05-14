import PortalLayout from '@/Layouts/Portal/PortalLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { AcademicCapIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ student, enrollments }) {
    return (
        <PortalLayout header="Mis Cursos">
            <Head title="Mis Cursos" />

            <div className="space-y-6">
                {enrollments.length === 0 ? (
                    <Card>
                        <div className="flex flex-col items-center justify-center py-12">
                            <AcademicCapIcon className="h-12 w-12 text-surface-400 mb-4" />
                            <p className="text-surface-600 text-lg font-medium">No estás matriculado en ningún curso actualmente.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.map((enrollment) => (
                            <Card key={enrollment.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex-grow">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="bg-primary-100 p-2 rounded-lg">
                                            <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-surface-900 leading-tight">
                                            {enrollment.course.fullname}
                                        </h3>
                                    </div>
                                    <div className="text-sm text-surface-500 mb-6 flex flex-col space-y-1">
                                        <span>Matriculado el: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-surface-100">
                                    {student.is_suspended ? (
                                        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg font-medium border border-red-100">
                                            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                                            <span>Acceso bloqueado por Mora. Por favor, regularice sus pagos.</span>
                                        </div>
                                    ) : (
                                        <a 
                                            href={route('portal.moodle.login', enrollment.course.id)}
                                            className="w-full"
                                        >
                                            <PrimaryButton className="w-full justify-center">
                                                Ir al Aula Virtual
                                            </PrimaryButton>
                                        </a>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
