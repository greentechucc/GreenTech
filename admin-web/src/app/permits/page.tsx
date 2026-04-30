'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, MoreVertical, Clock, FileCheck, CheckSquare } from 'lucide-react';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';

const statusColors: Record<string, string> = {
  'NOT_STARTED': 'text-slate-400', 'SUBMITTED': 'text-blue-400',
  'UNDER_REVIEW': 'text-amber-400', 'APPROVED': 'text-emerald-400',
  'REJECTED': 'text-rose-400'
};

export default function PermitsPage() {
  const [permits, setPermits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDictModal, setShowDictModal] = useState(false);
  const [dictionary, setDictionary] = useState<any[]>([]);
  const [form, setForm] = useState<{project_id: string, utility_company: string, permit_type: string, status?: string, id?: number}>({ project_id: '', utility_company: '', permit_type: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = () => {
    api.get('/permits/permits')
      .then(res => setPermits(res.data))
      .catch(() => setPermits([]));
  };

  const fetchDictionary = () => {
    api.get('/permits/permits/dictionary')
      .then(res => setDictionary(res.data))
      .catch(e => console.error(e));
  };

  useEffect(() => { 
    fetchData(); 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('projectId');
      if (projectId) {
        setForm({ project_id: projectId, utility_company: '', permit_type: '' });
        setShowModal(true);
      }
    }
  }, []);

  const handleCreate = async () => {
    if (!form.project_id || !form.utility_company || !form.permit_type) return;
    setLoading(true);
    try {
      if ((form as any).id) {
         await api.put(`/permits/permits/${(form as any).id}`, {
            project_id: Number(form.project_id),
            utility_company: form.utility_company,
            permit_type: form.permit_type,
            status: (form as any).status
         });
      } else {
          await api.post('/permits/permits', {
            project_id: Number(form.project_id),
            utility_company: form.utility_company,
            permit_type: form.permit_type,
            status: 'NOT_STARTED',
          });
      }
      setForm({ project_id: '', utility_company: '', permit_type: '' });
      setShowModal(false);
      fetchData();
    } catch (e) {
      console.error('Error guardando trámite:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este trámite?')) return;
    try {
        await api.delete(`/permits/permits/${id}`);
        fetchData();
    } catch(e) { console.error('Error eliminando tramite', e) }
  };

  const pending = permits.filter(p => ['NOT_STARTED', 'SUBMITTED', 'UNDER_REVIEW'].includes(p.status)).length;
  const approved = permits.filter(p => p.status === 'APPROVED').length;

  const filteredPermits = useMemo(() => {
    let result = permits;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.utility_company?.toLowerCase().includes(q) ||
        String(p.project_id).includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [permits, searchQuery, statusFilter]);

  const uniqueStatuses = Object.keys(statusColors);

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Trámites y Permisos</h1>
          <p className="text-slate-400">Gestión de permisos CFE, municipales y regulación SENER</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { fetchDictionary(); setShowDictModal(true); }} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-all">
            Diccionario de Permisos
          </button>
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
            <Plus size={20} /> Nuevo Trámite
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Trámites en Proceso</p>
              <h3 className="text-2xl font-bold mt-1">{pending}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Clock size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Aprobados</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">{approved}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><FileCheck size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Registrados</p>
              <h3 className="text-2xl font-bold mt-1">{permits.length}</h3>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400"><CheckSquare size={22}/></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por proyecto o autoridad..." 
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" 
          />
        </div>
        <div className="relative">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${statusFilter ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 hover:bg-slate-800'}`}>
            <Filter size={18} /> Filtros {statusFilter && '•'}
          </button>
          {showFilters && (
            <div className="absolute top-12 right-0 z-50 glass p-3 rounded-xl min-w-[200px] space-y-2 shadow-2xl border border-slate-700">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Estado</p>
              <button onClick={() => { setStatusFilter(''); setShowFilters(false); }} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${!statusFilter ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                Todos
              </button>
              {uniqueStatuses.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setShowFilters(false); }} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${statusFilter === s ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">ID</th>
              <th className="p-4 font-medium text-slate-300">Proyecto ID</th>
              <th className="p-4 font-medium text-slate-300">Tipo</th>
              <th className="p-4 font-medium text-slate-300">Autoridad</th>
              <th className="p-4 font-medium text-slate-300">Fecha Ingreso</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPermits.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">
                {searchQuery || statusFilter ? 'No se encontraron resultados.' : 'No hay trámites registrados. Crea el primero.'}
              </td></tr>
            )}
            {filteredPermits.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 font-mono text-sm text-cyan-400">PRM-{String(p.id).padStart(4, '0')}</td>
                <td className="p-4 font-medium">Proyecto #{p.project_id}</td>
                <td className="p-4 text-slate-300">{p.permit_type}</td>
                <td className="p-4 text-slate-400">{p.utility_company}</td>
                <td className="p-4 text-slate-400 text-sm">{p.application_date ? new Date(p.application_date).toLocaleDateString() : '—'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-semibold ${statusColors[p.status] || 'text-slate-400'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => {
                        setForm({
                            id: p.id,
                            project_id: String(p.project_id),
                            utility_company: p.utility_company,
                            permit_type: p.permit_type,
                            status: p.status
                        });
                        setShowModal(true);
                    }} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2 py-1.5 rounded-lg border border-blue-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Editar">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Eliminar">
                      X
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Trámite">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">ID del Proyecto *</label>
            <input type="number" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: 1" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Compañía / Autoridad *</label>
            <select value={form.utility_company} onChange={e => setForm({...form, utility_company: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
              <option value="">Seleccionar...</option>
              <option value="CFE Distribución">CFE Distribución</option>
              <option value="Municipio">Municipio</option>
              <option value="SENER / CRE">SENER / CRE</option>
              <option value="Protección Civil">Protección Civil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo de Permiso *</label>
            <select value={form.permit_type} onChange={e => setForm({...form, permit_type: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
              <option value="">Seleccionar...</option>
              <option value="SOLAR_INTERCONNECTION">Interconexión Solar</option>
              <option value="CONSTRUCTION_LICENSE">Licencia de Construcción</option>
              <option value="ENVIRONMENTAL">Impacto Ambiental</option>
              <option value="SENER_PERMIT">Permiso SENER</option>
            </select>
          </div>
          {/* Status edit element */}
           {(form as any).status !== undefined && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Estado</label>
              <select value={(form as any).status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
           )}
          <button onClick={handleCreate} disabled={loading || !form.project_id || !form.utility_company || !form.permit_type} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Guardando...' : 'Guardar Trámite'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showDictModal} onClose={() => setShowDictModal(false)} title="Diccionario de Permisos">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {dictionary.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Cargando diccionario o no hay registros...</p>
          ) : (
            dictionary.map((req: any) => (
              <div key={req.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-amber-400 font-bold">{req.utility_company}</h4>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">{req.estimated_processing_days} días est.</span>
                </div>
                <p className="text-sm font-medium text-slate-200 mb-3">{req.permit_type}</p>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Documentos Requeridos:</p>
                  <ul className="list-disc list-inside text-sm text-slate-300">
                    {(() => {
                      try {
                        const docs = JSON.parse(req.required_documents);
                        return docs.map((doc: string, i: number) => <li key={i}>{doc}</li>);
                      } catch(e) {
                        return <li>{req.required_documents}</li>;
                      }
                    })()}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
