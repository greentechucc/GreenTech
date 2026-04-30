'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, Phone, Mail, FileText, Edit, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';

export default function CRMPage() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{name: string, email: string, phone: string, consumption: string, source: string, assigned_rep: string, status?: string}>({ name: '', email: '', phone: '', consumption: '', source: 'Web', assigned_rep: '', status: 'NEW' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const handleCotizar = async (p: any) => {
    try {
      await api.put(`/crm/prospects/${p.id}`, { status: 'QUOTED' });
      fetchProspects();
    } catch {}
    const consumo = p.consumption ? String(p.consumption).replace(/\D/g, '') : '';
    router.push(`/quotations?customer_name=${encodeURIComponent(p.name)}&customer_email=${encodeURIComponent(p.email || '')}&consumo=${consumo}`);
  };

  const handleConvertir = async (p: any) => {
    if (!window.confirm('¿Convertir este prospecto a Cliente oficial? Esto generará un perfil de cliente.')) return;
    try {
      await api.post(`/crm/prospects/convert/${p.id}`);
      fetchProspects();
      // Mover a cotización para continuar el flujo
      handleCotizar(p);
    } catch (e) {
      console.error('Error convirtiendo:', e);
      alert('Error convirtiendo prospecto');
    }
  };

  const fetchProspects = () => {
    api.get('/crm/prospects')
      .then(res => setProspects(res.data))
      .catch(() => setProspects([]));
  };

  useEffect(() => { fetchProspects(); }, []);

  const filteredProspects = useMemo(() => {
    let result = prospects;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [prospects, searchQuery, statusFilter]);

  const openEditModal = (p: any) => {
    setForm({ name: p.name, email: p.email || '', phone: p.phone || '', consumption: p.consumption || '', source: p.source || 'Web', assigned_rep: p.assigned_rep || '', status: p.status || 'NEW' });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este prospecto permanentemente?')) return;
    try {
      await api.delete(`/crm/prospects/${id}`);
      fetchProspects();
    } catch (e) {
      console.error('Error eliminando:', e);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/crm/prospects/${editingId}`, form);
      } else {
        await api.post('/crm/prospects', form);
      }
      setForm({ name: '', email: '', phone: '', consumption: '', source: 'Web', assigned_rep: '', status: 'NEW' });
      setEditingId(null);
      setShowModal(false);
      fetchProspects();
    } catch (e) {
      console.error('Error guardando prospecto:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/crm/prospects/${id}`, { status: newStatus });
      fetchProspects();
    } catch (e) {
      console.error('Error changing status', e);
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      'NEW': 'text-blue-400', 'CONTACTED': 'text-cyan-400',
      'QUALIFIED': 'text-indigo-400', 'QUOTED': 'text-amber-400',
      'NEGOTIATION': 'text-orange-400', 'WON': 'text-emerald-400', 'LOST': 'text-rose-400'
    };
    return map[s?.toUpperCase()] || 'text-slate-400';
  };

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(prospects.map(p => p.status).filter(Boolean)));
  }, [prospects]);

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">CRM & Gestión de Clientes</h1>
          <p className="text-slate-400">Prospectos y seguimiento comercial</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ name: '', email: '', phone: '', consumption: '', source: 'Web', assigned_rep: '', status: 'NEW' }); setShowModal(true); }} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Nuevo Prospecto
        </button>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
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
                  {s?.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(searchQuery || statusFilter) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Mostrando {filteredProspects.length} de {prospects.length} prospectos</span>
          {(searchQuery || statusFilter) && (
            <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }} className="text-emerald-400 hover:text-emerald-300 underline ml-2">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">Prospecto / Empresa</th>
              <th className="p-4 font-medium text-slate-300">Contacto</th>
              <th className="p-4 font-medium text-slate-300">Fuente</th>
              <th className="p-4 font-medium text-slate-300">Asesor</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300 w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProspects.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">
                {searchQuery || statusFilter ? 'No se encontraron resultados.' : 'No hay prospectos registrados. Crea el primero.'}
              </td></tr>
            )}
            {filteredProspects.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm flex items-center gap-2 text-slate-300"><Mail size={14}/> {p.email}</span>
                    <span className="text-sm flex items-center gap-2 text-slate-400"><Phone size={14}/> {p.phone}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-300 text-sm">{p.source || 'Directo'}</td>
                <td className="p-4 text-cyan-400 text-sm">{p.assigned_rep || 'Sin Asignar'}</td>
                <td className="p-4">
                  <select 
                    value={p.status || 'NEW'} 
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`bg-slate-900 border border-slate-700/50 rounded drop-shadow px-2 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer ${statusColor(p.status)}`}
                  >
                    {['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'NEGOTIATION', 'WON', 'LOST'].map(s => (
                      <option key={s} value={s} className="text-slate-300">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {p.status?.toUpperCase() !== 'WON' ? (
                      <button onClick={() => handleConvertir(p)} className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-lg border border-emerald-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100">
                        Convertir
                      </button>
                    ) : (
                      <button onClick={() => handleCotizar(p)} className="text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1.5 rounded-lg border border-cyan-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100">
                        <FileText size={16} /> Cotizar
                      </button>
                    )}
                    <button onClick={() => openEditModal(p)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2 py-1.5 rounded-lg border border-blue-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Editar Prospecto' : 'Nuevo Prospecto'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre / Empresa *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Empacadora del Norte" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Correo electrónico</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="contacto@empresa.com" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="555-0192" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Fuente</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                {['Web', 'Llamada', 'Referido', 'Evento', 'Otro'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Asesor Asignado</label>
              <input value={form.assigned_rep} onChange={e => setForm({...form, assigned_rep: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Ana López" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Consumo estimado</label>
              <input value={form.consumption} onChange={e => setForm({...form, consumption: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="15,000 kWh" />
            </div>
          </div>
          {editingId && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">Estado</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                {['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'NEGOTIATION', 'WON', 'LOST'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          )}
          <button onClick={handleCreateOrUpdate} disabled={loading || !form.name} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Guardando...' : editingId ? 'Actualizar Prospecto' : 'Crear Prospecto'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
