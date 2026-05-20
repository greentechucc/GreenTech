'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, FileCheck, CheckSquare, ShieldCheck, AlertCircle, UploadCloud, FileText } from 'lucide-react';
import api from '@/services/api';

const statusColors: Record<string, string> = {
  'NOT_STARTED': 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  'SUBMITTED': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'UNDER_REVIEW': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'APPROVED': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'REJECTED': 'text-rose-400 bg-rose-500/10 border-rose-500/30'
};

const statusSteps = [
  { id: 'NOT_STARTED', label: 'Inicio', icon: <FileText size={16} /> },
  { id: 'SUBMITTED', label: 'Enviado', icon: <UploadCloud size={16} /> },
  { id: 'UNDER_REVIEW', label: 'En Revisión (CFE)', icon: <Clock size={16} /> },
  { id: 'APPROVED', label: 'Aprobado', icon: <FileCheck size={16} /> }
];

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [permit, setPermit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const permitId = params.id as string;

  useEffect(() => {
    fetchPermit();
  }, [permitId]);

  const fetchPermit = async () => {
    try {
      const res = await api.get(`/permits/permits`);
      const p = res.data.find((item: any) => String(item.id) === permitId);
      if (p) {
        setPermit(p);
      }
    } catch (err) {
      console.error('Error loading permit details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando expediente del trámite...</div>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Trámite no encontrado en el sistema.</p>
        <button onClick={() => router.push('/permits')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Trámites
        </button>
      </div>
    );
  }

  const currentStepIndex = permit.status === 'REJECTED' ? 2 : statusSteps.findIndex(s => s.id === permit.status);

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-5xl mx-auto">
      <header className="mb-6">
        <button onClick={() => router.push('/permits')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a Expedientes
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light tracking-tight">Expediente de Trámite</h1>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700 font-mono">PRM-{String(permit.id).padStart(4, '0')}</span>
            </div>
            <p className="text-slate-400">Proyecto Vinculado: <span className="font-medium text-slate-300">#{permit.project_id}</span></p>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-4 py-2 rounded-xl text-sm font-bold border uppercase tracking-wider flex items-center gap-2 ${statusColors[permit.status] || 'text-slate-400'}`}>
                {permit.status === 'REJECTED' ? <AlertCircle size={16} /> : <CheckSquare size={16} />}
                {permit.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass p-6 space-y-8">
            <div>
                <h3 className="text-lg font-medium mb-6 flex items-center gap-2"><ShieldCheck className="text-emerald-400"/> Línea de Tiempo del Trámite</h3>
                
                <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-800 -z-10"></div>
                    <div className="absolute top-5 left-0 h-1 bg-emerald-500 transition-all duration-1000 -z-10" style={{ width: `${Math.max(0, (currentStepIndex) / (statusSteps.length - 1)) * 100}%` }}></div>
                    
                    {statusSteps.map((step, idx) => {
                        const isCompleted = currentStepIndex >= idx && permit.status !== 'REJECTED';
                        const isRejectedHere = permit.status === 'REJECTED' && idx === 2;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-3 w-24 text-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${
                                    isRejectedHere ? 'bg-rose-900 border-rose-500 text-rose-400' :
                                    isCompleted ? 'bg-emerald-900 border-emerald-500 text-emerald-400' : 
                                    'bg-slate-900 border-slate-700 text-slate-500'
                                }`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <p className={`text-xs font-bold leading-tight ${isRejectedHere ? 'text-rose-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>{step.label}</p>
                                    {idx === 0 && <p className="text-[10px] text-slate-500 mt-1">{new Date(permit.application_date || Date.now()).toLocaleDateString()}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {permit.status === 'REJECTED' && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-4">
                    <AlertCircle className="text-rose-400 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="text-rose-400 font-bold">Trámite Rechazado por la Autoridad</h4>
                        <p className="text-sm text-rose-300 mt-1">{permit.rejection_reason || 'El expediente no cumplió con las regulaciones de interconexión vigentes o falta documentación técnica (Diagrama unifilar). Se requiere revisión y re-sometimiento.'}</p>
                    </div>
                </div>
            )}
            
            {permit.status === 'UNDER_REVIEW' && (
                 <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-4">
                 <Clock className="text-amber-400 mt-1 flex-shrink-0" />
                 <div>
                     <h4 className="text-amber-400 font-bold">En Revisión (Tiempo de Espera Legal)</h4>
                     <p className="text-sm text-amber-300/80 mt-1">Acorde al marco regulatorio, la distribuidora tiene hasta 15 días hábiles para emitir observaciones al oficio de interconexión. El seguimiento diario es automático.</p>
                 </div>
             </div>
            )}

            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Archivos del Expediente</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between group cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-slate-400 group-hover:text-emerald-400" />
                            <span className="text-sm font-medium text-slate-300">Diagrama Unifilar.pdf</span>
                        </div>
                        <CheckSquare size={16} className="text-emerald-500" />
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between group cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-slate-400 group-hover:text-emerald-400" />
                            <span className="text-sm font-medium text-slate-300">Fichas_Inversor.pdf</span>
                        </div>
                        <CheckSquare size={16} className="text-emerald-500" />
                    </div>
                    <div className="p-3 border border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-emerald-400 cursor-pointer transition-colors col-span-2">
                        <UploadCloud size={18} className="mr-2"/> Subir Documento Analítico
                    </div>
                </div>
            </div>
        </div>
        
        <div className="glass p-6 space-y-6">
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Información Funcional</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Autoridad Competente</p>
                        <p className="font-bold text-slate-200 text-lg">{permit.utility_company}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Naturaleza del Trámite</p>
                        <p className="font-medium text-slate-300">{permit.permit_type}</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Fechas Clave</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Fecha de Ingreso de Carpeta</p>
                        <p className="font-medium text-slate-200">
                            {permit.application_date ? new Date(permit.application_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No registra'}
                        </p>
                    </div>
                    {permit.approval_date && (
                         <div>
                         <p className="text-xs text-emerald-500/70 mb-1">Fecha de Aprobación Final</p>
                         <p className="font-medium text-emerald-400">
                             {new Date(permit.approval_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                     </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
