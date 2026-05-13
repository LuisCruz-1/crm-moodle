import NavLink from '@/Components/NavLink';

export default function CrmSubnav() {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="flex flex-wrap gap-4 border-b border-gray-100 p-4">
                <NavLink href={route('crm.kanban.index')} active={route().current('crm.kanban.*')}>
                    Kanban
                </NavLink>
                <NavLink href={route('crm.leads.index')} active={route().current('crm.leads.*')}>
                    Leads
                </NavLink>
                <NavLink href={route('crm.pipelines.index')} active={route().current('crm.pipelines.*')}>
                    Pipelines
                </NavLink>
            </div>
        </div>
    );
}

