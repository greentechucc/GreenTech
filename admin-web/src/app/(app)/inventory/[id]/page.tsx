'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Box, Package, AlertTriangle, RefreshCw, BarChart2, CheckCircle2, TrendingUp, TrendingDown, Clock, Hash } from 'lucide-react';
import api from '@/services/api';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const itemId = params.id as string;

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/quotation/inventory`);
      const found = res.data.find((i: any) => String(i.id) === itemId);
      if (found) setItem(found);
    } catch (err) {
      console.error('Error loading inventory item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando ficha de material...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Material no encontrado en bodega.</p>
        <button onClick={() => router.push('/inventory')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Inventario
        </button>
      </div>
    );
  }

  const isLowStock = item.stock <= item.min_stock;

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push('/inventory')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={16} /> Volver a Bodega
          </button>
          <div className="flex items-start gap-4 mt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 shadow-xl border border-slate-600">
               <Package size={32} className={isLowStock ? 'text-amber-400' : 'text-emerald-400'} />
            </div>
            <div>
              <h1 className="text-3xl font-light tracking-tight">{item.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700 font-mono tracking-wider flex items-center gap-1">
                      <Hash size={12}/> {item.sku}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                      {item.category}
                  </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
             <span className={`px-4 py-2 rounded-xl text-sm font-bold border uppercase tracking-wider flex items-center gap-2 ${
                    item.status === 'AVAILABLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    item.status === 'UNAVAILABLE' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                    'bg-slate-500/10 border-slate-500/30 text-slate-400'
                  }`}>
                {item.status === 'AVAILABLE' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {item.status === 'AVAILABLE' ? 'Disponible para Venta' : item.status === 'UNAVAILABLE' ? 'Sin Disponibilidad' : 'Descontinuado'}
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`glass p-6 md:col-span-2 relative overflow-hidden ${isLowStock ? 'border-amber-500/30' : ''}`}>
              {isLowStock && <div className="absolute top-0 right-0 p-4"><AlertTriangle className="text-amber-500/20" size={100}/></div>}
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Box size={16} /> Estado de Bodega
              </h3>
              <div className="flex items-end gap-4 mb-2">
                  <span className={`text-6xl font-black ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>{item.stock}</span>
                  <span className="text-xl text-slate-500 mb-2">{item.unit} físicos</span>
              </div>
              
              <div className="w-full h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                  <div className={`h-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, (item.stock / (item.min_stock * 3)) * 100)}%`}}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium">
                  <span className="text-rose-400">0</span>
                  <span className="text-amber-500/80 line-clamp-1 border-l border-amber-500/50 pl-1">Min: {item.min_stock}</span>
                  <span className="text-emerald-500/80 text-right">Ideal: {item.min_stock * 3}+</span>
              </div>

              {isLowStock && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400 text-sm flex items-start gap-2">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      <p>El nivel actual de stock está por debajo del umbral mínimo de seguridad. Se recomienda emitir una Orden de Compra urgente al proveedor.</p>
                  </div>
              )}
          </div>

          <div className="glass p-6 flex flex-col justify-between">
              <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Valor Lote Actual</h3>
                  <p className="text-3xl font-bold text-emerald-400">{formatCOP(item.stock * item.unit_price)}</p>
                  <p className="text-sm text-slate-500 mt-1">Precio Unit.: {formatCOP(item.unit_price)}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500">Categoría Logística</p>
                  <p className="font-medium text-slate-300">{item.category}</p>
              </div>
          </div>
      </div>

      <div className="glass p-6 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-700/50 pb-2 flex items-center gap-2">
               <BarChart2 size={16} /> Simulador de Movimientos Recientes (Kardex)
          </h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                          <TrendingDown size={20} />
                      </div>
                      <div>
                          <p className="text-slate-200 font-medium">Salida para Proyecto PRJ-0021</p>
                          <p className="text-xs text-slate-500">Hace 2 días • Despachado por: Ana L.</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-rose-400 font-bold text-lg">- 24 {item.unit}</p>
                      <p className="text-xs text-slate-500">Stock resultante: {item.stock}</p>
                  </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                          <TrendingUp size={20} />
                      </div>
                      <div>
                          <p className="text-slate-200 font-medium">Ingreso Lote de Proveedor #8829</p>
                          <p className="text-xs text-slate-500">Hace 15 días • Ingresado por: Carlos P.</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-emerald-400 font-bold text-lg">+ 100 {item.unit}</p>
                      <p className="text-xs text-slate-500">Stock resultante: {item.stock + 24}</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
