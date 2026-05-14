import NavLink from '@/Components/NavLink';
import Card from '@/Components/Card';

export default function FinanceSubnav() {
    return (
        <Card className="!p-0 overflow-hidden mb-6">
            <div className="flex flex-wrap gap-6 px-6 pt-2 bg-gray-50/50 border-b border-gray-200">
                <NavLink href={route('finance.inbox.index')} active={route().current('finance.inbox.*')} className="pb-3 pt-2">
                    Inbox (Comprobantes)
                </NavLink>
                <NavLink href={route('finance.installments.index')} active={route().current('finance.installments.*')} className="pb-3 pt-2">
                    Cuotas y Deudas
                </NavLink>
                <NavLink href={route('finance.payments.index')} active={route().current('finance.payments.*')} className="pb-3 pt-2">
                    Pagos Manuales
                </NavLink>
            </div>
        </Card>
    );
}