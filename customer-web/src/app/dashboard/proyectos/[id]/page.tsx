'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sun, CheckCircle2, Factory, Calendar, MapPin, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

export default function ProyectoDetalleView() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<any>(null);
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
      if (res.data?.projects?.length > 0) {
        const found = res.data.projects.find((p: any) => p.id === Number(params.id));
        setProject(found || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: 'CREATED', label: 'Diseño', desc: 'Levantamiento de planos y simulación' },
    { id: 'PERMITTING', label: 'Trámites', desc: 'Permisos ante Operador de Red' },
    { id: 'INSTALLATION', label: 'Instalación', desc: 'Montaje de paneles e inversor' },
    { id: 'COMPLETED', label: 'Conexión', desc: 'Inyección a red y entrega' }
  ];

  const getStageIndex = (percent: number) => {
    if(!percent) return 0;
    if(percent === 100) return 4;
    if(percent >= 76) return 3;
    if(percent >= 51) return 2;
    if(percent >= 26) return 1;
    return 0;
  };

  if (loading) return <div className="flex justify-center h-64 items-center text-emerald-500">Cargando detalles...</div>;
  
  if (!project) return (
    <div className="flex flex-col items-center justify-center h-64">
      <h2 className="text-xl font-bold text-slate-700">Proyecto no encontrado</h2>
      <Link href="/dashboard/proyectos" className="mt-4 text-emerald-500 font-semibold flex items-center gap-2"><ArrowLeft size={16}/> Volver a mis proyectos</Link>
    </div>
  );

  const currentStageIndex = getStageIndex(project.completion);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/proyectos" className="text-emerald-500 hover:text-emerald-600 font-semibold mb-4 inline-flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Todos los proyectos</Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">{project.name || 'Proyecto Solar'}</h1>
          <p className="text-slate-500 mt-1">Detalles y seguimiento del sistema fotovoltaico ID: #{project.id}</p>
        </div>
      </header>

      {/* Progress Timeline */}
      <div className="glass p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Sun className="text-amber-500" /> Línea de Tiempo Detallada</h2>
        <div className="mb-8">
          <p className="text-sm text-slate-500 mt-1">Estado de Avance: <span className="font-bold text-emerald-600">{project.completion}% completado</span></p>
        </div>
    
        <div className="relative mt-8 mb-4">
          <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0 hidden sm:block"></div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-4 relative z-10">
            {stages.map((st, i) => {
              const isCompleted = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;
              return (
                <div key={st.id} className="flex sm:flex-col items-center gap-4 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${
                    isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : 
                    isCurrent ? 'bg-amber-400 border-amber-100 text-white shadow-lg shadow-amber-400/30' : 
                    'bg-white border-slate-200 text-slate-300'
                  } transition-all duration-500`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-bold text-sm">{i+1}</span>}
                  </div>
                  <div className="text-left sm:text-center">
                    <p className={`font-bold ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{st.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{st.desc}</p>
                    {isCurrent && <span className="inline-block mt-2 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] uppercase font-bold tracking-wider rounded">En proceso</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technical Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={18} className="text-slate-400"/> Especificaciones Técnicas</h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Capacidad Total</span>
              <span className="font-semibold text-slate-800">5.4 kWp</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Configuración Módulos</span>
              <span className="font-semibold text-slate-800">12x 450W Mono PERC</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Inversor Central</span>
              <span className="font-semibold text-slate-800">Fronius 5.0kW Red</span>
            </li>
            <li className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Estructura</span>
              <span className="font-semibold text-slate-800">Coplanar Aluminio</span>
            </li>
          </ul>
        </div>
        
        <div className="glass p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Factory size={18} className="text-slate-400"/> Logística y Predio</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 py-2">
              <MapPin size={18} className="text-emerald-500 mt-0.5" />
              <div>
                <span className="block font-semibold text-slate-800">Lugar de Implementación</span>
                <span className="text-sm text-slate-500">Dirección Registrada del Cliente</span>
              </div>
            </li>
            <li className="flex items-start gap-3 py-2 mt-2">
              <Calendar size={18} className="text-emerald-500 mt-0.5" />
              <div>
                <span className="block font-semibold text-slate-800">Fecha Estimada Conexión</span>
                <span className="text-sm text-slate-500">Ultimo Trimestre, 2026</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
