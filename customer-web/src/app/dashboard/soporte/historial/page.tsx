'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, Filter, Ticket, Clock, CheckCircle2, Eye, X } from 'lucide-react';
import api from '@/services/api';

export default function HistorialSoporteView() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    fetchTickets(savedEmail);
  }, [router]);

  const fetchTickets = async (customerEmail: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/portal/tickets/${encodeURIComponent(customerEmail)}`);
      if (res.data) {
        setHistory(res.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-Side Search Filter (Subject, ID, Status)
  const filteredHistory = history.filter((tkt) => {
      const q = searchQuery.toLowerCase();
      const matchQuery = (
          tkt.subject.toLowerCase().includes(q) ||
          tkt.id.toLowerCase().includes(q) ||
          tkt.status.toLowerCase().includes(q) ||
          (tkt.description && tkt.description.toLowerCase().includes(q))
      );
      if (filterStatus && tkt.status !== filterStatus) return false;
      return matchQuery;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <Link href="/dashboard/soporte" className="text-indigo-500 hover:text-indigo-600 font-bold mb-6 inline-flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Volver al Centro de Resoluciones</Link>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-800 flex items-center gap-3">
             Bóveda de Historial
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Revisa y filtra todos tus registros y tickets pasados.</p>
        </div>
      </header>

      {/* Panel de Búsqueda y Tabla */}
      <div className="glass overflow-hidden shadow-xl shadow-slate-200/50">
        
        {/* Cabecera / Buscador */}
        <div className="p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full max-w-md">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
               <Search size={20} />
             </div>
             <input 
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Buscar por ID, Asunto, Etiqueta..." 
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium"
             />
           </div>
           <div className="relative">
             <select
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="flex items-center gap-2 pl-4 pr-10 py-3 bg-slate-50 text-slate-600 font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-100 focus:outline-none focus:border-indigo-400 transition-colors appearance-none cursor-pointer w-full md:w-auto"
             >
               <option value="">Todos los Estados</option>
               <option value="OPEN">Abiertos</option>
               <option value="IN_PROGRESS">En Proceso</option>
               <option value="CLOSED">Resueltos</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <Filter size={18} />
             </div>
           </div>
        </div>

        {/* Tabla Ancha Dinámica */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100 text-sm">
                <th className="p-6 font-bold text-slate-400 uppercase tracking-wider w-32">ID Ticket</th>
                <th className="p-6 font-bold text-slate-400 uppercase tracking-wider">Detalles de Consulta</th>
                <th className="p-6 font-bold text-slate-400 uppercase tracking-wider w-48">Fecha de Radicado</th>
                <th className="p-6 font-bold text-slate-400 uppercase tracking-wider w-40">Estado Actual</th>
                <th className="p-6 font-bold text-slate-400 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">Sincronizando bóveda...</td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-16 text-center text-slate-400">
                     <Ticket size={48} className="mx-auto mb-4 text-slate-200" />
                     <p className="text-lg font-medium text-slate-500">No se encontraron resultados.</p>
                     <p className="text-sm">Intenta buscar otra palabra o verifica si tienes tickets creados.</p>
                   </td>
                </tr>
              ) : (
                filteredHistory.map((tkt: any) => (
                  <tr key={tkt.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="p-6 font-mono font-bold text-indigo-400 text-sm">
                      #{tkt.id.split('-')[0]}
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-800 text-lg mb-1">{tkt.subject}</p>
                      <p className="text-slate-500 text-sm pr-12 line-clamp-1">{tkt.description}</p>
                      <div className="mt-3 inline-flex bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">
                         Resolución: {tkt.resolution || '—'}
                      </div>
                    </td>
                    <td className="p-6 text-slate-500 font-medium">
                      {new Date(tkt.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border-2 ${
                        tkt.status === 'OPEN' 
                        ? 'border-amber-200 text-amber-600 bg-amber-50' 
                        : tkt.status === 'IN_PROGRESS'
                        ? 'border-blue-200 text-blue-600 bg-blue-50'
                        : 'border-emerald-200 text-emerald-600 bg-emerald-50'
                      }`}>
                        {tkt.status === 'OPEN' ? <><Clock size={14} className="inline"/> Abierto</> : 
                         tkt.status === 'IN_PROGRESS' ? <><Clock size={14} className="inline animate-pulse"/> En Proceso</> :
                         <><CheckCircle2 size={14} className="inline"/> Resuelto</>}
                      </span>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => setSelectedTicket(tkt)}
                        className="text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2.5 rounded-xl transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Ver detalles"
                      >
                         <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></div>
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-indigo-500 tracking-wider">CONSECUTIVO</p>
                <h3 className="text-2xl font-black text-slate-800 font-mono">#{selectedTicket.id.split('-')[0]}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600 border border-slate-200 shadow-sm"
              >
                 <X size={24} />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Categoría / Asunto</p>
                 <p className="font-bold text-slate-800 text-lg">{selectedTicket.subject}</p>
               </div>
               
               <div className="bg-white border-2 border-slate-50 rounded-2xl p-6 shadow-sm">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Descripción Inicial</p>
                 <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
               </div>

               {selectedTicket.status !== 'OPEN' && (
                 <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-100/50 pb-4">
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Actuación del Especialista</p>
                        <p className="font-bold text-indigo-900 text-lg">{selectedTicket.assigned_to || 'Agente de Soporte'}</p>
                      </div>
                      <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                        selectedTicket.status === 'IN_PROGRESS' 
                        ? 'border-blue-200 text-blue-700 bg-blue-100' 
                        : 'border-emerald-200 text-emerald-700 bg-emerald-100'
                      }`}>
                        {selectedTicket.status === 'IN_PROGRESS' ? 'En Proceso' : 'Resuelto'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Resolución / Notas</p>
                      <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">{selectedTicket.resolution || 'El especialista se encuentra revisando tu caso...'}</p>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                 <Clock size={16} /> Registrado: {new Date(selectedTicket.created_at).toLocaleString()}
              </span>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
