import PortalLayout from '@/Layouts/Portal/PortalLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ student, enrollments }) {
    return (
        <PortalLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mis Cursos</h2>}
        >
            <Head title="Mis Cursos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {enrollments.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-900">
                            No estás matriculado en ningún curso actualmente.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {enrollment.course.fullname}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Matriculado el: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                        </p>
                                        
                                        <div className="mt-4">
                                            <a 
                                                href={route('portal.moodle.login', enrollment.course.id)}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150 w-full justify-center"
                                            >
                                                Ir al Aula Virtual
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
}
