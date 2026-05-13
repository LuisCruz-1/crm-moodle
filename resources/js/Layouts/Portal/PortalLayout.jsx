import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PortalLayout({ header, children }) {
    const { auth } = usePage().props;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-indigo-600 border-b border-indigo-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href={route('portal.dashboard')} className="text-white font-bold text-xl">
                                    Portal Alumno
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href={route('portal.dashboard')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        route().current('portal.dashboard')
                                            ? 'border-white text-white'
                                            : 'border-transparent text-indigo-200 hover:text-white hover:border-indigo-300'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('portal.installments.index')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        route().current('portal.installments.index')
                                            ? 'border-white text-white'
                                            : 'border-transparent text-indigo-200 hover:text-white hover:border-indigo-300'
                                    }`}
                                >
                                    Estado de Cuenta
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative flex items-center space-x-4">
                                <div className="text-indigo-200 text-sm">
                                    {auth?.user?.first_name} {auth?.user?.last_name}
                                </div>
                                <Link
                                    href={route('portal.logout')}
                                    method="post"
                                    as="button"
                                    className="text-indigo-200 hover:text-white text-sm"
                                >
                                    Cerrar sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
