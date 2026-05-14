import { Link, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    Cog6ToothIcon,
    UsersIcon,
    ShieldCheckIcon,
    AdjustmentsHorizontalIcon,
    PhotoIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default function SettingsSubnav() {
    const { url } = usePage();

    const navigation = [
        {
            name: 'Identidad Visual',
            href: route('settings.identity.index'),
            icon: PhotoIcon,
            current: url.startsWith('/configuracion/identidad'),
        },
        {
            name: 'Catálogos',
            href: route('settings.catalogs.index'),
            icon: AdjustmentsHorizontalIcon,
            current: url.startsWith('/configuracion/catalogos'),
        },
        {
            name: 'Tareas Programadas',
            href: route('settings.crons.index'),
            icon: ClockIcon,
            current: url.startsWith('/configuracion/crons'),
        },
        {
            name: 'Integración Moodle',
            href: route('settings.moodle.index'),
            icon: Cog6ToothIcon,
            current: url.startsWith('/configuracion/moodle'),
        },
        {
            name: 'Usuarios (Staff)',
            href: route('settings.users.index'),
            icon: UsersIcon,
            current: url.startsWith('/configuracion/usuarios'),
        },
        {
            name: 'Roles y Permisos',
            href: route('settings.roles.index'),
            icon: ShieldCheckIcon,
            current: url.startsWith('/configuracion/roles'),
        },
    ];

    return (
        <Card className="!p-0 overflow-hidden mb-6">
            <nav className="flex space-x-1 border-b border-gray-200 px-4 pt-2 bg-gray-50/50 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`
                            ${item.current
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } flex items-center border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors
                        `}
                        aria-current={item.current ? 'page' : undefined}
                    >
                        <item.icon
                            className={`${item.current ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'} -ml-0.5 mr-2 h-5 w-5`}
                            aria-hidden="true"
                        />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </Card>
    );
}
