'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Wifi, WifiOff, Activity, Calendar, Zap, AlertTriangle, ShieldCheck, Thermometer } from 'lucide-react';
import api from '@/services/api';

export default function MonitoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inverter, setInverter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const inverterId = params.id as string;

  useEffect(() => {
    fetchInverter();
  }, [inverterId]);

  const fetchInverter = async () => {
    try {
      // Usaremos la lista general por practicidad de la demo y filtraremos
      const res = await api.get(`/monitoring/monitoring/inverters`);
      const inv = res.data.find((i: any) => String(i.id) === inverterId);
      if (inv) {
        setInverter(inv);
      }
    } catch (err) {
      console.error('Error loading inverter details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando telemetría del inversor...</div>
      </div>
    );
  }

  if (!inverter) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Inversor no encontrado en la red de monitoreo.</p>
        <button onClick={() => router.push('/monitoring')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Monitoreo
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-6xl mx-auto">
      <header className="mb-6">
        <button onClick={() => router.push('/monitoring')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a Monitoreo
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light tracking-tight">{inverter.model}</h1>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700 font-mono">#{inverter.id}</span>
            </div>
            <p className="text-slate-400">Número de Serie: <span className="font-mono text-slate-300">{inverter.serial_number}</span> — Proyecto Principal #{inverter.project_id}</p>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-4 py-2 rounded-xl text-sm font-bold border uppercase tracking-wider flex items-center gap-2 ${
                  inverter.status === 'ONLINE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                  inverter.status === 'OFFLINE' ? 'text-slate-400 bg-slate-500/10 border-slate-500/30' :
                  inverter.status === 'MAINTENANCE' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                  inverter.status === 'ERROR' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                  'text-slate-400 bg-slate-500/10 border-slate-500/30'
                }`}>
                  {(inverter.status === 'ONLINE' || inverter.status === 'OFFLINE') ? (
                    inverter.status === 'ONLINE' ? <Wifi size={16} /> : <WifiOff size={16} />
                  ) : (
                    inverter.status === 'ERROR' ? <AlertTriangle size={16} /> : <Activity size={16} />
                  )}
                  {inverter.status || 'OFFLINE'}
                </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass p-5">
            <div className="flex gap-3 mb-2">
                <Zap size={18} className="text-amber-400" />
                <p className="text-slate-400 text-sm font-medium">Potencia Actual (kW)</p>
            </div>
            <h3 className="text-3xl font-bold">{inverter.status === 'ONLINE' ? (Math.random() * 8 + 2).toFixed(2) : '0.00'} <span className="text-lg text-slate-500 font-normal">kW</span></h3>
        </div>
        <div className="glass p-5">
            <div className="flex gap-3 mb-2">
                <Activity size={18} className="text-blue-400" />
                <p className="text-slate-400 text-sm font-medium">Producción Diaria</p>
            </div>
            <h3 className="text-3xl font-bold">{inverter.status === 'ONLINE' ? (Math.random() * 20 + 5).toFixed(1) : '0.0'} <span className="text-lg text-slate-500 font-normal">kWh</span></h3>
        </div>
        <div className="glass p-5">
            <div className="flex gap-3 mb-2">
                <Thermometer size={18} className="text-rose-400" />
                <p className="text-slate-400 text-sm font-medium">Temp. del Inversor</p>
            </div>
            <h3 className="text-3xl font-bold">{inverter.status === 'ONLINE' ? (Math.random() * 15 + 35).toFixed(1) : '—'} <span className="text-lg text-slate-500 font-normal">°C</span></h3>
        </div>
        <div className="glass p-5">
            <div className="flex gap-3 mb-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <p className="text-slate-400 text-sm font-medium">Estado Red Eléctrica</p>
            </div>
            <h3 className={`text-xl font-bold mt-1 ${inverter.status === 'ONLINE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                {inverter.status === 'ONLINE' ? 'Sincronizado' : 'Aislado'}
            </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 glass p-6 min-h-[300px] flex flex-col items-center justify-center gap-4">
            {inverter.status === 'ERROR' ? (
                 <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-8">
                     <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center animate-pulse">
                         <AlertTriangle size={40} />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-200">El inversor reporta un fallo crítico</h2>
                     <p className="text-slate-400 max-w-md">La comunicación está interrumpida o uno de los sensores internos de CA/CC ha detectado medidas fuera de rango. Sugerimos agendar una visita técnica inmediatamente a través del sistema de CRM.</p>
                     <div className="mt-4 p-4 bg-slate-900 rounded-lg w-full text-left font-mono text-sm border border-slate-700 text-rose-300">
                         &gt; ERR_VDC_OVERVOLTAGE<br/>
                         &gt; GRID_ISLANDING_DETECTED<br/>
                         &gt; SYSTEM_HALTED
                     </div>
                 </div>
            ) : inverter.status === 'ONLINE' ? (
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <p className="text-slate-400 mb-4">Curva de Generación (Simulada)</p>
                    <div className="w-full flex-1 flex items-end gap-2 px-4 justify-between">
                        {Array.from({length: 12}).map((_, i) => (
                            <div key={i} className="w-full bg-emerald-500/20 rounded-t-sm" style={{height: `${Math.max(10, Math.sin(i / 11 * Math.PI) * 100)}%`}}></div>
                        ))}
                    </div>
                    <div className="w-full flex justify-between text-xs text-slate-500 mt-2 px-4">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                    </div>
                </div>
            ) : (
                <div className="text-slate-500 text-center flex flex-col items-center gap-3">
                    <WifiOff size={48} className="opacity-50" />
                    <p>El inversor actualmente no está transmitiendo datos de telemetría.</p>
                </div>
            )}
        </div>
        <div className="glass p-6 space-y-6">
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Datos de Instalación</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Calendar size={14}/> Fecha de Integración</p>
                        <p className="font-medium text-slate-200">
                            {inverter.installation_date ? new Date(inverter.installation_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No registra'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Activity size={14}/> Último Datagrama Recibido</p>
                        <p className="font-medium text-slate-200">
                            {inverter.last_communication ? new Date(inverter.last_communication).toLocaleString('es-CO') : 'Nunca'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Diagnóstico Remoto</h3>
                <div className="space-y-2">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700 text-slate-300 flex justify-center items-center gap-2">
                        Forzar Ping a IP Asignada
                    </button>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700 text-slate-300 flex justify-center items-center gap-2">
                        Descargar Logs Completos (CSV)
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
