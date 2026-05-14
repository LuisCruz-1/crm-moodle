import NavLink from '@/Components/NavLink';

export default function CommsSubnav() {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="flex flex-wrap gap-4 border-b border-gray-100 p-4">
                <NavLink href={route('comms.templates.index')} active={route().current('comms.templates.*')}>
                    Plantillas de Correo
                </NavLink>
                <NavLink href={route('comms.logs.index')} active={route().current('comms.logs.*')}>
                    Bandeja de Salida (Logs)
                </NavLink>
            </div>
        </div>
    );
}