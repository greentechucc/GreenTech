'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, CreditCard, DollarSign, Clock, CheckCircle2, XCircle, FileText, Edit, Trash2, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';

const statusColors: Record<string, string> = {
  'PAID': 'text-emerald-400', 'PENDING': 'text-amber-400',
  'OVERDUE': 'text-rose-400', 'CANCELLED': 'text-slate-400',
};

interface InvoiceGroup {
  projectId: number;
  customerName: string;
  baseConcept: string;
  totalAmount: number;
  invoices: any[];
  consolidatedStatus: string;
  paidAmount: number;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{customer_name: string, concept: string, amount: string, projectId: string, customerId: string, status?: string}>({ customer_name: '', concept: '', amount: '', projectId: '', customerId: '', status: 'PENDING' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const fetchData = () => {
    api.get('/billing/billing/invoices')
      .then(res => setInvoices(res.data))
      .catch(() => setInvoices([]));
  };

  useEffect(() => { 
    fetchData(); 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('projectId');
      const customer = params.get('customer_name');
      const amount = params.get('amount');
      const concept = params.get('concept');
      if (projectId || customer) {
        setForm({ customer_name: customer || '', concept: concept || '', amount: amount || '', projectId: projectId || '', customerId: '' });
        setShowModal(true);
      }
    }
  }, []);

  // Group invoices by project_id for milestone consolidation
  const { grouped, standalone } = useMemo(() => {
    const byProject: Record<number, any[]> = {};
    const standalone: any[] = [];

    invoices.forEach(inv => {
      if (inv.project_id && inv.project_id > 0) {
        if (!byProject[inv.project_id]) byProject[inv.project_id] = [];
        byProject[inv.project_id].push(inv);
      } else {
        standalone.push(inv);
      }
    });

    const grouped: InvoiceGroup[] = Object.entries(byProject).map(([pid, invs]) => {
      const totalAmount = invs.reduce((s: number, i: any) => s + i.amount, 0);
      const paidAmount = invs.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.amount, 0);
      const allPaid = invs.every((i: any) => i.status === 'PAID');
      const anyCancelled = invs.some((i: any) => i.status === 'CANCELLED');
      const consolidatedStatus = allPaid ? 'PAID' : anyCancelled ? 'CANCELLED' : 'PENDING';
      // Extract base concept (remove milestone suffix)
      const baseConcept = invs[0]?.concept?.replace(/ - (Anticipo|Contra-entrega|Conexión).*$/i, '') || 'Proyecto Solar';

      return {
        projectId: Number(pid),
        customerName: invs[0]?.customer_name || '',
        baseConcept,
        totalAmount,
        invoices: invs,
        consolidatedStatus,
        paidAmount,
      };
    });

    return { grouped, standalone };
  }, [invoices]);

