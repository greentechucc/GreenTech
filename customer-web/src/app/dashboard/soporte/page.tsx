'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, CheckCircle2, Ticket, ArrowRight, LifeBuoy } from 'lucide-react';
import api from '@/services/api';

export default function SoporteView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage || !ticketSubject || !email) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/portal/tickets', {
        customer_email: email,
        subject: ticketSubject,
        description: ticketMessage
      });
      setTicketSuccess(true);
      setTicketMessage('');
      setTicketSubject('');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Hubo un error al enviar el ticket. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
             <LifeBuoy className="text-indigo-500" size={32} />
             Centro de Resoluciones
          </h1>
          <p className="text-slate-500 mt-1">Radica tus solicitudes y nos comunicaremos contigo de inmediato.</p>
        </div>
        
        <Link href="/dashboard/soporte/historial" className="group flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-300 shadow-sm px-6 py-3 rounded-2xl transition-all hover:shadow-indigo-500/10">
           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <Ticket size={20} />
           </div>
           <div>
             <span className="block font-bold text-slate-800 text-sm">Explorar Historial</span>
             <span className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
               Ir a la bóveda <ArrowRight size={12} />
             </span>
           </div>
        </Link>
      </header>

      {/* Formulario de Creación Monolítico */}
      <div className="glass p-6 md:p-10 flex flex-col justify-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

        {!ticketSuccess ? (
          <form onSubmit={handleSendTicket} className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-white shadow-xl shadow-indigo-500/10 flex items-center justify-center rounded-2xl text-indigo-500 mb-4 transform -rotate-3">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Radicar Nuevo Caso</h2>
              <p className="text-slate-500 mt-2">Por favor especifica los detalles de tu problema para poder ubicarte con el analista experto indicado.</p>
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">¿En qué categoría cae tu consulta?</label>
                <div className="relative">
                  <select 
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-lg cursor-pointer"
                  >
                    <option value="" disabled>Seleccionar una opción...</option>
                    <option value="Facturación (Cobros)">Dudas con mi factura</option>
                    <option value="Técnico (Inversor/Paneles)">Problema técnico (Inversor/Paneles)</option>
                    <option value="Comercial (Contrato/Plan)">Administración (Cambios de plan, titular)</option>
                    <option value="Asesoría Adicional">Otra clase de asesoría</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Cuéntanos más al respecto</label>
                <textarea 
                  required
                  rows={6}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-base leading-relaxed"
                  placeholder="Ej: Hola, acabo de notar una alerta amarilla en mi inversor desde ayer a las 3:00 PM. Quisiera asegurar que sigue conectado correctamente..."
                ></textarea>
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-lg group">
              {isSubmitting ? 'Encriptando y Validando...' : 'Enviar Solicitud'}
              {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">Al emitir, un número único de serie te será asignado en tu bóveda.</p>
          </form>
        ) : (
          <div className="text-center py-16 px-4 fade-in max-w-xl mx-auto relative z-10">
            <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-500/20">
              <CheckCircle2 size={64} className="animate-bounce" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">¡Misión Cumplida!</h3>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">Tu señal de alerta fue recibida y se ha encriptado de forma segura al Departamento Técnico. Se te contactará en un rango no mayor a 24h hábiles.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setTicketSuccess(false)} 
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl transition-all"
              >
                Volver
              </button>
              <Link 
                href="/dashboard/soporte/historial" 
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl flex justify-center items-center gap-2"
              >
                Ir a mi Bóveda <Ticket size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
