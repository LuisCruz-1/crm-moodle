import { Link, usePage } from '@inertiajs/react';
import {
    Cog6ToothIcon,
    UsersIcon,
    ShieldCheckIcon,
    AdjustmentsHorizontalIcon,
    BanknotesIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    PhotoIcon
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
        <nav className="flex space-x-4 border-b border-gray-200 pb-4 mb-6 overflow-x-auto" aria-label="Tabs">
            {navigation.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`
                        ${item.current
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        } flex items-center rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap
                    `}
                    aria-current={item.current ? 'page' : undefined}
                >
                    <item.icon
                        className={`${item.current ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'} -ml-0.5 mr-2 h-5 w-5`}
                        aria-hidden="true"
                    />
                    {item.name}
                </Link>
            ))}
        </nav>
    );
}
