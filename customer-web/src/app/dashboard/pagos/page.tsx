'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

export default function PagosListView() {
  const router = useRouter();
  const [projectsGroup, setProjectsGroup] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    fetchData(savedEmail);
  }, [router]);

  const fetchData = async (email: string) => {
    try {
      const res = await api.get(`/portal/dashboard/${encodeURIComponent(email)}`);
      if (res.data) {
         const { projects, invoices } = res.data;
         
         if (projects && projects.length > 0) {
           const grouped = projects.map((proj: any) => {
             // Agrupar las facturas pertenecientes a este proyecto.
             // (Para la demo, si el proyecto no tiene invoices atadas consistentemente, amarramos todas si solo hay un proyecto o filtramos)
             const projInvoices = invoices?.filter((i: any) => i.project_id === proj.id || typeof i.project_id === 'undefined') || [];
             const paid = projInvoices.filter((i: any) => i.status === 'PAID');
             const pending = projInvoices.filter((i: any) => i.status === 'PENDING');
             const totalAmountPaid = paid.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
             const totalAmountPending = pending.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
             
             return {
               ...proj,
               invoices_count: projInvoices.length,
               paid_count: paid.length,
               pending_count: pending.length,
               total_paid: totalAmountPaid,
               total_pending: totalAmountPending,
             };
           });
           setProjectsGroup(grouped);
         }
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-48 mt-12 text-emerald-500">Cargando cuentas...</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 fade-in w-full">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Cuentas por Proyecto</h1>
        <p className="text-slate-500 mt-1">Selecciona un proyecto para revisar y gestionar su flujo contable.</p>
      </header>

      {projectsGroup.length === 0 ? (
        <div className="p-12 text-center text-slate-500 glass flex flex-col items-center">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            No hay proyectos asociados para revisar su facturación.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projectsGroup.map((proj) => {
             const progressPct = proj.invoices_count > 0 ? Math.round((proj.paid_count / proj.invoices_count) * 100) : 0;
             
             return (
               <div key={proj.id} className="glass p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all hover:border-slate-300 hover:shadow-lg">
                 <div className="flex items-start gap-4 flex-1">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                     <Building2 size={24} />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-slate-800">{proj.name || `Proyecto #${proj.id}`}</h2>
                     <p className="text-sm text-slate-500 mt-1 mb-4">Monto total pagado a la fecha: <b className="text-slate-700">${proj.total_paid.toLocaleString('en-US')}</b></p>
                     
                     <div className="flex items-center gap-4 text-sm font-medium">
                       <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                         ✓ {proj.paid_count} Cuotas Pagadas
                       </span>
                       {proj.pending_count > 0 ? (
                         <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded">
                           ⚠ {proj.pending_count} Facturas Pendientes
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded">
                           Todo al día
                         </span>
                       )}
                     </div>
                   </div>
                 </div>

                 <div className="flex flex-col md:items-end w-full md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 gap-6">
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                        <span>Avance Pagos</span>
                        <span className="text-emerald-500">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>
                    
                    <Link href={`/dashboard/pagos/${proj.id}`} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl transition-all shadow text-center flex justify-center items-center gap-2">
                      Gestionar Pagos <ArrowRight size={16} />
                    </Link>
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </main>
  );
}
