'use client';

import { useEffect, useState } from 'react';
import { Plus, Activity, Sun, Wifi, WifiOff, Zap, Thermometer } from 'lucide-react';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';

export default function MonitoringPage() {
  const [inverters, setInverters] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{project_id: string, serial_number: string, model: string, status?: string, id?: number}>({ project_id: '', serial_number: '', model: '', status: 'OFFLINE' });
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    api.get('/monitoring/monitoring/inverters')
      .then(res => setInverters(res.data))
      .catch(() => setInverters([]));
  };

  useEffect(() => { fetchData(); }, []);

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
    if(!confirm("¿Está seguro de eliminar este inversor?")) return;
    try {
        await api.delete(`/monitoring/monitoring/inverters/${id}`);
        fetchData();
    } catch(e) { console.error(e) }
  };


  const online = inverters.filter((i: any) => i.last_communication && (Date.now() - new Date(i.last_communication).getTime()) < 3600000).length;

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
              <h3 className="text-2xl font-bold mt-1">{inverters.length}</h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Zap size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Con Comunicación Reciente</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">{online}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Wifi size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Sin Comunicación</p>
              <h3 className={`text-2xl font-bold mt-1 ${inverters.length - online > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{inverters.length - online}</h3>
            </div>
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><Activity size={22}/></div>
          </div>
        </div>
      </div>

      {/* Inverter Cards */}
      {inverters.length === 0 && (
        <div className="glass p-12 text-center text-slate-500">No hay inversores registrados. Registra el primero.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inverters.map((inv: any) => {
          const hasComm = inv.last_communication && (Date.now() - new Date(inv.last_communication).getTime()) < 3600000;
          return (
            <div key={inv.id} className="glass p-5 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{inv.model}</h4>
                  <p className="text-slate-400 text-sm">S/N: {inv.serial_number} — Proyecto #{inv.project_id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      inv.status === 'ONLINE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
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
                    <button onClick={async () => {
                        try {
                           const res = await api.get(`/monitoring/monitoring/savings/project/${inv.project_id}`);
                           const data = res.data;
                           alert(`Ahorro (Últimas 24h):\n\nGeneración: ${data.saved_kwh.toFixed(2)} kWh\nTarifa Comercial Promedio: $${data.tarifa_promedio} COP\n\nTotal Ahorrado: $${data.savings_cop.toLocaleString('en-US')} COP`);
                        } catch(e) { console.error('Error fetching savings', e); alert('Error al obtener ahorros.'); }
                    }} className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 p-1.5 rounded border border-emerald-400/30 transition-all text-xs" title="Ver ahorros en COP">
                        <Thermometer size={14} className="inline mr-1"/> Ahorro
                    </button>
                    <button onClick={() => {
                        setForm({ project_id: String(inv.project_id || ''), serial_number: inv.serial_number, model: inv.model, status: inv.status, id: inv.id });
                        setShowModal(true);
                    }} className="text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 p-1.5 rounded border border-slate-700 transition-all text-xs">
                        Editar
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 p-1.5 rounded border border-slate-700 transition-all text-xs">
                        X
                    </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Instalación</p>
                  <p className="font-bold text-sm text-slate-200">{inv.installation_date ? new Date(inv.installation_date).toLocaleDateString() : '—'}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Última Comunicación</p>
                  <p className="font-bold text-sm text-slate-200">{inv.last_communication ? new Date(inv.last_communication).toLocaleString('en-US') : 'Sin datos'}</p>
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
            <input type="number" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: 1" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Número de Serie *</label>
            <input value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: INV-HYB-10K-00123" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Modelo *</label>
            <select value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
              <option value="">Seleccionar...</option>
              <option value="Inversor Híbrido 10kW">Inversor Híbrido 10kW</option>
              <option value="Inversor On-Grid 5kW">Inversor On-Grid 5kW</option>
              <option value="Inversor On-Grid 10kW">Inversor On-Grid 10kW</option>
              <option value="Inversor String 15kW">Inversor String 15kW</option>
              <option value="Micro-Inversor 800W">Micro-Inversor 800W</option>
            </select>
          </div>
          {form.id && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">Estado</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
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
