'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, CheckCircle2, Clock, XCircle, Edit, Trash2, CreditCard } from 'lucide-react';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';

const statusColors: Record<string, string> = {
  'PAID': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'PENDING': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'OVERDUE': 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  'CANCELLED': 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

const statusIcons: Record<string, any> = {
  'PAID': CheckCircle2,
  'PENDING': Clock,
  'OVERDUE': XCircle,
  'CANCELLED': XCircle,
};

const milestoneLabels = ['Anticipo (50%)', 'Contra-entrega (40%)', 'Conexión / Trámites (10%)'];
const milestoneColors = ['from-amber-500 to-orange-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500'];

export default function BillingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editingInv, setEditingInv] = useState<any>(null);
  const [editForm, setEditForm] = useState({ status: 'PENDING', amount: '', concept: '', customer_name: '' });

  useEffect(() => {
    fetchInvoices();
  }, [projectId]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing/billing/invoices');
      const filtered = res.data.filter((inv: any) => inv.project_id === Number(projectId));
      // Sort by id to keep order: Anticipo, Contra-entrega, Conexion
      filtered.sort((a: any, b: any) => a.id - b.id);
      setInvoices(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const customerName = invoices[0]?.customer_name || 'Cliente';

  const openEdit = (inv: any) => {
    setEditingInv(inv);
    setEditForm({
      status: inv.status,
      amount: String(inv.amount),
      concept: inv.concept || '',
      customer_name: inv.customer_name || '',
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingInv) return;
    try {
      await api.put(`/billing/billing/invoices/${editingInv.id}`, {
        status: editForm.status,
        amount: Number(editForm.amount),
        concept: editForm.concept,
        customer_name: editForm.customer_name,
      });
      setEditModal(false);
      setEditingInv(null);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este hito de facturación permanentemente?')) return;
    try {
      await api.delete(`/billing/billing/invoices/${id}`);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (n: number) => `$${(n || 0).toLocaleString('en-US')}`;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando hitos...</div>
      </div>
    );
  }

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <button onClick={() => router.push('/billing')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a Facturación
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light tracking-tight">Hitos de Facturación</h1>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700 font-mono">PROY-{String(projectId).padStart(4, '0')}</span>
            </div>
            <p className="text-slate-400">Cliente: <span className="text-white font-medium">{customerName}</span></p>
          </div>
        </div>
      </header>

      {/* Payment Progress */}
      <div className="glass p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-400 font-medium">Progreso de Cobro</p>
            <p className="text-2xl font-bold">
              <span className="text-emerald-400">{formatCurrency(paidAmount)}</span>
              <span className="text-slate-500 text-lg mx-2">/</span>
              <span className="text-white">{formatCurrency(totalAmount)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-emerald-400">{paidPct}%</p>
            <p className="text-xs text-slate-500">cobrado</p>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-700" style={{ width: `${paidPct}%` }} />
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-6 pb-6">
        {invoices.length === 0 ? (
          <div className="glass p-12 text-center text-slate-500">
            No hay hitos de facturación para este proyecto.
          </div>
        ) : (
          invoices.map((inv, idx) => {
            const StatusIcon = statusIcons[inv.status] || Clock;
            const label = milestoneLabels[idx] || `Hito ${idx + 1}`;
            const gradientColor = milestoneColors[idx] || milestoneColors[0];
            const isPaid = inv.status === 'PAID';

            return (
              <div key={inv.id} className="relative">
                {/* Timeline connector */}
                {idx < invoices.length - 1 && (
                  <div className="absolute left-8 top-[80px] w-0.5 h-[calc(100%)] bg-slate-700/50 z-0" />
                )}

                <div className={`glass p-6 relative z-10 border-l-4 ${isPaid ? 'border-l-emerald-500' : inv.status === 'CANCELLED' ? 'border-l-rose-500' : 'border-l-amber-500'} transition-all hover:bg-slate-800/30`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left — Milestone info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white">{label}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[inv.status] || statusColors.PENDING}`}>
                            <StatusIcon size={12} /> {inv.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate" title={inv.concept}>{inv.concept || '—'}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CreditCard size={12} /> Folio: <span className="text-cyan-400 font-mono">FAC-{String(inv.id).padStart(4, '0')}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> Vence: <span className="text-slate-300">{formatDate(inv.due_date)}</span>
                          </span>
                          {inv.paid_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-400"/> Pagado: <span className="text-emerald-300">{formatDate(inv.paid_at)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right — Amount and actions */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency(inv.amount)}</p>
                        <p className="text-xs text-slate-500">{totalAmount > 0 ? Math.round((inv.amount / totalAmount) * 100) : 0}% del total</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openEdit(inv)}
                          className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 p-2 rounded-lg border border-blue-400/30 transition-all"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 p-2 rounded-lg border border-red-400/30 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => { setEditModal(false); setEditingInv(null); }} title="Editar Hito">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cliente</label>
            <input value={editForm.customer_name} onChange={e => setEditForm({...editForm, customer_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Concepto</label>
            <input value={editForm.concept} onChange={e => setEditForm({...editForm, concept: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Monto</label>
              <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Estado</label>
              <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
          <button onClick={handleUpdate} className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-all mt-2">
            Actualizar Hito
          </button>
        </div>
      </Modal>
    </div>
  );
}
