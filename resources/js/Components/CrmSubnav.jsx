import NavLink from '@/Components/NavLink';
import Card from '@/Components/Card';

export default function CrmSubnav() {
    return (
        <Card className="!p-0 overflow-hidden mb-6">
            <div className="flex flex-wrap gap-6 p-4 bg-gray-50/50 border-gray-200">
                <NavLink href={route('crm.kanban.index')} active={route().current('crm.kanban.*')} className="pb-3 pt-2">
                    Kanban
                </NavLink>
                <NavLink href={route('crm.leads.index')} active={route().current('crm.leads.*')} className="pb-3 pt-2">
                    Leads
                </NavLink>
                <NavLink href={route('crm.pipelines.index')} active={route().current('crm.pipelines.*')} className="pb-3 pt-2">
                    Pipelines
                </NavLink>
            </div>
        </Card>
    );
}

