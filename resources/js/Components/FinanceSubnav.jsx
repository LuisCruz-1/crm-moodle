import { Link, usePage } from '@inertiajs/react';

export default function FinanceSubnav() {
    const { url } = usePage();

    const tabs = [
        { name: 'Gestión de Cuotas', href: route('finance.installments.index'), active: url.startsWith('/finanzas/cuotas') },
        { name: 'Inbox Comprobantes', href: route('finance.inbox.index'), active: url.startsWith('/finanzas/inbox') },
    ];

    return (
        <div className="bg-white border-b border-gray-200 mb-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                                ${tab.active
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }
                            `}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}