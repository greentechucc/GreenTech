'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, MessageSquare, Zap, Clock, FileText, ArrowRight, Activity, Wrench, ShieldCheck } from 'lucide-react';
import api from '@/services/api';

export default function CustomerDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [project, setProject] = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);
    fetchCustomerData(savedEmail);
  }, [router]);

  const fetchCustomerData = async (email: string) => {
    try {
      const customerName = localStorage.getItem('customer_name') || 'Cliente';

      const res = await api.get(`/portal/dashboard/${encodeURIComponent(email)}`);
      if (res.data) {
         const data = res.data;
         
         if (data.projects && data.projects.length > 0) {
             const userProj = data.projects[0];
             setProject({...userProj, customer_name: userProj.customer_name || customerName});
             setSavings(data.telemetry || { saved_kwh: 0, savings_cop: 0, period: '24h' });
             
             if (data.invoices && data.invoices.length > 0) {
                const pendingCount = data.invoices.filter((i: any) => i.status === 'PENDING').length;
                setPendingInvoices(pendingCount);
             } else {
                setPendingInvoices(0);
             }
         } else {
             setProject(null);
             setPendingInvoices(0);
         }
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-emerald-500">Cargando tu resumen...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 w-full fade-in">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Hola, {project?.customer_name || 'Cliente'}</h1>
        <p className="text-slate-500 mt-1">Aquí tienes un resumen general del estado de tus servicios con GreenTech.</p>
      </header>

      {!project ? (
        <div className="glass p-12 text-center flex flex-col items-center justify-center">
           <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
             <Sun size={40} />
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-2">Aún no tienes proyectos asignados</h2>
           <p className="text-slate-500 max-w-md mx-auto mb-8">
             No encontramos un proyecto solar activo. Tu asesor comercial lo creará pronto y aparecerá aquí.
           </p>
           <button onClick={() => window.location.reload()} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-full transition-all shadow-md">
             Actualizar Vista
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Proyectos */}
          <div className="glass p-6 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500">
                  <Wrench size={24} />
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                  {project.completion}% Completado
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Instalación Solar</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Tu proyecto está en fase de <b>{project.completion >= 100 ? 'Conexión' : project.completion > 50 ? 'Instalación' : 'Diseño y Trámites'}</b>.</p>
            </div>
            <Link href="/dashboard/proyectos" className="flex items-center text-amber-600 text-sm font-semibold group-hover:text-amber-700">
              Ver detalles técnicos <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card: Generación */}
          <div className="glass p-6 flex flex-col justify-between group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
              <Zap size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500">
                  <Activity size={24} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Generación y Ahorro</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-black text-slate-800">{savings?.saved_kwh?.toFixed(1) || '0.0'}</span>
                <span className="text-sm text-slate-500 ml-1 font-medium">kWh generados (24h)</span>
              </div>
            </div>
            <Link href="/dashboard/monitoreo" className="relative z-10 flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-700">
              Ver telemetría completa <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card: Facturación */}
          <div className="glass p-6 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-500">
                  <FileText size={24} />
                </div>
                {pendingInvoices > 0 ? (
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full">{pendingInvoices} pte.</span>
                ) : (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">Al día</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">Facturación</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Ahorro económico reciente: <b>${savings?.savings_cop?.toLocaleString('en-US') || '0'} COP</b>.</p>
            </div>
            <Link href="/dashboard/pagos" className="flex items-center text-emerald-600 text-sm font-semibold group-hover:text-emerald-700">
              Gestionar facturas <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card: Soporte */}
          <div className="glass p-6 flex flex-col justify-between group hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">
                  <MessageSquare size={24} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Soporte y Ayuda</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Crea tickets de soporte técnico o consultas comerciales. Respuesta en 24h.</p>
            </div>
            <Link href="/dashboard/soporte" className="flex items-center text-indigo-600 text-sm font-semibold group-hover:text-indigo-700">
              Ir al centro de ayuda <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      )}
    </main>
  );
}
