'use client';

import { useParams, useRouter } from 'next/navigation';
import { SHOWCASE_PROJECTS } from '../mockData';
import { ArrowLeft, ArrowRight, CheckCircle2, Factory, Leaf, Sun, Zap, Home, Award } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const projectId = params.id as string;
  const project = SHOWCASE_PROJECTS.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-slate-500 mb-4 text-lg">Proyecto no encontrado.</p>
        <button onClick={() => router.push('/dashboard/global')} className="text-emerald-500 font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Proyectos
        </button>
      </div>
    );
  }

  const Icon = project.icon;

  const handleSimular = () => {
     // Mandamos al usuario a cotizar este mismo tipo de solucion con un consumo estimado
     router.push(`/dashboard/global?simulate=true&consumo=${project.consumo_est}`);
  };

  return (
    <div className="px-4 md:px-10 max-w-5xl mx-auto w-full fade-in pb-10">
      <button onClick={() => router.push('/dashboard/global')} className="text-emerald-600 hover:text-emerald-500 font-semibold flex items-center gap-2 mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a Showcase
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        <div className="h-64 md:h-96 relative">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-800 bg-white mb-3 shadow-md">
                <Icon size={14} className="text-emerald-600" /> {project.type}
              </div>
             <h1 className="text-3xl md:text-5xl font-extrabold text-white">{project.title}</h1>
          </div>
        </div>
        
        <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Análisis de la Instalación</h2>
                    <p className="text-slate-600 leading-relaxed text-lg mb-6">{project.description}</p>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8">
                       <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                           <CheckCircle2 size={20} /> Impacto Garantizado
                       </h3>
                       <ul className="space-y-3 text-emerald-700 font-medium">
                           <li className="flex items-center justify-between">
                               <span>Potencia Instalada</span>
                               <span className="font-bold">{project.size}</span>
                           </li>
                           <li className="flex items-center justify-between">
                               <span>Paneles Utilizados</span>
                               <span className="font-bold">{project.panels} uds.</span>
                           </li>
                           <li className="flex items-center justify-between border-t border-emerald-200/50 pt-3">
                               <span>Mitigación de CO2 (Anual)</span>
                               <span className="font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">{project.co2}</span>
                           </li>
                       </ul>
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-10 -right-10 opacity-10">
                            <Sun size={200} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Replica este Éxito</h3>
                            <p className="text-slate-300 mb-8">Si los requerimientos de tu empresa o vivienda son similares a <strong>{project.title}</strong>, podemos enviarte una cotización basada en este perfil.</p>
                            
                            <div className="mb-8">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Consumo Est. Mensual de esta planta</p>
                                <p className="text-4xl font-black text-emerald-400 font-mono">{Number(project.consumo_est).toLocaleString('es-CO')} <span className="text-xl text-slate-500 font-sans">kWh</span></p>
                            </div>

                            <button onClick={handleSimular} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg">
                                Obtener Este Perfil <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
