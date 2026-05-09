'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, Package, AlertTriangle, Box, RefreshCw, Edit, Trash2, X, DollarSign } from 'lucide-react';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{id: number, name: string} | null>(null);
  const [form, setForm] = useState<{sku: string, name: string, category: string, stock: string, min_stock: string, unit: string, unit_price: string, status?: string, id?: number}>({ sku: '', name: '', category: '', stock: '', min_stock: '', unit: 'und', unit_price: '', status: 'AVAILABLE' });
  const [stockForm, setStockForm] = useState({ quantity: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = () => {
    api.get('/quotation/inventory')
      .then(res => setItems(res.data))
      .catch(() => setItems([]));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!form.sku || !form.name || !form.category) return;
    setLoading(true);
    try {
      if (form.id) {
          await api.put(`/quotation/inventory/${form.id}`, {
            sku: form.sku, name: form.name, category: form.category,
            stock: Number(form.stock) || 0, min_stock: Number(form.min_stock) || 0,
            unit: form.unit, unit_price: Number(form.unit_price) || 0,
            status: form.status
          });
      } else {
          await api.post('/quotation/inventory', {
            sku: form.sku, name: form.name, category: form.category,
            stock: Number(form.stock) || 0, min_stock: Number(form.min_stock) || 0,
            unit: form.unit, unit_price: Number(form.unit_price) || 0,
            status: 'AVAILABLE'
          });
      }
      setForm({ sku: '', name: '', category: '', stock: '', min_stock: '', unit: 'und', unit_price: '', status: 'AVAILABLE' });
      setShowModal(false);
      fetchData();
    } catch (e) {
      console.error('Error guardando ítem:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Está seguro de eliminar este artículo?")) return;
    try {
        await api.delete(`/quotation/inventory/${id}`);
        fetchData();
    } catch(e) { console.error(e) }
  };

  const handleAddStock = async () => {
    if (!selectedItem || !stockForm.quantity) return;
    setLoading(true);
    try {
      await api.patch(`/quotation/inventory/${selectedItem.id}/stock`, {
        quantity: Number(stockForm.quantity)
      });
      setStockForm({ quantity: '' });
      setSelectedItem(null);
      setShowStockModal(false);
      fetchData();
    } catch (e) {
      console.error('Error actualizando stock:', e);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = items.filter(i => i.stock <= i.min_stock);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map(i => i.category).filter(Boolean)));
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(i => (i.status || 'AVAILABLE') === statusFilter);
    }
    if (categoryFilter) {
      result = result.filter(i => i.category === categoryFilter);
    }
    return result;
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const totalValue = useMemo(() => items.reduce((sum, i) => sum + (i.unit_price * i.stock), 0), [items]);

  const uniqueStatuses = ['AVAILABLE', 'UNAVAILABLE', 'DISCONTINUED'];

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Inventario Solar</h1>
          <p className="text-slate-400">Control de stock de paneles, inversores, estructuras y material eléctrico</p>
        </div>
        <button onClick={() => { setForm({ sku: '', name: '', category: '', stock: '', min_stock: '', unit: 'und', unit_price: '' }); setShowModal(true); }} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Nuevo Material
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Productos</p>
              <h3 className="text-2xl font-bold mt-1">{items.length}</h3>
              <p className="text-xs text-slate-500 mt-1">{categories.length} categorías</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Box size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Unidades Totales</p>
              <h3 className="text-2xl font-bold mt-1">{items.reduce((s, i) => s + i.stock, 0).toLocaleString('es-CO')}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Package size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Valor del Inventario</p>
              <h3 className="text-lg font-bold mt-1 text-emerald-400">{formatCOP(totalValue)}</h3>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400"><DollarSign size={22}/></div>
          </div>
        </div>
        <div className={`glass p-5 hover:-translate-y-1 transition-transform relative overflow-hidden`}>
          {lowStockItems.length > 0 && <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>}
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Bajo Stock</p>
              <h3 className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{lowStockItems.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Requieren reorden</p>
            </div>
            <div className={`p-3 rounded-xl ${lowStockItems.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <AlertTriangle size={22}/>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o categoría..." 
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={() => setCategoryFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!categoryFilter ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
            Todos
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${categoryFilter === cat ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${statusFilter ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 hover:bg-slate-800'}`}>
            <Filter size={18} /> Estado {statusFilter && '•'}
          </button>
          {showFilters && (
            <div className="absolute top-12 right-0 z-50 glass p-3 rounded-xl min-w-[200px] space-y-2 shadow-2xl border border-slate-700">
              <button onClick={() => { setStatusFilter(''); setShowFilters(false); }} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${!statusFilter ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                Todos
              </button>
              {uniqueStatuses.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setShowFilters(false); }} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${statusFilter === s ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                  {s === 'AVAILABLE' ? '✅ Disponible' : s === 'UNAVAILABLE' ? '❌ No Disponible' : '🚫 Descontinuado'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(searchQuery || statusFilter || categoryFilter) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Mostrando {filteredItems.length} de {items.length} productos</span>
          <button onClick={() => { setSearchQuery(''); setStatusFilter(''); setCategoryFilter(''); }} className="text-emerald-400 hover:text-emerald-300 underline ml-2">
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">Material</th>
              <th className="p-4 font-medium text-slate-300">SKU</th>
              <th className="p-4 font-medium text-slate-300">Categoría</th>
              <th className="p-4 font-medium text-slate-300">Stock</th>
              <th className="p-4 font-medium text-slate-300">Precio Unit. (COP)</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300 w-36">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">
                {searchQuery || statusFilter || categoryFilter ? 'No se encontraron resultados.' : 'No hay material en inventario. Registra el primero.'}
              </td></tr>
            )}
            {filteredItems.map((i: any) => (
              <tr key={i.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 font-medium">{i.name}</td>
                <td className="p-4 font-mono text-sm text-cyan-400">{i.sku}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">{i.category}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-lg ${i.stock <= i.min_stock ? 'text-amber-400' : 'text-white'}`}>{i.stock}</span>
                    <span className="text-slate-500 text-sm">{i.unit}</span>
                    {i.stock <= i.min_stock && (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold flex items-center gap-1"><AlertTriangle size={10}/> BAJO</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-semibold text-emerald-400">{formatCOP(i.unit_price || 0)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    i.status === 'AVAILABLE' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                    i.status === 'UNAVAILABLE' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' :
                    'bg-slate-500/10 border border-slate-500/30 text-slate-400'
                  }`}>
                    {i.status === 'AVAILABLE' ? 'Disponible' : i.status === 'UNAVAILABLE' ? 'No Disp.' : 'Descontinuado'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setSelectedItem(i); setShowStockModal(true); }} className="text-slate-400 hover:text-cyan-400 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 transition-all" title="Ajustar Stock">
                      <RefreshCw size={14} />
                    </button>
                    <button onClick={() => {
                        setForm({
                            id: i.id, sku: i.sku, name: i.name, category: i.category,
                            stock: String(i.stock), min_stock: String(i.min_stock),
                            unit: i.unit, unit_price: String(i.unit_price), status: i.status || 'AVAILABLE'
                        });
                        setShowModal(true);
                    }} className="text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 transition-all" title="Editar">
                        <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(i.id)} className="text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 transition-all" title="Eliminar">
                        <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT MODAL */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm({ sku: '', name: '', category: '', stock: '', min_stock: '', unit: 'und', unit_price: '' }); }} title={form.id ? 'Editar Material' : 'Nuevo Material'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">SKU *</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: PAN-550W-JA" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Categoría *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="">Seleccionar...</option>
                <option value="Paneles Solares">Paneles Solares</option>
                <option value="Inversores">Inversores</option>
                <option value="Estructuras">Estructuras</option>
                <option value="Cableado y Eléctrico">Cableado y Eléctrico</option>
                <option value="Monitoreo">Monitoreo</option>
                <option value="Baterías">Baterías</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre y Modelo *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Panel Solar JA Solar 550W Monocristalino" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stock Inicial</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stock Mínimo</label>
              <input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Unidad</label>
              <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="und" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Precio Unitario (COP)</label>
              <input type="number" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="0" />
            </div>
            {form.id && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="AVAILABLE">Disponible</option>
                <option value="UNAVAILABLE">No Disponible</option>
                <option value="DISCONTINUED">Descontinuado</option>
              </select>
            </div>
            )}
          </div>
          <button onClick={handleCreateOrUpdate} disabled={loading || !form.sku || !form.name || !form.category} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Guardando...' : form.id ? 'Actualizar Material' : 'Crear Material'}
          </button>
        </div>
      </Modal>

      {/* UPDATE STOCK MODAL */}
      <Modal isOpen={showStockModal} onClose={() => { setShowStockModal(false); setSelectedItem(null); setStockForm({quantity: ''}); }} title="Registrar Entrada/Salida">
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
            <h4 className="font-medium text-slate-200">{selectedItem?.name}</h4>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cantidad a Ajustar</label>
            <p className="text-xs text-slate-500 mb-2">Usa números positivos para entradas (+10) o negativos para salidas (-5).</p>
            <input type="number" value={stockForm.quantity} onChange={e => setStockForm({quantity: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: 50" />
          </div>
          <button onClick={handleAddStock} disabled={loading || !stockForm.quantity} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2">
            <RefreshCw size={18} /> {loading ? 'Actualizando...' : 'Actualizar Inventario'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