  // Combined rows for filtering
  const filteredRows = useMemo(() => {
    let gRows = grouped;
    let sRows = standalone;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      gRows = gRows.filter(g =>
        g.customerName.toLowerCase().includes(q) ||
        g.baseConcept.toLowerCase().includes(q) ||
        String(g.projectId).includes(q)
      );
      sRows = sRows.filter(inv =>
        inv.customer_name?.toLowerCase().includes(q) ||
        inv.concept?.toLowerCase().includes(q) ||
        String(inv.id).includes(q)
      );
    }
    if (statusFilter) {
      gRows = gRows.filter(g => g.consolidatedStatus === statusFilter);
      sRows = sRows.filter(inv => inv.status === statusFilter);
    }
    return { gRows, sRows };
  }, [grouped, standalone, searchQuery, statusFilter]);

  const openEditModal = (inv: any) => {
    setForm({ 
      customer_name: inv.customer_name || '', 
      concept: inv.concept || '', 
      amount: String(inv.amount), 
      projectId: String(inv.project_id || ''), 
      customerId: String(inv.customer_id || ''),
      status: inv.status || 'PENDING'
    });
    setEditingId(inv.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta factura permanentemente?')) return;
    try {
      await api.delete(`/billing/billing/invoices/${id}`);
      fetchData();
    } catch (e) {
      console.error('Error eliminando:', e);
    }
  };

  const handleDeleteGroup = async (e: React.MouseEvent, invoicesToDel: any[]) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar TODOS los hitos de este proyecto permanentemente?')) return;
    try {
      await Promise.all(invoicesToDel.map(inv => api.delete(`/billing/billing/invoices/${inv.id}`)));
      fetchData();
    } catch (err) {
      console.error('Error eliminando grupo:', err);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!form.amount || !form.customer_name) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/billing/billing/invoices/${editingId}`, {
          amount: Number(form.amount),
          concept: form.concept,
          customer_name: form.customer_name,
          status: form.status
        });
      } else {
        await api.post('/billing/billing/invoice', {
          projectId: Number(form.projectId) || 0,
          customerId: Number(form.customerId) || 0,
          amount: Number(form.amount),
          concept: form.concept,
          customer_name: form.customer_name,
          status: 'PENDING'
        });
      }
      setForm({ customer_name: '', concept: '', amount: '', projectId: '', customerId: '', status: 'PENDING' });
      setEditingId(null);
      setShowModal(false);
      fetchData();
    } catch (e) {
      console.error('Error guardando factura:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.amount, 0);
  const totalPending = invoices.filter((i: any) => i.status === 'PENDING').reduce((s: number, i: any) => s + i.amount, 0);
  const overdue = invoices.filter((i: any) => i.due_date && new Date(i.due_date) < new Date() && i.status === 'PENDING').length;

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(invoices.map(i => i.status).filter(Boolean)));
  }, [invoices]);

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Facturación</h1>
          <p className="text-slate-400">Control de facturas, cuentas por cobrar y pagos</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ customer_name: '', concept: '', amount: '', projectId: '', customerId: '' }); setShowModal(true); }} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Nueva Factura
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Cobrado</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">${totalPaid.toLocaleString('en-US')}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><CheckCircle2 size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Por Cobrar</p>
              <h3 className="text-2xl font-bold mt-1">${totalPending.toLocaleString('en-US')}</h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Clock size={22}/></div>
          </div>
        </div>
        <div className={`glass p-5 hover:-translate-y-1 transition-transform relative overflow-hidden`}>
          {overdue > 0 && <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>}
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Vencidas</p>
              <h3 className={`text-2xl font-bold mt-1 ${overdue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{overdue}</h3>
            </div>
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><XCircle size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Facturas</p>
              <h3 className="text-2xl font-bold mt-1">{invoices.length}</h3>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400"><FileText size={22}/></div>
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
            placeholder="Buscar por cliente o concepto..."
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
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(searchQuery || statusFilter) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Mostrando {filteredRows.gRows.length + filteredRows.sRows.length} resultados</span>
          <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }} className="text-emerald-400 hover:text-emerald-300 underline ml-2">
            Limpiar filtros
          </button>
        </div>
      )}

      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">Folio</th>
              <th className="p-4 font-medium text-slate-300">Cliente</th>
              <th className="p-4 font-medium text-slate-300">Concepto</th>
              <th className="p-4 font-medium text-slate-300">Monto</th>
              <th className="p-4 font-medium text-slate-300">Hitos</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.gRows.length === 0 && filteredRows.sRows.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">
                {searchQuery || statusFilter ? 'No se encontraron resultados.' : 'No hay facturas registradas. Crea la primera.'}
              </td></tr>
            )}

            {/* Grouped milestone rows */}
            {filteredRows.gRows.map(g => {
              const paidCount = g.invoices.filter((i: any) => i.status === 'PAID').length;
              return (
                <tr key={`grp-${g.projectId}`} onClick={() => router.push(`/billing/${g.projectId}`)} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group cursor-pointer">
                  <td className="p-4 font-mono text-sm text-cyan-400">PROY-{String(g.projectId).padStart(4, '0')}</td>
                  <td className="p-4 font-medium">{g.customerName}</td>
                  <td className="p-4 text-slate-300 text-sm max-w-[250px] truncate" title={g.baseConcept}>{g.baseConcept}</td>
                  <td className="p-4 font-semibold">${g.totalAmount.toLocaleString('en-US')}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {g.invoices.map((inv: any, i: number) => (
                        <div key={inv.id} className={`w-3 h-3 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-400' : inv.status === 'CANCELLED' ? 'bg-rose-400' : 'bg-amber-400'}`} title={`Hito ${i+1}: ${inv.status}`} />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">({paidCount}/{g.invoices.length})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-semibold ${statusColors[g.consolidatedStatus] || 'text-slate-400'}`}>
                      {g.consolidatedStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver hitos</span>
                        <ChevronRight size={18} />
                      </div>
                      <button onClick={(e) => handleDeleteGroup(e, g.invoices)} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100" title="Eliminar Todos los Hitos">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Standalone invoice rows */}
            {filteredRows.sRows.map((inv: any) => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 font-mono text-sm text-cyan-400">FAC-{String(inv.id).padStart(4, '0')}</td>
                <td className="p-4 font-medium">{inv.customer_name || `Cliente #${inv.customer_id}`}</td>
                <td className="p-4 text-slate-300 text-sm max-w-[250px] truncate" title={inv.concept}>{inv.concept || '—'}</td>
                <td className="p-4 font-semibold">${inv.amount?.toLocaleString('en-US')}</td>
                <td className="p-4 text-slate-500 text-xs">Individual</td>
                <td className="p-4">
                  <span className={`px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-semibold ${statusColors[inv.status] || 'text-slate-400'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(inv)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2 py-1.5 rounded-lg border border-blue-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Editar Factura' : 'Nueva Factura'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre del Cliente *</label>
            <input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Empacadora del Norte" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Concepto</label>
            <input value={form.concept} onChange={e => setForm({...form, concept: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Instalación Sistema 25kWp - Anticipo 50%" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Monto *</label>
              <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="242500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">ID Proyecto</label>
              <input type="number" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="1" />
            </div>
            {editingId && (
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            )}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-500 font-medium mb-1">ℹ️ Facturación por Hitos</p>
            <p className="text-xs text-slate-400 leading-relaxed">Al asociar un Proyecto, el sistema generará automáticamente los **3 hitos del contrato** (Anticipo 50%, Contra-entrega 40%, Conexión 10%) para garantizar el flujo de caja del proyecto.</p>
          </div>
          <button onClick={handleCreateOrUpdate} disabled={loading || !form.amount || !form.customer_name} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Guardando...' : editingId ? 'Actualizar Factura' : 'Crear Factura'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
