import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import Card from '@/Components/Card';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-surface-50 pt-12 sm:justify-center sm:pt-0">
            <div className="w-full sm:max-w-md px-6">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <ApplicationLogo className="h-16 w-auto object-contain transition-transform hover:scale-105 duration-300" />
                    </Link>
                </div>

                <Card className="w-full sm:rounded-2xl shadow-xl shadow-surface-200/50 p-8 sm:p-10 border-0 ring-1 ring-surface-200/50">
                    {children}
                </Card>
                
                <div className="mt-8 text-center text-sm text-surface-500">
                    &copy; {new Date().getFullYear()} Micrudev. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}
