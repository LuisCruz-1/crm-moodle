import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';

export default function Dashboard({ metrics }) {
    const { commercial, financial, academic } = metrics;
    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#ef4444', '#8b5cf6'];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* SECCIÓN FINANCIERA */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Métricas Financieras</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Alertas de Caja */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex flex-col justify-center items-center border-l-4 border-red-500">
                                <dt className="text-sm font-medium text-gray-500 truncate">Comprobantes Pendientes</dt>
                                <dd className="mt-2 text-4xl font-extrabold text-red-600">{financial.inboxAlerts}</dd>
                                <Link href={route('finance.inbox.index')} className="mt-2 text-sm text-indigo-600 hover:text-indigo-900">Ir al Inbox →</Link>
                            </div>
                            {/* Índice de Morosidad Global */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex flex-col justify-center items-center border-l-4 border-orange-500">
                                <dt className="text-sm font-medium text-gray-500 truncate">Monto en Mora</dt>
                                <dd className="mt-2 text-3xl font-extrabold text-orange-600">${financial.overdueAmount.toFixed(2)}</dd>
                                <dt className="text-xs text-gray-400 mt-1">{financial.studentsInMora} alumnos en mora</dt>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h4 className="text-md font-medium text-gray-700 mb-4 text-center">Proyección vs. Recaudación Real (Mes Actual)</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={financial.financialProjection} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                                            <YAxis dataKey="name" type="category" width={80} />
                                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                                                {financial.financialProjection.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#9ca3af' : '#10b981'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h4 className="text-md font-medium text-gray-700 mb-4 text-center">Distribución por Método de Pago</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={financial.paymentsByMethod} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                {financial.paymentsByMethod.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN COMERCIAL */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Métricas Comerciales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
                                <dt className="text-sm font-medium text-gray-500 truncate">Tasa de Conversión (Mes actual)</dt>
                                <dd className="mt-2 text-3xl font-extrabold text-indigo-600">{commercial.conversionRate}%</dd>
                                <dt className="text-xs text-gray-400 mt-1">Mes anterior: {commercial.lastConversionRate}%</dt>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 lg:col-span-2">
                                <h4 className="text-md font-medium text-gray-700 mb-4 text-center">Pipeline de Ventas (Leads Activos)</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer>
                                        <FunnelChart>
                                            <Tooltip />
                                            <Funnel dataKey="value" data={commercial.pipelineData} isAnimationActive>
                                                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                                            </Funnel>
                                        </FunnelChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h4 className="text-md font-medium text-gray-700 mb-4 text-center">Top Asesores (Cerrados)</h4>
                                <ul className="divide-y divide-gray-200">
                                    {commercial.topAdvisors.map((advisor, index) => (
                                        <li key={index} className="py-3 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold mr-3">{index + 1}</span>
                                                <span className="text-sm font-medium text-gray-900">{advisor.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{advisor.value} wins</span>
                                        </li>
                                    ))}
                                    {commercial.topAdvisors.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No hay datos suficientes.</p>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN ACADÉMICA */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Métricas Académicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-emerald-500">
                                <dt className="text-sm font-medium text-gray-500 truncate">Matrículas Activas Totales</dt>
                                <dd className="mt-2 text-3xl font-extrabold text-emerald-600">{academic.activeEnrollments}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-red-600">
                                <dt className="text-sm font-medium text-gray-500 truncate">Alumnos Suspendidos (Por Mora)</dt>
                                <dd className="mt-2 text-3xl font-extrabold text-red-600">{academic.suspendedStudents}</dd>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h4 className="text-md font-medium text-gray-700 mb-4">Top Cursos Demandados</h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer>
                                    <BarChart data={academic.topCourses} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Inscritos" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
