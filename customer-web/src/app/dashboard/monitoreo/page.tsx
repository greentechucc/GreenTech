'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Activity, Leaf, Wind, Sun, BatteryFull } from 'lucide-react';
import api from '@/services/api';

export default function MonitoreoView() {
  const router = useRouter();
  const [savings, setSavings] = useState<any>(null);
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
        setSavings(res.data.telemetry || { saved_kwh: 0, savings_cop: 0, period: '24h' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center text-emerald-500">Cargando telemetría...</div>;

  // Calculos simulados basados en kwh generados
  const kwh = savings?.saved_kwh || 0;
  const co2Ahorrado = (kwh * 0.4).toFixed(1); // ej. 0.4 kg CO2 por kWh
  const arbolesEquivalentes = Math.floor(kwh * 0.05); // inventado

  // Generación para un mini chart simulado (7 días)
  const pastDays = Array.from({length: 7}).map((_, i) => ({
    day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][new Date(Date.now() - (6-i)*86400000).getDay()],
    val: Math.random() * 15 + Number(kwh)/10
  }));
  const maxVal = Math.max(...pastDays.map(d => d.val));

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Generación y Ahorro</h1>
        <p className="text-slate-500 mt-1">Monitorea el rendimiento de tu sistema y tu impacto ambiental.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 border-t-4 border-blue-500 rounded-t-none">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-blue-500" size={20} />
            <h3 className="font-semibold text-slate-600 text-sm">Energía (24h)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{kwh.toFixed(1)} <span className="text-sm font-medium text-slate-500">kWh</span></p>
        </div>
        
        <div className="glass p-6 border-t-4 border-emerald-500 rounded-t-none">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-emerald-500" size={20} />
            <h3 className="font-semibold text-slate-600 text-sm">Ahorro Estimado</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800"><span className="text-xl">$</span>{savings?.savings_cop?.toLocaleString('en-US') || '0'} <span className="text-sm font-medium text-slate-500">COP</span></p>
        </div>

        <div className="glass p-6 border-t-4 border-teal-500 rounded-t-none flex flex-col justify-center relative overflow-hidden">
           <Leaf className="absolute text-teal-50 -right-4 -bottom-4 w-24 h-24 rotate-12" />
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-1">
               <Wind className="text-teal-600" size={16} />
               <span className="text-sm text-slate-500 font-medium">CO₂ Evitado</span>
             </div>
             <p className="text-2xl font-bold text-slate-800">{co2Ahorrado} <span className="text-sm text-slate-500">kg</span></p>
           </div>
        </div>

        <div className="glass p-6 border-t-4 border-green-500 rounded-t-none flex flex-col justify-center relative overflow-hidden">
           <Sun className="absolute text-green-50 -left-6 -bottom-6 w-32 h-32" />
           <div className="relative z-10 flex flex-col items-end text-right">
             <div className="flex items-center justify-end gap-2 mb-1 w-full">
               <span className="text-sm text-slate-500 font-medium">Equivalente a plantar</span>
             </div>
             <p className="text-2xl font-bold text-slate-800">{arbolesEquivalentes} <span className="text-sm text-slate-500 text-green-600">Árboles</span></p>
           </div>
        </div>
      </div>

      {/* Charts / Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Activity size={20} className="text-slate-400" /> Historial de Generación
            </h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Últimos 7 días</span>
          </div>
          
          {/* Simple CSS Chart */}
          <div className="flex items-end gap-2 sm:gap-6 h-48 mt-8 border-b border-slate-200 pb-2 relative">
            <div className="absolute left-0 top-0 bottom-0 border-l border-slate-100 w-full flex flex-col justify-between text-[10px] text-slate-300">
              <span className="border-b border-slate-100 w-full inline-block pb-1">Máx</span>
              <span className="border-b border-slate-100 w-full inline-block pb-1">Med</span>
              <span>Min</span>
            </div>
            
            {pastDays.map((d, i) => {
              const heightPct = Math.max((d.val / maxVal) * 100, 5); // at least 5% highly visible
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                  <div 
                    className="w-full max-w-[40px] bg-emerald-400 rounded-t-sm group-hover:bg-emerald-500 transition-colors relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shadow-sm transition-opacity">
                      {d.val.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-3 font-medium">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass p-6">
           <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
              <BatteryFull size={20} className="text-slate-400" /> Estado del Inversor
           </h3>
           <div className="space-y-6">
             <div className="flex items-start gap-4">
               <div className="w-3 h-3 mt-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               <div>
                 <p className="font-semibold text-slate-800">Online</p>
                 <p className="text-sm text-slate-500">El sistema está inyectando energía a la red correctamente.</p>
               </div>
             </div>
             
             <div className="pt-6 border-t border-slate-100">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Última lectura</p>
               <p className="text-slate-700 font-medium">Hoy, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
             </div>
             
             <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2.5 rounded-xl text-sm font-medium transition-colors">
               Realizar diagnóstico remoto
             </button>
           </div>
        </div>
      </div>
      
    </main>
  );
}
