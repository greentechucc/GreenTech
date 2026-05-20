'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar, DollarSign, Activity, FileText, CheckCircle2, Zap } from 'lucide-react';
import api from '@/services/api';

const statusMap: Record<string, {label: string, color: string, prog: number}> = {
  'NEW': {label: 'Nuevo', color: 'text-blue-400 bg-blue-500/10', prog: 10},
  'CONTACTED': {label: 'Contactado', color: 'text-cyan-400 bg-cyan-500/10', prog: 30},
  'QUALIFIED': {label: 'Calificado', color: 'text-indigo-400 bg-indigo-500/10', prog: 50},
  'QUOTED': {label: 'Cotizado', color: 'text-amber-400 bg-amber-500/10', prog: 70},
  'NEGOTIATION': {label: 'Negociación', color: 'text-orange-400 bg-orange-500/10', prog: 85},
  'WON': {label: 'Ganado / Cliente', color: 'text-emerald-400 bg-emerald-500/10', prog: 100},
  'LOST': {label: 'Perdido', color: 'text-rose-400 bg-rose-500/10', prog: 0}
};

export default function CRMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const prospectId = params.id as string;

  useEffect(() => {
    fetchProspect();
  }, [prospectId]);

  const fetchProspect = async () => {
    try {
      const res = await api.get(`/crm/prospects`);
      const p = res.data.find((item: any) => String(item.id) === prospectId);
      if (p) setProspect(p);
    } catch (err) {
      console.error('Error loading prospect:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando perfil del prospecto...</div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Prospecto no encontrado.</p>
        <button onClick={() => router.push('/crm')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a CRM
        </button>
      </div>
    );
  }

  const sInfo = statusMap[prospect.status] || statusMap['NEW'];

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-6xl mx-auto">
      <header className="mb-6">
        <button onClick={() => router.push('/crm')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a CRM
        </button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl font-bold text-slate-300 shadow-xl border border-slate-600">
               {prospect.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-light tracking-tight">{prospect.name}</h1>
              <p className="text-slate-400 flex items-center gap-2 mt-1">
                <Building size={16} /> Prospecto Comercial <span className="text-slate-600">•</span> Adquisición vía {prospect.source || 'Directo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-4 py-2 rounded-xl text-sm font-bold border border-transparent ${sInfo.color}`}>
                {sInfo.label}
             </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2">Información de Contacto</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><Mail size={18}/></div>
                    <div>
                        <p className="text-xs text-slate-500">Correo Electrónico</p>
                        <p className="font-medium">{prospect.email || 'No proporcionado'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><Phone size={18}/></div>
                    <div>
                        <p className="text-xs text-slate-500">Teléfono</p>
                        <p className="font-medium">{prospect.phone || 'No proporcionado'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><MapPin size={18}/></div>
                    <div>
                         <p className="text-xs text-slate-500">Región / Ubicación</p>
                         <p className="font-medium">Colombia (Dato inferido)</p>
                    </div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2 mt-8">Asignación</h3>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500">Asesor Comercial</p>
                    <p className="font-medium text-cyan-400">{prospect.assigned_rep || 'Sin Asignar'}</p>
                </div>
            </div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                     <Activity size={16} /> Temperatura del Deal (Embudos)
                 </h3>
                 <div className="mb-2 flex justify-between text-xs text-slate-400 font-medium">
                     <span>Probabilidad de Cierre</span>
                     <span>{sInfo.prog}%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                     <div className={`h-full ${prospect.status === 'LOST' ? 'bg-rose-500' : 'bg-emerald-500'} transition-all duration-1000`} style={{width: `${sInfo.prog}%`}}></div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
                     <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                         <p className="text-xl font-bold text-slate-200">{sInfo.prog > 20 ? <CheckCircle2 size={24} className="mx-auto text-emerald-400"/> : '⏳'}</p>
                         <p className="text-xs text-slate-500 mt-2">Discovery</p>
                     </div>
                     <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                         <p className="text-xl font-bold text-slate-200">{sInfo.prog > 40 ? <CheckCircle2 size={24} className="mx-auto text-emerald-400"/> : '⏳'}</p>
                         <p className="text-xs text-slate-500 mt-2">Calificación</p>
                     </div>
                     <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                         <p className="text-xl font-bold text-slate-200">{sInfo.prog > 60 ? <CheckCircle2 size={24} className="mx-auto text-emerald-400"/> : '⏳'}</p>
                         <p className="text-xs text-slate-500 mt-2">Cotización</p>
                     </div>
                     <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                         <p className="text-xl font-bold text-slate-200">{sInfo.prog >= 100 ? <CheckCircle2 size={24} className="mx-auto text-emerald-400"/> : prospect.status === 'LOST' ? '❌' : '⏳'}</p>
                         <p className="text-xs text-slate-500 mt-2">Cierre</p>
                     </div>
                 </div>
            </div>

            <div className="glass p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                     <FileText size={16} /> Detalles Técnicos Preliminares
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20"><Zap size={24}/></div>
                         <div>
                             <p className="text-xs text-slate-500 mb-1">Consumo Eléctrico Estimado</p>
                             <p className="text-xl font-bold">{prospect.consumption || 'Pendiente'}</p>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20"><DollarSign size={24}/></div>
                         <div>
                             <p className="text-xs text-slate-500 mb-1">Valor Potencial (LTV estim.)</p>
                             <p className="text-xl font-bold text-amber-400">{prospect.consumption ? '$150,000+' : 'Pendiente'}</p>
                         </div>
                     </div>
                     <div className="flex gap-4 col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                         <Calendar className="text-slate-500 mt-1"/>
                         <div>
                             <p className="text-sm font-bold text-slate-300">Próxima Acción Sugerida</p>
                             <p className="text-sm text-slate-400">Agendar levantamiento técnico en sitio o enviar cotización preliminar basada en facturación de CFE reciente.</p>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
