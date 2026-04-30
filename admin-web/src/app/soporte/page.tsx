'use client';

import { useEffect, useState, useMemo } from 'react';
import { LifeBuoy, Search, Clock, CheckCircle, AlertCircle, MessageSquare, Send, X, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/mock-users';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

interface Ticket {
  id: string;
  customer_email: string;
  subject: string;
  description: string;
  status: string;
  resolution: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  OPEN: { label: 'Abierto', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: AlertCircle },
  IN_PROGRESS: { label: 'En Proceso', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: Clock },
  CLOSED: { label: 'Resuelto', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', icon: CheckCircle },
};

export default function SoporteAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:4000/portal/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.customer_email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.id && t.id.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }
    return result;
  }, [tickets, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  }), [tickets]);

  const handleRespond = async () => {
    if (!selectedTicket || !responseText.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`http://localhost:4000/portal/tickets/${selectedTicket.id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: responseText,
          assigned_to: currentUser?.name || 'Soporte'
        })
      });
      if (res.ok) {
        await fetchTickets();
        setSelectedTicket(null);
        setResponseText('');
      }
    } catch (err) {
      console.error(err);
      alert('Error al responder el ticket.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = async (ticketId: string) => {
    if (!window.confirm('¿Marcar este ticket como resuelto?')) return;
    try {
      const res = await fetch(`http://localhost:4000/portal/tickets/${ticketId}/close`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        await fetchTickets();
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <LifeBuoy className="text-indigo-400" size={32} />
            Centro de Soporte
          </h1>
          <p className="text-slate-400">Gestión de tickets enviados por los clientes del portal web</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setStatusFilter('')} className={cn("glass p-4 rounded-xl text-center transition-all border-2", !statusFilter ? 'border-indigo-500' : 'border-transparent hover:border-slate-600')}>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Total Tickets</p>
        </button>
        <button onClick={() => setStatusFilter('OPEN')} className={cn("glass p-4 rounded-xl text-center transition-all border-2", statusFilter === 'OPEN' ? 'border-amber-500' : 'border-transparent hover:border-slate-600')}>
          <p className="text-2xl font-bold text-amber-400">{stats.open}</p>
          <p className="text-xs text-slate-400">Abiertos</p>
        </button>
        <button onClick={() => setStatusFilter('IN_PROGRESS')} className={cn("glass p-4 rounded-xl text-center transition-all border-2", statusFilter === 'IN_PROGRESS' ? 'border-blue-500' : 'border-transparent hover:border-slate-600')}>
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-xs text-slate-400">En Proceso</p>
        </button>
        <button onClick={() => setStatusFilter('CLOSED')} className={cn("glass p-4 rounded-xl text-center transition-all border-2", statusFilter === 'CLOSED' ? 'border-emerald-500' : 'border-transparent hover:border-slate-600')}>
          <p className="text-2xl font-bold text-emerald-400">{stats.closed}</p>
          <p className="text-xs text-slate-400">Resueltos</p>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por correo, categoría o descripción..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center gap-2 pl-4 pr-10 py-2 bg-slate-900/50 text-slate-300 font-medium rounded-xl border border-slate-700/50 hover:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer w-full md:w-auto h-full"
          >
            <option value="">Todos los Estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="IN_PROGRESS">En Proceso</option>
            <option value="CLOSED">Resueltos</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Filter size={16} />
          </div>
        </div>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2">
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Tickets Table */}
      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">ID</th>
              <th className="p-4 font-medium text-slate-300">Cliente</th>
              <th className="p-4 font-medium text-slate-300">Categoría</th>
              <th className="p-4 font-medium text-slate-300">Fecha</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300">Asignado</th>
              <th className="p-4 font-medium text-slate-300 w-48">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">Cargando tickets...</td></tr>
            )}
            {!isLoading && filteredTickets.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">
                {searchQuery || statusFilter ? 'No se encontraron tickets.' : 'No hay tickets registrados.'}
              </td></tr>
            )}
            {!isLoading && filteredTickets.map(t => {
              const st = statusLabels[t.status] || statusLabels.OPEN;
              const StatusIcon = st.icon;
              return (
                <tr key={t.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <span className="text-xs text-slate-500 font-mono">{t.id.slice(0, 8)}...</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-300">{t.customer_email}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white font-medium">{t.subject}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", st.color)}>
                      <StatusIcon size={14} /> {st.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400">{t.assigned_to || '—'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedTicket(t); setResponseText(t.resolution || ''); }}
                        className="text-indigo-400 hover:text-indigo-300 bg-indigo-400/10 hover:bg-indigo-400/20 px-3 py-1.5 rounded-lg border border-indigo-400/30 transition-all flex items-center gap-1.5 text-sm font-medium opacity-0 group-hover:opacity-100"
                      >
                        <MessageSquare size={14} /> Ver
                      </button>
                      {t.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleClose(t.id)}
                          className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-lg border border-emerald-400/30 transition-all flex items-center gap-1.5 text-sm font-medium opacity-0 group-hover:opacity-100"
                        >
                          <CheckCircle size={14} /> Cerrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ticket Detail Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => { setSelectedTicket(null); setResponseText(''); }} title="Detalle del Ticket">
        {selectedTicket && (
          <div className="space-y-5">
            {/* Ticket Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">ID: {selectedTicket.id}</span>
                {(() => {
                  const st = statusLabels[selectedTicket.status] || statusLabels.OPEN;
                  const StatusIcon = st.icon;
                  return (
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", st.color)}>
                      <StatusIcon size={14} /> {st.label}
                    </span>
                  );
                })()}
              </div>

              <div className="glass p-4 rounded-xl space-y-2">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cliente</p>
                <p className="text-slate-200 font-medium">{selectedTicket.customer_email}</p>
              </div>

              <div className="glass p-4 rounded-xl space-y-2">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Categoría</p>
                <p className="text-white font-semibold">{selectedTicket.subject}</p>
              </div>

              <div className="glass p-4 rounded-xl space-y-2">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Descripción del Cliente</p>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
              </div>

              <div className="glass p-4 rounded-xl space-y-2">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Fecha de Creación</p>
                <p className="text-slate-300 flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>

              {selectedTicket.assigned_to && (
                <div className="glass p-4 rounded-xl space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Atendido por</p>
                  <p className="text-indigo-400 font-semibold">{selectedTicket.assigned_to}</p>
                </div>
              )}

              {selectedTicket.resolved_at && (
                <div className="glass p-4 rounded-xl space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Fecha de Resolución</p>
                  <p className="text-emerald-400">{new Date(selectedTicket.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Response Section */}
            {selectedTicket.status !== 'CLOSED' ? (
              <div className="space-y-3 border-t border-slate-700 pt-5">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Respuesta / Resolución
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  placeholder="Escribe la respuesta o resolución para el cliente..."
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleRespond}
                    disabled={isSending || !responseText.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> {isSending ? 'Enviando...' : 'Responder y Asignar'}
                  </button>
                  <button
                    onClick={() => handleClose(selectedTicket.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> Cerrar Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-700 pt-5">
                <div className="glass p-4 rounded-xl space-y-2 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Resolución Final</p>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.resolution || 'Sin nota de resolución.'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
