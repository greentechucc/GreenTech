'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, MessageSquare, Send, User } from 'lucide-react';
import api from '@/services/api';
import { getCurrentUser } from '@/lib/mock-users';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  OPEN: { label: 'Abierto', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: AlertCircle },
  IN_PROGRESS: { label: 'En Proceso', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: Clock },
  CLOSED: { label: 'Resuelto', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', icon: CheckCircle },
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const currentUser = getCurrentUser();

  const ticketId = params.id as string;

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/portal/tickets`);
      const t = res.data.find((item: any) => String(item.id) === ticketId);
      if (t) setTicket(t);
    } catch (err) {
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!ticket || !responseText.trim() || !currentUser) return;
    setIsSending(true);
    try {
      // Usar la resolución como un campo de comentario por ahora. 
      // En un sistema real esto añadiría a un arreglo de threads.
      await api.put(`/portal/tickets/${ticket.id}/respond`, {
        resolution: (ticket.resolution ? ticket.resolution + '\n\n---\n\n' : '') + responseText,
        assigned_to: currentUser.name
      });
      await fetchTicket();
      setResponseText('');
    } catch (err) {
      console.error(err);
      alert('Error al responder el ticket.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('¿Marcar este ticket como resuelto?')) return;
    try {
      await api.put(`/portal/tickets/${ticketId}/close`);
      await fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando detalles del ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Ticket no encontrado.</p>
        <button onClick={() => router.push('/soporte')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Soporte
        </button>
      </div>
    );
  }

  const st = statusLabels[ticket.status] || statusLabels.OPEN;
  const StatusIcon = st.icon;

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-5xl mx-auto">
      <header className="mb-6">
        <button onClick={() => router.push('/soporte')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a Lista de Tickets
        </button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-tight">{ticket.subject}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              Ticket ID: <span className="font-mono text-slate-300">{ticket.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
             <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border", st.color)}>
                <StatusIcon size={16} /> {st.label}
             </span>
             {ticket.status !== 'CLOSED' && (
                <button onClick={handleClose} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-1.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all text-sm">
                    <CheckCircle size={16} /> Resolver Ticket
                </button>
             )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              {/* Main Ticket Body */}
              <div className="glass p-6">
                  <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <User size={20} />
                      </div>
                      <div className="flex-1">
                          <div className="flex items-baseline justify-between mb-1">
                              <p className="font-semibold text-slate-200">{ticket.customer_email}</p>
                              <span className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-indigo-400 mb-3 font-medium uppercase tracking-wider">Apertura de Ticket</p>
                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                              {ticket.description}
                          </div>
                      </div>
                  </div>

                  {ticket.resolution && (
                      <div className="flex items-start gap-4 mb-6 relative">
                          <div className="absolute top-0 left-[19px] bottom-0 w-0.5 bg-slate-800 -z-10 -mt-6"></div>
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
                              <MessageSquare size={18} />
                          </div>
                          <div className="flex-1">
                              <div className="flex items-baseline justify-between mb-1">
                                  <p className="font-semibold text-slate-200">{ticket.assigned_to || 'Soporte GreenTech'}</p>
                                  {ticket.resolved_at && <span className="text-xs text-emerald-500 ml-2">(Resuelto: {new Date(ticket.resolved_at).toLocaleString()})</span>}
                              </div>
                              <p className="text-xs text-emerald-400 mb-3 font-medium uppercase tracking-wider">Historial de Resolución</p>
                              <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20 text-indigo-100 whitespace-pre-wrap leading-relaxed">
                                  {ticket.resolution}
                              </div>
                          </div>
                      </div>
                  )}

                  {ticket.status !== 'CLOSED' && (
                      <div className="mt-8 pt-6 border-t border-slate-700/50">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Agregar Respuesta</h3>
                          <textarea
                              rows={4}
                              value={responseText}
                              onChange={e => setResponseText(e.target.value)}
                              className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner font-medium"
                              placeholder="Escribe un mensaje para el cliente o actualiza la nota de resolución..."
                          />
                          <div className="flex justify-end mt-3">
                              <button
                                  onClick={handleRespond}
                                  disabled={isSending || !responseText.trim()}
                                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                              >
                                  <Send size={16} /> {isSending ? 'Guardando...' : 'Enviar Respuesta'}
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div className="space-y-6">
              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">
                       Información del Caso
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <p className="text-xs text-slate-500 mb-1">Cliente</p>
                          <p className="text-sm font-medium text-slate-300 break-all">{ticket.customer_email}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 mb-1">Agente Asignado</p>
                          <p className="text-sm font-medium text-indigo-400">{ticket.assigned_to || 'Sin Asignar'}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 mb-1">Tiempo Abierto</p>
                          <p className="text-sm text-slate-300">
                             {ticket.resolved_at ? 
                                'Cerrado' : 
                                `${Math.floor((new Date().getTime() - new Date(ticket.created_at).getTime()) / (1000 * 3600 * 24))} días`
                             }
                          </p>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
                   <h3 className="text-sm font-bold text-slate-400 mb-2">Protocolo de Atención</h3>
                   <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                       <li>Responder dentro de las primeras <strong className="text-slate-400">24 horas</strong>.</li>
                       <li>Priorizar tickets reportados desde plantas solares activas.</li>
                       <li>Si un problema involucra garantía de inversor, escalar con el fabricante antes de cerrar el ticket.</li>
                   </ul>
              </div>
          </div>
      </div>
    </div>
  );
}
