import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { CurrencyDollarIcon, UsersIcon, AcademicCapIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ metrics }) {
    const { commercial, financial, academic } = metrics;
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#ef4444', '#8b5cf6'];

    return (
        <AuthenticatedLayout header="Dashboard Principal">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* SECCIÓN FINANCIERA */}
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <CurrencyDollarIcon className="h-6 w-6 text-surface-500" />
                        <h3 className="text-lg font-semibold text-surface-900">Métricas Financieras</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card className="border-l-4 border-l-red-500 relative overflow-hidden">
                            <dt className="text-sm font-medium text-surface-500">Comprobantes Pendientes</dt>
                            <dd className="mt-2 text-4xl font-extrabold text-red-600">{financial.inboxAlerts}</dd>
                            <Link href={route('finance.inbox.index')} className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">Revisar Inbox &rarr;</Link>
                            <ExclamationTriangleIcon className="h-24 w-24 text-red-50 absolute -right-4 -bottom-4 opacity-50" />
                        </Card>
                        <Card className="border-l-4 border-l-orange-500 relative overflow-hidden">
                            <dt className="text-sm font-medium text-surface-500">Monto en Mora</dt>
                            <dd className="mt-2 text-3xl font-extrabold text-orange-600">${financial.overdueAmount.toFixed(2)}</dd>
                            <dt className="text-sm font-medium text-surface-400 mt-2">{financial.studentsInMora} alumnos en mora</dt>
                            <ChartBarIcon className="h-24 w-24 text-orange-50 absolute -right-4 -bottom-4 opacity-50" />
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <h4 className="text-base font-semibold text-surface-800 mb-6">Proyección vs. Recaudación Real (Mes Actual)</h4>
                            <div className="h-72 w-full">
                                <ResponsiveContainer>
                                    <BarChart data={financial.financialProjection} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" tickFormatter={(value) => `$${value}`} stroke="#94a3b8" fontSize={12} />
                                        <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={12} />
                                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32}>
                                            {financial.financialProjection.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#10b981'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card>
                            <h4 className="text-base font-semibold text-surface-800 mb-6">Distribución por Método de Pago</h4>
                            <div className="h-72 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={financial.paymentsByMethod} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {financial.paymentsByMethod.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* SECCIÓN COMERCIAL */}
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <UsersIcon className="h-6 w-6 text-surface-500" />
                        <h3 className="text-lg font-semibold text-surface-900">Métricas Comerciales</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card className="border-l-4 border-l-primary-500">
                            <dt className="text-sm font-medium text-surface-500">Tasa de Conversión (Mes actual)</dt>
                            <dd className="mt-2 text-3xl font-extrabold text-primary-600">{commercial.conversionRate}%</dd>
                            <dt className="text-sm font-medium text-surface-400 mt-2">Mes anterior: {commercial.lastConversionRate}%</dt>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <h4 className="text-base font-semibold text-surface-800 mb-6">Pipeline de Ventas (Leads Activos)</h4>
                            <div className="h-72 w-full">
                                <ResponsiveContainer>
                                    <FunnelChart>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Funnel dataKey="value" data={commercial.pipelineData} isAnimationActive>
                                            <LabelList position="right" fill="#334155" stroke="none" dataKey="name" fontSize={13} fontWeight={500} />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card>
                            <h4 className="text-base font-semibold text-surface-800 mb-6">Top Asesores (Cerrados)</h4>
                            <ul className="divide-y divide-surface-100">
                                {commercial.topAdvisors.map((advisor, index) => (
                                    <li key={index} className="py-4 flex justify-between items-center group hover:bg-surface-50 -mx-6 px-6 transition-colors">
                                        <div className="flex items-center">
                                            <span className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold mr-4">{index + 1}</span>
                                            <span className="text-sm font-medium text-surface-900">{advisor.name}</span>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {advisor.value} wins
                                        </span>
                                    </li>
                                ))}
                                {commercial.topAdvisors.length === 0 && <p className="text-sm text-surface-500 text-center py-8">No hay datos suficientes.</p>}
                            </ul>
                        </Card>
                    </div>
                </section>

                {/* SECCIÓN ACADÉMICA */}
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <AcademicCapIcon className="h-6 w-6 text-surface-500" />
                        <h3 className="text-lg font-semibold text-surface-900">Métricas Académicas</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <Card className="border-l-4 border-l-emerald-500">
                            <dt className="text-sm font-medium text-surface-500">Matrículas Activas Totales</dt>
                            <dd className="mt-2 text-3xl font-extrabold text-emerald-600">{academic.activeEnrollments}</dd>
                        </Card>
                        <Card className="border-l-4 border-l-red-600">
                            <dt className="text-sm font-medium text-surface-500">Alumnos Suspendidos (Por Mora)</dt>
                            <dd className="mt-2 text-3xl font-extrabold text-red-600">{academic.suspendedStudents}</dd>
                        </Card>
                    </div>

                    <Card>
                        <h4 className="text-base font-semibold text-surface-800 mb-6">Top Cursos Demandados</h4>
                        <div className="h-72 w-full">
                            <ResponsiveContainer>
                                <BarChart data={academic.topCourses} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inscritos" barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
