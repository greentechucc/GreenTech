'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Activity, Sun, Wifi, WifiOff, Zap, Thermometer, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import { getCurrentUser } from '@/lib/mock-users';

export default function MonitoringPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="text-slate-400 text-lg animate-pulse">Cargando monitoreo...</div></div>}>
      <MonitoringContent />
    </Suspense>
  );
}

function MonitoringContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inverters, setInverters] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ project_id: string, serial_number: string, model: string, status?: string, id?: number }>({ project_id: '', serial_number: '', model: '', status: 'OFFLINE' });
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    api.get('/monitoring/monitoring/inverters')
      .then(res => setInverters(res.data))
      .catch(() => setInverters([]));
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    api.get('/projects/projects').then(res => setAllProjects(res.data)).catch(() => {});
    fetchData();
    const pid = searchParams.get('projectId');
    if (pid) {
      setForm(prev => ({ ...prev, project_id: pid }));
      setShowModal(true);
      
      // Auto-fill from project BOM for better UX
      api.get(`/projects/projects/${pid}`).then(res => {
         const p = res.data;
         if (p && p.bom_json) {
            try {
               const bomStr = decodeURIComponent(p.bom_json);
               const finalBom = JSON.parse(bomStr);
               const inverterItem = finalBom.find((item: any) => item.name.toLowerCase().includes('inver'));
               if (inverterItem) {
                  const randomSerial = `SN-${pid}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
                  setForm(prev => ({ ...prev, model: inverterItem.name, serial_number: randomSerial }));
               } else {
                  setForm(prev => ({ ...prev, model: 'Inversor On-Grid Estándar 10kW', serial_number: `INV-PRJ${pid}-001` }));
               }
            } catch (e) {
               console.warn("Could not parse BOM to auto-fill", e);
               // Failsafe
               setForm(prev => ({ ...prev, model: 'Inversor On-Grid Estándar 10kW', serial_number: `INV-PRJ${pid}-001` }));
            }
         } else {
            setForm(prev => ({ ...prev, model: 'Inversor On-Grid Estándar 10kW', serial_number: `INV-PRJ${pid}-001` }));
         }
      }).catch(err => console.log('Error fetching project for autofill', err));
    }
  }, [searchParams]);

  const handleCreateOrUpdate = async () => {
    if (!form.serial_number || !form.model) return;
    setLoading(true);
    try {
      if (form.id) {
        await api.put(`/monitoring/monitoring/inverters/${form.id}`, {
          project_id: Number(form.project_id) || 0,
          serial_number: form.serial_number,
          model: form.model,
          status: form.status
        });
      } else {
        await api.post('/monitoring/monitoring/inverters', {
          project_id: Number(form.project_id) || 0,
          serial_number: form.serial_number,
          model: form.model,
          status: 'OFFLINE'
        });
      }
      setForm({ project_id: '', serial_number: '', model: '', status: 'OFFLINE' });
      setShowModal(false);
      fetchData();
    } catch (e) {
      console.error('Error guardando inversor:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este inversor?")) return;
    try {
      await api.delete(`/monitoring/monitoring/inverters/${id}`);
      fetchData();
    } catch (e) { console.error(e) }
  };

  const filteredInverters = useMemo(() => {
    let result = inverters;
    if ((currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar') && allProjects.length > 0) {
      if (currentUser?.role === 'Tecnico' && currentUser.crew_name) {
        const myProjectIds = allProjects.filter(p => p.assigned_crew === currentUser.crew_name).map(p => p.id);
        result = result.filter(inv => myProjectIds.includes(inv.project_id));
      } else if (currentUser?.role === 'Auxiliar') {
        const myProjectIds = allProjects.filter(p => p.assigned_auxiliaries?.includes(currentUser.email)).map(p => p.id);
        result = result.filter(inv => myProjectIds.includes(inv.project_id));
      }
    }
    return result;
  }, [inverters, currentUser, allProjects]);

  const onlineCount = filteredInverters.filter((i: any) => i.status === 'ONLINE').length;
  const errorCount = filteredInverters.filter((i: any) => i.status === 'ERROR').length;

  return (
    <div className="space-y-6 fade-in p-4">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Monitoreo en Tiempo Real</h1>
          <p className="text-slate-400">Telemetría de instalaciones fotovoltaicas conectadas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Registrar Inversor
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Inversores Registrados</p>
              <h3 className="text-2xl font-bold mt-1">{filteredInverters.length}</h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Zap size={22} /></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Con Comunicación</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">{onlineCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Wifi size={22} /></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Sin Comunicación (Error)</p>
              <h3 className={`text-2xl font-bold mt-1 ${errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{errorCount}</h3>
            </div>
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><Activity size={22} /></div>
          </div>
        </div>
      </div>

      {/* Inverter Cards */}
      {filteredInverters.length === 0 && (
        <div className="glass p-12 text-center text-slate-500">No hay inversores registrados o asignados a su cuadrilla.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInverters.map((inv: any) => {
          const hasComm = inv.last_communication && (Date.now() - new Date(inv.last_communication).getTime()) < 3600000;
          return (
            <div key={inv.id} onClick={() => router.push(`/monitoring/${inv.id}`)} className="glass p-5 hover:-translate-y-1 transition-transform cursor-pointer relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{inv.model}</h4>
                  <p className="text-slate-400 text-sm">S/N: {inv.serial_number} — Proyecto #{inv.project_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${inv.status === 'ONLINE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      inv.status === 'OFFLINE' ? 'text-slate-400 bg-slate-500/10 border-slate-500/30' :
                        inv.status === 'MAINTENANCE' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                          inv.status === 'ERROR' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                            'text-slate-400 bg-slate-500/10 border-slate-500/30'
                    }`}>
                    {(inv.status === 'ONLINE' || inv.status === 'OFFLINE') ? (
                      inv.status === 'ONLINE' ? <Wifi size={12} className="inline mr-1" /> : <WifiOff size={12} className="inline mr-1" />
                    ) : (
                      <Activity size={12} className="inline mr-1" />
                    )}
                    {inv.status || 'OFFLINE'}
                  </span>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setForm({ project_id: String(inv.project_id || ''), serial_number: inv.serial_number, model: inv.model, status: inv.status, id: inv.id });
                    setShowModal(true);
                  }} className="text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 p-1.5 rounded border border-slate-700 transition-all text-xs z-10 relative">
                    Editar
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }} className="text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 p-1.5 rounded border border-slate-700 transition-all text-xs z-10 relative">
                    X
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Instalación</p>
                  <p className="font-bold text-sm text-slate-200">{inv.installation_date ? new Date(inv.installation_date).toLocaleDateString() : '—'}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
                  {(inv.status === 'ONLINE') && <Wifi size={24} className="text-emerald-400" />}
                  {(inv.status === 'OFFLINE') && <WifiOff size={24} className="text-slate-400" />}
                  {(inv.status === 'ERROR') && <AlertTriangle size={24} className="text-rose-400 animate-pulse" />}
                  {(inv.status === 'MAINTENANCE') && <Activity size={24} className="text-amber-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Inversor">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">ID del Proyecto</label>
            <input type="number" value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: 1" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Número de Serie *</label>
            <input value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: INV-HYB-10K-00123" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Modelo *</label>
            <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Inversor Híbrido 10kW" />
          </div>
          {form.id && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="ERROR">ERROR</option>
              </select>
            </div>
          )}
          <button onClick={handleCreateOrUpdate} disabled={loading || !form.serial_number || !form.model} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Guardando...' : 'Registrar Inversor'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
