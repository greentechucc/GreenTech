'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, PenTool, CheckCircle, Clock, DollarSign, FileText, Edit, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import { getCurrentUser, getUsers } from '@/lib/mock-users';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{project_name: string, customer_name: string, customer_email: string, system_size: string, estimated_amount: string, status: string, completion: number, assigned_crew: string, assigned_auxiliaries: string[], planned_start_date: string, planned_end_date: string, bom_json: string}>({ 
    project_name: '', customer_name: '', customer_email: '', system_size: '', estimated_amount: '', status: 'CREATED', completion: 0, assigned_crew: '', assigned_auxiliaries: [], planned_start_date: '', planned_end_date: '', bom_json: '' 
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableAuxiliares, setAvailableAuxiliares] = useState<any[]>([]);
  const router = useRouter();

  const fetchData = () => {
    api.get('/projects/projects')
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]));
  };

  useEffect(() => { 
    const cu = getCurrentUser();
    setCurrentUser(cu);
    
    if (cu?.role === 'Tecnico' && cu.crew_name) {
       const allUsers = getUsers();
       const myAux = allUsers.filter(u => u.role === 'Auxiliar' && u.crew_name === cu.crew_name);
       setAvailableAuxiliares(myAux);
    }

    fetchData(); 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const customer = params.get('customer_name');
      const email = params.get('customer_email');
      const size = params.get('system_size');
      const amount = params.get('estimated_amount');
      const bom = params.get('bom');
      if (customer) {
        setForm({ project_name: '', customer_name: customer, customer_email: email || '', system_size: size || '', estimated_amount: amount || '', status: 'CREATED', completion: 0, assigned_crew: '', assigned_auxiliaries: [], planned_start_date: '', planned_end_date: '', bom_json: bom || '' });
        setShowModal(true);
        // Limpiar para evitar duplicados al recargar
        window.history.replaceState({}, '', '/projects');
        
        // Auto-fill fallback from CRM
        if (!email) {
          api.get('/crm/prospects').then(res => {
            const p = res.data.find((p: any) => p.name === customer && p.email);
            if (p) setForm(f => ({ ...f, customer_email: p.email }));
          }).catch(console.error);
        }
      }
    }
  }, []);

  const filteredProjects = useMemo(() => {
    let result = projects;
    
    if (currentUser?.role === 'Tecnico') {
      if (currentUser.crew_name) {
        result = result.filter(p => p.assigned_crew === currentUser.crew_name);
      }
    }

    if (currentUser?.role === 'Auxiliar') {
      result = result.filter(p => p.assigned_auxiliaries?.includes(currentUser.email));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.customer_name?.toLowerCase().includes(q) ||
        p.customer_email?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [projects, searchQuery, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.status).filter(Boolean)));
  }, [projects]);

  const handleFacturar = (p: any) => {
    const concept = `Anticipo/Avance Instalación ${p.system_size || p.name || 'Proyecto'}`;
    router.push(`/billing?customer_name=${encodeURIComponent(p.customer_name)}&projectId=${p.id}&amount=${p.estimated_amount || ''}&concept=${encodeURIComponent(concept)}`);
  };

  const handleTramite = (p: any) => {
    router.push(`/permits?projectId=${p.id}`);
  };

  const openEditModal = (p: any) => {
    setForm({
      project_name: p.name || '',
      customer_name: p.customer_name || '',
      customer_email: p.customer_email || '',
      system_size: p.system_size || '',
      estimated_amount: p.estimated_amount ? String(p.estimated_amount) : '',
      status: p.status || 'CREATED',
      completion: p.completion || 0,
      assigned_crew: p.assigned_crew || '',
      assigned_auxiliaries: p.assigned_auxiliaries || [],
      planned_start_date: p.planned_start_date ? new Date(p.planned_start_date).toISOString().split('T')[0] : '',
      planned_end_date: p.planned_end_date ? new Date(p.planned_end_date).toISOString().split('T')[0] : '',
      bom_json: p.bom_json || ''
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto permanentemente? Esto cambiará el estado de su cotización a "REJECTED".')) return;
    try {
      const p = projects.find(proj => proj.id === id);
      if (p && p.customer_name) {
        try {
          const qs = await api.get('/quotation/quotation').then(res => res.data);
          const q = qs.find((qt: any) => qt.customer_name === p.customer_name && qt.status === 'ACCEPTED');
          if (q) {
            await api.put(`/quotation/quotation/${q.id}`, { status: 'REJECTED' });
          }
        } catch (e) {
          console.warn('Could not update quotation status', e);
        }
      }
      await api.delete(`/projects/projects/${id}`);
      fetchData();
    } catch (e) {
      console.error('Error eliminando:', e);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!form.customer_name) return;
    
    // Validar inventario si hay BOM
    if (form.bom_json && !editingId) {
      try {
        const bom = JSON.parse(decodeURIComponent(form.bom_json));
        const res = await api.get('/inventory/inventory');
        const items = res.data;
        let missing = [];
        for (const line of bom) {
          const inv = items.find((i: any) => i.sku === line.sku);
          if (!inv || inv.stock < line.quantity) {
             missing.push(`${line.name} (Requiere: ${line.quantity} ${line.unit}, Stock: ${inv ? inv.stock : 0})`);
          }
        }
        if (missing.length > 0) {
          setAlertMsg("Advertencia: Faltan artículos para seguir con el proyecto. Productos sin stock:\n - " + missing.join("\n - "));
        }
      } catch (e) {
        console.warn("No se pudo validar el BOM", e);
      }
    }

    setLoading(true);
    const data = {
      ...form,
      name: form.project_name,
      estimated_amount: Number(form.estimated_amount) || 0,
    };
    try {
      if (editingId) {
        await api.put(`/projects/projects/${editingId}`, data);
      } else {
        await api.post('/projects/projects', data);
      }
      setForm({ project_name: '', customer_name: '', customer_email: '', system_size: '', estimated_amount: '', status: 'CREATED', completion: 0, assigned_crew: '', assigned_auxiliaries: [], planned_start_date: '', planned_end_date: '', bom_json: '' });
      setEditingId(null);
      setShowModal(false);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/projects');
      }
      fetchData();
    } catch (e) {
      console.error('Error guardando proyecto:', e);
    } finally {
      setLoading(false);
    }
  };

  const stageIcon = (stage: string) => {
    if (stage?.includes('instalacion') || stage?.includes('INSTALLATION')) return <PenTool size={16} className="text-amber-400"/>;
    if (stage?.includes('completado') || stage?.includes('COMPLETED')) return <CheckCircle size={16} className="text-emerald-400"/>;
    return <Clock size={16} className="text-blue-400"/>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No definida';
    return new Date(dateStr).toLocaleDateString('es-CO');
  };

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Proyectos e Instalaciones</h1>
          <p className="text-slate-400">Orquestación de cuadrillas y etapas de ejecución</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ project_name: '', customer_name: '', customer_email: '', system_size: '', estimated_amount: '', status: 'CREATED', completion: 0, assigned_crew: '', assigned_auxiliaries: [], planned_start_date: '', planned_end_date: '', bom_json: '' }); setShowModal(true); }} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Nuevo Proyecto
        </button>
      </header>

      {alertMsg && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-xl mb-4 flex items-start justify-between fade-in shadow-lg">
          <div className="whitespace-pre-line text-sm font-medium">{alertMsg}</div>
          <button onClick={() => setAlertMsg('')} className="text-amber-500/60 hover:text-amber-500 transition-colors"><X size={18}/></button>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cliente o ID..."
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
                  {s?.replace(/_/g, ' ').toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(searchQuery || statusFilter) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Mostrando {filteredProjects.length} de {projects.length} proyectos</span>
          <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }} className="text-emerald-400 hover:text-emerald-300 underline ml-2">
            Limpiar filtros
          </button>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="glass p-12 text-center text-slate-500">
          {searchQuery || statusFilter ? 'No se encontraron resultados.' : 'No hay proyectos registrados. Crea el primero.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-6">
        {filteredProjects.map((p: any) => (
          <div key={p.id} onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; router.push(`/projects/${p.id}`); }} className="glass p-6 hover:-translate-y-1 transition-transform flex flex-col group relative cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{p.name || p.customer_name}</h3>
              <div className="flex items-center gap-2">
                {currentUser?.role !== 'Auxiliar' && currentUser?.role !== 'Facturas' && (
                  <button onClick={() => openEditModal(p)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 p-1.5 rounded-lg border border-blue-400/30 transition-all opacity-0 group-hover:opacity-100" title="Editar">
                    <Edit size={14} />
                  </button>
                )}
                {currentUser?.role !== 'Auxiliar' && currentUser?.role !== 'Facturas' && currentUser?.role !== 'Tecnico' && (
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 p-1.5 rounded-lg border border-red-400/30 transition-all opacity-0 group-hover:opacity-100" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                )}
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">#{p.id}</span>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm mb-2">{p.customer_name} — {p.customer_email}</p>
            {p.system_size && <p className="text-cyan-400 text-sm mb-4">{p.system_size}</p>}
            
            <div className="bg-slate-900/50 p-3 rounded-lg mb-4 text-xs flex flex-col gap-2 border border-slate-700/50">
              <div className="flex justify-between">
                <span className="text-slate-400">Cuadrilla Asignada:</span>
                <span className="text-slate-200 font-medium">{p.assigned_crew || 'No asignada'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inicio Planeado:</span>
                <span className="text-slate-200">{formatDate(p.planned_start_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fin Planeado:</span>
                <span className="text-slate-200">{formatDate(p.planned_end_date)}</span>
              </div>
            </div>

            <div className="space-y-4 mt-auto">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Avance Fase</span>
                  <span className="text-emerald-400 font-bold">{p.completion || 0}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: `${p.completion || 0}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-2">
                <div className="flex gap-2 items-center bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700 w-full">
                  {stageIcon(p.status)}
                  <span className="text-sm font-medium truncate" title={p.status}>{p.status?.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <button onClick={() => handleFacturar(p)} className="p-2 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-lg border border-cyan-400/30 transition-all flex items-center justify-center whitespace-nowrap gap-1 px-3" title="Generar Factura">
                  <DollarSign size={16} /> Facturar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <div className="space-y-4 overflow-y-auto max-h-[70vh] p-1">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre del Proyecto</label>
            <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Ej: Instalación Villa Solar" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cliente *</label>
            <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Ej: Empacadora del Norte" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email del Cliente</label>
            <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="contacto@empresa.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tamaño del Sistema</label>
              <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} value={form.system_size} onChange={e => setForm({...form, system_size: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Ej: 25 kWp" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Monto Estimado (COP)</label>
              <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} type="number" value={form.estimated_amount} onChange={e => setForm({...form, estimated_amount: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="0" />
            </div>
          </div>
          
          <div className="border-t border-slate-700 my-4 pt-4">
            <h4 className="text-sm font-semibold text-emerald-400 mb-3">Ejecución y Operaciones</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Cuadrilla Asignada</label>
                {(currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar') ? (
                  <div className="w-full bg-slate-900/70 border border-slate-600 rounded-xl py-2 px-4 text-slate-300 cursor-not-allowed opacity-80">
                    {form.assigned_crew || 'No asignada'}
                    <span className="text-xs text-slate-500 ml-2">(solo lectura)</span>
                  </div>
                ) : (
                  <select value={form.assigned_crew} onChange={e => setForm({...form, assigned_crew: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                    <option value="">Seleccionar cuadrilla...</option>
                    <option value="Cuadrilla Alfa (Norte)">Cuadrilla Alfa (Norte)</option>
                    <option value="Cuadrilla Beta (Sur)">Cuadrilla Beta (Sur)</option>
                    <option value="Cuadrilla Omega (Centro)">Cuadrilla Omega (Centro)</option>
                    <option value="Subcontratista Energía Global">Subcontratista Energía Global</option>
                  </select>
                )}
              </div>

              {/* Assignment logic for available Auxiliaries */}
              {availableAuxiliares.length > 0 && (
                 <div className="col-span-2 mb-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <label className="block text-sm text-slate-300 font-medium mb-2">Delegar a Auxiliares de tu Cuadrilla</label>
                    <div className="flex flex-wrap gap-2">
                       {availableAuxiliares.map(aux => (
                         <label key={aux.email} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-600 hover:border-emerald-500 cursor-pointer text-sm">
                           <input 
                             type="checkbox" 
                             className="accent-emerald-500"
                             checked={form.assigned_auxiliaries.includes(aux.email)}
                             onChange={(e) => {
                               if (e.target.checked) setForm(prev => ({...prev, assigned_auxiliaries: [...prev.assigned_auxiliaries, aux.email]}));
                               else setForm(prev => ({...prev, assigned_auxiliaries: prev.assigned_auxiliaries.filter(a => a !== aux.email)}));
                             }}
                            />
                           {aux.name}
                         </label>
                       ))}
                    </div>
                 </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha Inicio Planeada</label>
                <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} type="date" value={form.planned_start_date} onChange={e => setForm({...form, planned_start_date: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha Fin Planeada</label>
                <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} type="date" value={form.planned_end_date} onChange={e => setForm({...form, planned_end_date: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Estado de la Fase Actual</label>
            <div className="flex gap-4">
              <select disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-2/3 bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {['CREATED', 'TECHNICAL_VISIT', 'DESIGN', 'PERMIT_PROCESS', 'APPROVED', 'INSTALLATION', 'GRID_CONNECTION', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <div className="w-1/3 relative">
                 <input disabled={currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar' || currentUser?.role === 'Facturas'} type="number" min="0" max="100" value={form.completion} onChange={e => setForm({...form, completion: parseInt(e.target.value) || 0})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all pr-8 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="0" />
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
          </div>
          <button onClick={handleCreateOrUpdate} disabled={loading || !form.customer_name} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Guardando...' : editingId ? 'Actualizar Proyecto' : 'Crear Proyecto'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
