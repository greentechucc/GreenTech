'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, FileText, CreditCard, CheckCircle2, Zap, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

export default function PagosDetalleView() {
  const router = useRouter();
  const params = useParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    fetchData(savedEmail);
  }, [router]);

  const fetchData = async (email: string) => {
    try {
      const res = await api.get(`/portal/dashboard/${encodeURIComponent(email)}`);
      if (res.data) {
         const data = res.data;
         const currentProjectId = Number(params.id);
         
         if (data.projects) {
           const found = data.projects.find((p: any) => p.id === currentProjectId);
           if (found) setProject(found);
         }
         
         if (data.invoices && data.invoices.length > 0) {
            // Filter invoices strictly for this project
            // Nota: Si el backend no envía project_id de forma consistente, se asocian temporalmente al proyecto de la vista o se usa el id simulado.
            // Para el demo usaremos todos los devueltos o filtraremos si tienen project_id
            const projectInvoices = data.invoices.filter((i: any) => i.project_id === currentProjectId || typeof i.project_id === 'undefined');
            setInvoices(projectInvoices);
         } else {
            setInvoices([]);
         }
      }
    } catch (e) {
      console.error('Error fetching invoices data:', e);
    } finally {
      setLoading(false);
    }
  };

  const openPayment = (inv: any) => {
    setSelectedInvoice(inv);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaymentProcessing(true);
    
    try {
      await api.post(`/billing/billing/${selectedInvoice.id}/pay`, {
        amount: selectedInvoice.amount,
        method: 'CREDIT_CARD',
        transactionId: `TX_${Date.now()}`
      });
      setPaymentSuccess(true);
      setInvoices(invoices.map(i => i.id === selectedInvoice.id ? {...i, status: 'PAID'} : i));
    } catch (err) {
      console.error(err);
      alert('Hubo un error al procesar el pago');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const downloadReceipt = (inv: any) => {
    // Generate simulated text receipt
    const content = `=============================\nCOMPROBANTE DE PAGO\n=============================\nServicio: GreenTech Solar\nCliente: ${localStorage.getItem('customer_name') || 'N/A'}\nProyecto ID: #${project?.id || 'N/A'}\nConcepto: ${inv.concept}\nMonto Pagado: $${inv.amount.toLocaleString('en-US')} COP\nFecha: ${new Date().toLocaleDateString()}\nEstado: Aprobado (PAID)\nID Transacción: TX_${Math.floor(Math.random() * 1000000)}\n=============================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo_${inv.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSuccessfulAccept = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  if (loading) return <div className="flex justify-center items-center h-64 mt-12 text-emerald-500">Cargando desglose contable...</div>;
  if (!project) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
       <h2 className="text-xl font-bold text-slate-800">Cuentas no halladas</h2>
       <p className="text-slate-500 mt-2 mb-4">No pudimos asociar el proyecto a un folio contable.</p>
       <Link href="/dashboard/pagos" className="text-emerald-500 hover:text-emerald-600 font-semibold flex items-center gap-2"><ArrowLeft size={16}/> Volver a mis facturas</Link>
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 fade-in w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/pagos" className="text-emerald-500 hover:text-emerald-600 font-semibold mb-4 inline-flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Retornar al grupo de facturas</Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
             <Building2 className="text-emerald-500" />
             Consolidado del Proyecto
          </h1>
          <p className="text-slate-500 mt-1">Facturas detalladas de {project.name || `Proyecto #${project.id}`}.</p>
        </div>
      </header>

      {/* Facturación y Documentos */}
      <div className="glass p-4 sm:p-6 overflow-hidden">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FileText className="text-slate-600"/> Documentos Contables</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                <th className="p-4 font-medium text-slate-500 font-semibold rounded-tl-lg">Concepto</th>
                <th className="p-4 font-medium text-slate-500 font-semibold">Monto</th>
                <th className="p-4 font-medium text-slate-500 font-semibold">Vencimiento</th>
                <th className="p-4 font-medium text-slate-500 font-semibold">Estado</th>
                <th className="p-4 font-medium text-slate-500 font-semibold rounded-tr-lg">Acción</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay facturas registradas para este proyecto en específico.</td></tr>
              )}
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">{inv.concept}</td>
                  <td className="p-4 font-semibold text-slate-800">${parseFloat(inv.amount).toLocaleString('en-US')}</td>
                  <td className="p-4 text-slate-500 text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {inv.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="p-4">
                    {inv.status === 'PENDING' ? (
                      <button onClick={() => openPayment(inv)} className="flex items-center gap-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer shadow-sm">
                        <CreditCard size={14} /> Pagar Ahora
                      </button>
                    ) : (
                      <button onClick={() => downloadReceipt(inv)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
                        <Download size={16} /> Ver Recibo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
               <div className="relative z-10 flex items-center gap-2">
                 <CreditCard size={24} className="text-emerald-400" />
                 <span className="font-bold text-lg">Pasarela Segura</span>
               </div>
               <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white relative z-10">✕</button>
            </div>

            <div className="p-6 md:p-8">
              {!paymentSuccess ? (
                <>
                  <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{selectedInvoice.concept}</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-1">${parseFloat(selectedInvoice.amount).toLocaleString('en-US')}</h3>
                    </div>
                  </div>

                  <form onSubmit={processPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número de Tarjeta</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono tracking-widest"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        defaultValue="4111 1111 1111 1111"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                          placeholder="MM/AA"
                          defaultValue="12/28"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVC/CVV</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                          placeholder="123"
                          maxLength={4}
                          defaultValue="123"
                        />
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex gap-3">
                      <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors">
                        Cancelar
                      </button>
                      <button disabled={paymentProcessing} type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2">
                        {paymentProcessing ? 'Procesando...' : <><Zap size={18}/> Pagar Factura</>}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Pago Exitoso!</h3>
                  <p className="text-slate-500 mb-8">El pago de ${parseFloat(selectedInvoice.amount).toLocaleString('en-US')} se ha procesado correctamente. Oprimir el botón de recibo guardará el documento localmente.</p>
                  <div className="flex gap-3">
                    <button onClick={handleSuccessfulAccept} className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all hover:bg-slate-50">
                      Cerrar Vista
                    </button>
                    <button onClick={() => { downloadReceipt(selectedInvoice); handleSuccessfulAccept(); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                       <Download size={18} /> Obtener Recibo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
