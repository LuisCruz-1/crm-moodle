import NavLink from '@/Components/NavLink';

export default function AcademicsSubnav() {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="flex flex-wrap gap-4 border-b border-gray-100 p-4">
                <NavLink href={route('academics.courses.index')} active={route().current('academics.courses.*')}>
                    Cursos
                </NavLink>
                <NavLink href={route('academics.sync.index')} active={route().current('academics.sync.*')}>
                    Sincronización Moodle
                </NavLink>
            </div>
        </div>
    );
}

