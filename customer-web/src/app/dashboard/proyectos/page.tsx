'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import api from '@/services/api';

export default function ProyectosListView() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      if (res.data?.projects) {
        setProjects(res.data.projects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (percent: number) => {
    if(!percent) return 0;
    if(percent === 100) return 4;
    if(percent >= 76) return 3;
    if(percent >= 51) return 2;
    if(percent >= 26) return 1;
    return 0;
  };

  if (loading) return <div className="flex justify-center h-64 items-center text-emerald-500">Cargando proyectos...</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Grupos de Proyectos</h1>
        <p className="text-slate-500 mt-1">Acá se agrupan todos los sistemas fotovoltaicos registrados a tu nombre.</p>
      </header>

      {projects.length === 0 ? (
        <div className="p-8 text-center text-slate-500 glass">No posees proyectos activos actualmente.</div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
             const isExpanded = expandedId === project.id;
             const currentStageIndex = getStageIndex(project.completion);
             const stages = ['Diseño', 'Trámites', 'Instalación', 'Conexión'];

             return (
               <div key={project.id} className={`glass overflow-hidden transition-all duration-300 border ${isExpanded ? 'border-amber-400/50 shadow-md' : 'border-transparent hover:border-slate-200'}`}>
                 {/* Header Row */}
                 <div className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4" onClick={() => setExpandedId(isExpanded ? null : project.id)}>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                       <Sun size={24} />
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-slate-800">{project.name || `Proyecto #${project.id}`}</h3>
                       <p className="text-sm text-slate-500">ID: {project.id} &bull; Progreso: {project.completion}%</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-3 self-end sm:self-auto">
                     <button className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                       {isExpanded ? 'Ocultar Resumen' : 'Ver Resumen Rápido'}
                       {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                     </button>
                   </div>
                 </div>

                 {/* Accordion Content */}
                 {isExpanded && (
                   <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 fade-in">
                     <div className="flex flex-col sm:flex-row gap-8 mt-4">
                       
                       <div className="flex-1">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Estado Reciente</h4>
                         <div className="relative pl-6 space-y-4">
                           {/* Mini Timeline Line */}
                           <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                           
                           {stages.map((st, i) => {
                             const completed = i < currentStageIndex;
                             const current = i === currentStageIndex;
                             return (
                               <div key={i} className="relative">
                                 <div className={`absolute -left-[28px] w-4 h-4 rounded-full border-2 bg-white ${completed ? 'border-emerald-500 bg-emerald-500' : current ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-300'}`}></div>
                                 <p className={`text-sm font-medium ${completed || current ? 'text-slate-800' : 'text-slate-400'}`}>
                                   {st} {completed && <span className="text-emerald-500 text-xs font-bold ml-1">✓</span>} {current && <span className="text-amber-500 text-xs font-bold ml-1">(En Proceso)</span>}
                                 </p>
                               </div>
                             );
                           })}
                         </div>
                       </div>

                       <div className="flex-1">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Datos Breves</h4>
                         <ul className="space-y-3 text-sm">
                           <li className="flex items-start gap-2">
                             <Layers size={16} className="text-slate-400" />
                             <div>
                               <span className="block font-medium text-slate-700">Capacidad Total Estimada</span>
                               <span className="text-slate-500">5.4 kWp</span>
                             </div>
                           </li>
                         </ul>

                         <div className="mt-6">
                           <Link href={`/dashboard/proyectos/${project.id}`} className="inline-flex w-full justify-center items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium py-2 px-4 rounded-lg transition-colors border border-amber-200">
                             Explorar a Profundidad <ArrowRight size={16} />
                           </Link>
                         </div>
                       </div>
                       
                     </div>
                   </div>
                 )}
               </div>
             )
          })}
        </div>
      )}
    </main>
  );
}
