'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, CheckCircle, Package, Battery, Zap, DollarSign, Calendar, Sun } from 'lucide-react';
import api from '@/services/api';

const statusColors: Record<string, string> = {
  'DRAFT': 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  'CALCULATED': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'GENERATED': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'SENT': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'ACCEPTED': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'REJECTED': 'text-rose-400 bg-rose-500/10 border-rose-500/30'
};

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const quotationId = params.id as string;

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      const res = await api.get(`/quotation/quotation`);
      const q = res.data.find((item: any) => String(item.id) === quotationId);
      if (q) setQuotation(q);
    } catch (err) {
      console.error('Error loading quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Generando factura proforma...</div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Cotización no encontrada.</p>
        <button onClick={() => router.push('/quotations')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Cotizaciones
        </button>
      </div>
    );
  }

  let bom: any[] = [];
  try {
      if (quotation.bom_json) bom = JSON.parse(quotation.bom_json);
  } catch {}

  let financiamiento: any = null;
  try {
      if(quotation.financing_options) financiamiento = JSON.parse(quotation.financing_options);
  } catch {}

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push('/quotations')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={16} /> Volver a Cotizaciones
          </button>
          <div className="flex items-center gap-3">
             <FileText className="text-emerald-400" size={28} />
             <h1 className="text-3xl font-light tracking-tight">Propuesta Comercial</h1>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700 font-mono">
              COT-[ {String(quotation.id).padStart(4, '0')} ]
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="glass p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-500"><Sun size={120} /></div>
                  <h2 className="text-xl font-bold border-b border-emerald-500/30 pb-2 mb-6">Detalle de Ingeniería Comercial</h2>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cliente / Prospecto</p>
                          <p className="text-lg font-medium text-slate-200">{quotation.customer_name}</p>
                          <p className="text-sm text-slate-400">{quotation.customer_email || 'Sin correo asociado'}</p>
                      </div>
                      <div className="px-4 border-l border-slate-700">
                           <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estado del Documento</p>
                           <span className={`px-3 py-1 mt-1 inline-block rounded font-bold uppercase tracking-wider text-xs border ${statusColors[quotation.status] || 'text-slate-400'}`}>
                                {quotation.status}
                           </span>
                      </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 grid grid-cols-3 gap-4 mb-8">
                       <div className="text-center border-r border-slate-700">
                           <Zap className="mx-auto text-amber-400 mb-2 opacity-80" size={20} />
                           <p className="text-xs text-slate-500">Capacidad (kWp)</p>
                           <p className="font-bold text-slate-200">{quotation.system_size_kwp?.toFixed(2)} kWp</p>
                       </div>
                       <div className="text-center border-r border-slate-700">
                           <Package className="mx-auto text-cyan-400 mb-2 opacity-80" size={20} />
                           <p className="text-xs text-slate-500">Paneles</p>
                           <p className="font-bold text-slate-200">{quotation.panel_count} Módulos</p>
                       </div>
                       <div className="text-center">
                           <Calendar className="mx-auto text-emerald-400 mb-2 opacity-80" size={20} />
                           <p className="text-xs text-slate-500">Retorno Inv.</p>
                           <p className="font-bold text-slate-200">{quotation.roi_years} Años</p>
                       </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 pb-2 mb-4">Lista de Materiales Oficial</h3>
                  <div className="space-y-1">
                      {bom.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800 text-sm hover:bg-slate-800/30 px-2 rounded transition-colors">
                              <div className="w-2/3 pr-4">
                                  <p className="text-slate-200 font-medium">{item.name}</p>
                                  <p className="text-xs text-emerald-500/70 font-mono">SKU: {item.sku}</p>
                              </div>
                              <div className="w-16 text-center text-slate-400">{item.quantity} {item.unit}</div>
                              <div className="w-1/6 text-right font-medium text-emerald-400">{formatCOP(item.subtotal)}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                      <DollarSign size={16} /> Resumen Financiero
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-slate-300 text-sm">
                          <span>Subtotal de Materiales</span>
                          <span>{formatCOP((quotation.total_price || 0) * 0.8)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 text-sm">
                          <span>Ingeniería y Mano Obra</span>
                          <span>{formatCOP((quotation.total_price || 0) * 0.2)}</span>
                      </div>
                      {quotation.discount_applied > 0 && (
                          <div className="flex justify-between text-rose-400 font-medium text-sm">
                              <span>Descuento Comercial</span>
                              <span>- {formatCOP(quotation.discount_applied)}</span>
                          </div>
                      )}
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4 flex flex-col items-end">
                      <span className="text-xs text-slate-500 mb-1">Total Inversión Bruta (COP)</span>
                      <span className="text-3xl font-black text-emerald-400">{formatCOP(quotation.total_price || 0)}</span>
                  </div>
              </div>

              {financiamiento && (
              <div className="glass p-6 bg-gradient-to-br from-slate-900 to-indigo-900/20">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 text-indigo-300">
                      Opciones de Financiamiento
                  </h3>
                  <div className="space-y-4">
                      <div className="bg-slate-900/50 border border-indigo-500/30 p-3 rounded-lg">
                          <p className="text-xs text-indigo-300 mb-1">Crédito Directo (5 años)</p>
                          <p className="text-xl font-bold">{formatCOP(financiamiento.credito_5_anios_mensual)} <span className="text-xs font-normal text-slate-400">/ mes</span></p>
                      </div>
                      <div className="bg-slate-900/50 border border-indigo-500/30 p-3 rounded-lg">
                          <p className="text-xs text-indigo-300 mb-1">Leasing Operativo (10 años)</p>
                          <p className="text-xl font-bold">{formatCOP(financiamiento.leasing_10_anios_mensual)} <span className="text-xs font-normal text-slate-400">/ mes</span></p>
                      </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-tight">Sujeto a aprobación de crédito. Tasas de referencia simuladas al 1.5% MV.</p>
              </div>
              )}
          </div>
      </div>
    </div>
  );
}
