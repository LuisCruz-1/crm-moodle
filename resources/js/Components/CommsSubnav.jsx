import NavLink from '@/Components/NavLink';
import Card from '@/Components/Card';

export default function CommsSubnav() {
    return (
        <Card className="!p-0 overflow-hidden mb-6">
            <div className="flex flex-wrap gap-6 px-6 pt-2 bg-gray-50/50 border-b border-gray-200">
                <NavLink href={route('comms.templates.index')} active={route().current('comms.templates.*')} className="pb-3 pt-2">
                    Plantillas de Correo
                </NavLink>
                <NavLink href={route('comms.logs.index')} active={route().current('comms.logs.*')} className="pb-3 pt-2">
                    Bandeja de Salida (Logs)
                </NavLink>
            </div>
        </Card>
    );
}