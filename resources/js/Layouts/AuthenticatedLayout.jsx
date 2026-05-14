import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { 
    ChartPieIcon, 
    UsersIcon, 
    AcademicCapIcon, 
    CurrencyDollarIcon, 
    EnvelopeIcon, 
    Cog6ToothIcon, 
    Bars3Icon, 
    XMarkIcon 
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { global } = usePage().props;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), current: route().current('dashboard'), icon: ChartPieIcon },
        { name: 'CRM & Ventas', href: route('crm.leads.index'), current: route().current('crm.leads.*'), icon: UsersIcon },
        { name: 'Académico', href: route('academics.courses.index'), current: route().current('academics.*'), icon: AcademicCapIcon },
        { name: 'Estudiantes', href: route('students.index'), current: route().current('students.*'), icon: UsersIcon },
        { name: 'Finanzas', href: route('finance.installments.index'), current: route().current('finance.*'), icon: CurrencyDollarIcon },
        { name: 'Reportes', href: route('reports.index'), current: route().current('reports.*'), icon: ChartPieIcon },
        { name: 'Comunicaciones', href: route('comms.templates.index'), current: route().current('comms.*'), icon: EnvelopeIcon },
        { name: 'Configuración', href: route('settings.moodle.index'), current: route().current('settings.*'), icon: Cog6ToothIcon },
    ];

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-surface-200 shadow-sm z-10 fixed h-full">
                <div className="h-16 flex items-center px-6 border-b border-surface-100">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto text-primary-600" />
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                item.current
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                            }`}
                        >
                            <item.icon
                                className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors ${
                                    item.current ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-500'
                                }`}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-surface-100">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-surface-700 rounded-lg hover:bg-surface-50 transition-colors focus:outline-none">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 text-left truncate">
                                    <p className="truncate font-semibold">{user.name}</p>
                                    <p className="truncate text-xs text-surface-500">{user.email}</p>
                                </div>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align="top-left" width="48">
                            <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Cerrar Sesión
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-surface-200 flex items-center justify-between px-4 h-16 sticky top-0 z-20">
                <Link href="/">
                    <ApplicationLogo className="block h-8 w-auto text-primary-600" />
                </Link>
                <button
                    onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                    className="p-2 rounded-md text-surface-400 hover:text-surface-500 hover:bg-surface-100 focus:outline-none"
                >
                    {showingNavigationDropdown ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <Bars3Icon className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {showingNavigationDropdown && (
                <div className="md:hidden fixed inset-0 z-10 bg-surface-800/50 backdrop-blur-sm" onClick={() => setShowingNavigationDropdown(false)}>
                    <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="h-16 flex items-center px-6 border-b border-surface-100 justify-between">
                            <span className="font-semibold text-surface-900">Menú</span>
                            <button onClick={() => setShowingNavigationDropdown(false)} className="text-surface-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                                        item.current
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                                    }`}
                                >
                                    <item.icon className={`mr-4 h-6 w-6 ${item.current ? 'text-primary-600' : 'text-surface-400'}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-surface-100 bg-surface-50">
                            <div className="flex items-center px-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium text-surface-800">{user.name}</div>
                                    <div className="text-sm font-medium text-surface-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Link href={route('profile.edit')} className="block px-3 py-2 text-base font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-100 rounded-md">Perfil</Link>
                                <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-3 py-2 text-base font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-100 rounded-md">Cerrar Sesión</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                {header && (
                    <header className="bg-white shadow-sm sticky top-0 z-10 hidden md:block border-b border-surface-100">
                        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                            <div className="font-semibold text-lg text-surface-800">
                                {header}
                            </div>
                        </div>
                    </header>
                )}
                {/* Mobile header title */}
                {header && (
                    <div className="md:hidden bg-white shadow-sm px-4 py-3 border-b border-surface-100">
                        <div className="font-semibold text-lg text-surface-800">{header}</div>
                    </div>
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
