'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, FileText, DollarSign, ArrowUpRight, FolderPlus, Edit, Trash2, X, Package, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

interface BomLine {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ customer_name: '', customer_email: '', consumo: '', status: 'DRAFT' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBom, setExpandedBom] = useState<number | null>(null);
  const router = useRouter();

  const statusColors: Record<string, string> = {
    'DRAFT': 'text-slate-400', 'CALCULATED': 'text-cyan-400',
    'GENERATED': 'text-blue-400', 'SENT': 'text-indigo-400',
    'ACCEPTED': 'text-emerald-400', 'REJECTED': 'text-rose-400'
  };

  const fetchData = () => {
    api.get('/quotation/quotation')
      .then(res => setQuotations(res.data))
      .catch(() => setQuotations([]));
  };

  useEffect(() => { 
    fetchData(); 
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const customer = params.get('customer_name');
      const email = params.get('customer_email');
      const consumo = params.get('consumo');
      if (customer) {
        setForm({ customer_name: customer, customer_email: email || '', consumo: consumo || '', status: 'DRAFT' });
        setShowModal(true);
        // Limpiar URL inmediatamente para evitar re-triggers
        window.history.replaceState({}, '', '/quotations');
      }
    }
  }, []);

  const filteredQuotations = useMemo(() => {
    let result = quotations;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = quotations.filter(qt =>
        qt.customer_name?.toLowerCase().includes(q) ||
        String(qt.id).includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(qt => qt.status === statusFilter);
    }
    return result;
  }, [quotations, searchQuery, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(quotations.map(q => q.status).filter(Boolean)));
  }, [quotations]);

  const handleCrearProyecto = async (q: any) => {
    try {
      await api.put(`/quotation/quotation/${q.id}`, { status: 'ACCEPTED' });
      fetchData();
      const bomParam = encodeURIComponent(q.bom_json || '');
      router.push(`/projects?customer_name=${encodeURIComponent(q.customer_name)}&customer_email=${encodeURIComponent(q.customer_email || '')}&system_size=${encodeURIComponent(q.system_size_kwp + ' kWp')}&estimated_amount=${q.total_price}&bom=${bomParam}`);
    } catch {}
  };

  const openEditModal = (q: any) => {
    setForm({ customer_name: q.customer_name, customer_email: q.customer_email || '', consumo: String(q.consumo_kwh || ''), status: q.status || 'DRAFT' });
    setEditingId(q.id);
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/quotation/quotation/${id}`, { status: newStatus });
      fetchData();
    } catch (e) {
      console.error('Error changing status', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cotización permanentemente?')) return;
    try {
      await api.delete(`/quotation/quotation/${id}`);
      fetchData();
    } catch (e) {
      console.error('Error eliminando:', e);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!form.customer_name) return;
    setLoading(true);
    const finalConsumo = Number(form.consumo) || 1000;
    try {
      if (editingId) {
        await api.put(`/quotation/quotation/${editingId}`, { customer_name: form.customer_name, customer_email: form.customer_email, consumo: finalConsumo, status: form.status });
      } else {
        await api.post('/quotation/quotation', { customer_name: form.customer_name, customer_email: form.customer_email, consumo: finalConsumo, status: 'CALCULATED' });
      }
      setForm({ customer_name: '', customer_email: '', consumo: '', status: 'DRAFT' });
      setEditingId(null);
      setShowModal(false);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/quotations');
      }
      fetchData();
    } catch (e) {
      console.error('Error guardando cotización:', e);
    } finally {
      setLoading(false);
    }
  };

  const parseBom = (q: any): BomLine[] => {
    try {
      if (q.bom_json) return JSON.parse(q.bom_json);
    } catch {}
    return [];
  };

  const groupBomByCategory = (bom: BomLine[]) => {
    const grouped: Record<string, BomLine[]> = {};
    bom.forEach(line => {
      if (!grouped[line.category]) grouped[line.category] = [];
      grouped[line.category].push(line);
    });
    return grouped;
  };

  const exportToPDF = async (q: any, bom: BomLine[]) => {
    try {
      await api.put(`/quotation/quotation/${q.id}`, { status: 'GENERATED' });
      fetchData();
    } catch {}
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text('GreenTech Solutions', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Propuesta Comercial: Sistema Solar Fotovoltaico', 14, 32);

    // Client Info
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Folio: COT-${String(q.id).padStart(4, '0')}`, 14, 42);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 48);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${q.customer_name}`, 14, 56);
    doc.text(`Consumo Mensual: ${q.consumo_kwh?.toLocaleString('es-CO')} kWh`, 14, 62);
    doc.text(`Tamaño del Sistema: ${q.system_size_kwp?.toFixed(2)} kWp`, 14, 68);

    const tableData = bom.map(line => [
      line.sku,
      line.name,
      `${line.quantity} ${line.unit}`,
      formatCOP(line.unit_price),
      formatCOP(line.subtotal)
    ]);

    // Draw Table
    autoTable(doc, {
      startY: 76,
      head: [['SKU', 'Descripción / Material', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 70 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 32, halign: 'right' }
      }
    });

    const currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Financial Analysis
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('Análisis Financiero y Ambiental', 14, currentY);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const boxY = currentY + 5;
    
    if (q.co2_saved_tons) doc.text(`Impacto Ambiental: ${q.co2_saved_tons} toneladas de CO2 mitigadas al año`, 14, boxY + 6);
    if (q.roi_years) doc.text(`Retorno de Inversión (ROI) Estimado: ${q.roi_years} años`, 14, boxY + 12);
    
    let finanY = boxY + 18;
    if (q.financing_options) {
      try {
        const fin = JSON.parse(q.financing_options);
        doc.text(`Financiamiento 5 Años: ${formatCOP(fin.credito_5_anios_mensual)} mensuales`, 14, finanY);
        doc.text(`Leasing 10 Años: ${formatCOP(fin.leasing_10_anios_mensual)} mensuales`, 14, finanY + 6);
      } catch {}
    }

    if (q.discount_applied > 0) {
      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68); // Red
      doc.text(`Descuento Especial Aplicado: -${formatCOP(q.discount_applied)}`, 110, currentY);
    }

    // Draw Total
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Total Inversión:', 110, currentY + 10);
    doc.setTextColor(16, 185, 129);
    doc.text(formatCOP(q.total_price), 150, currentY + 10);

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Esta cotización está sujeta a verificación en sitio y variaciones de tasa de cambio.', 14, 280);

    const fileName = `Cotizacion_GreenTech_${q.customer_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  const categoryIcons: Record<string, string> = {
    'Paneles Solares': '☀️',
    'Inversores': '⚡',
    'Estructuras': '🏗️',
    'Cableado y Eléctrico': '🔌',
    'Monitoreo': '📡',
    'Baterías': '🔋',
  };

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Cotizaciones</h1>
          <p className="text-slate-400">Generación automática de propuestas con lista de materiales del inventario</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ customer_name: '', customer_email: '', consumo: '', status: 'DRAFT' }); setShowModal(true); }} className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Nueva Cotización
        </button>
      </header>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Cotizado</p>
              <h3 className="text-xl font-bold mt-1 text-emerald-400">{formatCOP(quotations.reduce((s: number, q: any) => s + (q.total_price || 0), 0))}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><DollarSign size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Paneles Cotizados</p>
              <h3 className="text-2xl font-bold mt-1">{quotations.reduce((s: number, q: any) => s + (q.panel_count || 0), 0)}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><ArrowUpRight size={22}/></div>
          </div>
        </div>
        <div className="glass p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Cotizaciones Totales</p>
              <h3 className="text-2xl font-bold mt-1">{quotations.length}</h3>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400"><FileText size={22}/></div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente o folio..."
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
          <span>Mostrando {filteredQuotations.length} de {quotations.length} cotizaciones</span>
          <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }} className="text-emerald-400 hover:text-emerald-300 underline ml-2">
            Limpiar
          </button>
        </div>
      )}

      {/* Quotations Table */}
      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300 w-8"></th>
              <th className="p-4 font-medium text-slate-300">ID</th>
              <th className="p-4 font-medium text-slate-300">Cliente</th>
              <th className="p-4 font-medium text-slate-300">Consumo (kWh)</th>
              <th className="p-4 font-medium text-slate-300">Sistema (kWp)</th>
              <th className="p-4 font-medium text-slate-300">Paneles</th>
              <th className="p-4 font-medium text-slate-300">Total (COP)</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300 w-48">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-slate-500">
                {searchQuery ? 'No se encontraron resultados.' : 'No hay cotizaciones. Crea la primera y el sistema generará la lista de materiales automáticamente.'}
              </td></tr>
            )}
            {filteredQuotations.map((q: any) => {
              const bom = parseBom(q);
              const hasBom = bom.length > 0;
              const isExpanded = expandedBom === q.id;
              return (
                <>
                  <tr key={q.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      {hasBom && (
                        <button onClick={() => setExpandedBom(isExpanded ? null : q.id)} className="text-slate-400 hover:text-emerald-400 transition-colors" title="Ver lista de materiales">
                          {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </button>
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm text-emerald-400">COT-{String(q.id).padStart(4, '0')}</td>
                    <td className="p-4">
                      <div className="font-medium">{q.customer_name}</div>
                      {q.customer_email && <div className="text-xs text-slate-400">{q.customer_email}</div>}
                    </td>
                    <td className="p-4 text-slate-300">{q.consumo_kwh?.toLocaleString('es-CO')}</td>
                    <td className="p-4 text-cyan-400">{q.system_size_kwp?.toFixed(2)}</td>
                    <td className="p-4 text-slate-300">{q.panel_count}</td>
                    <td className="p-4 font-semibold text-emerald-400">{formatCOP(q.total_price || 0)}</td>
                    <td className="p-4">
                      <select 
                        value={q.status || 'DRAFT'} 
                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                        className={`bg-slate-900 border border-slate-700/50 rounded drop-shadow px-2 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer ${statusColors[q.status] || 'text-slate-400'}`}
                      >
                        {['DRAFT', 'CALCULATED', 'GENERATED', 'SENT', 'ACCEPTED', 'REJECTED'].map(s => (
                          <option key={s} value={s} className="text-slate-300">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {hasBom && (
                          <button onClick={() => setExpandedBom(isExpanded ? null : q.id)} className="text-violet-400 hover:text-violet-300 bg-violet-400/10 hover:bg-violet-400/20 px-3 py-1.5 rounded-lg border border-violet-400/30 transition-all flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100" title="Ver BOM">
                            <Package size={14} /> BOM
                          </button>
                        )}
                        <button onClick={() => handleCrearProyecto(q)} className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-lg border border-emerald-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          <FolderPlus size={16} /> Vender
                        </button>
                        <button onClick={() => openEditModal(q)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2 py-1.5 rounded-lg border border-blue-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Editar">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* BOM Expandable Row */}
                  {isExpanded && hasBom && (
                    <tr key={`bom-${q.id}`}>
                      <td colSpan={9} className="p-0">
                        <div className="bg-slate-900/60 border-y border-emerald-500/20 p-6 animate-in">
                          <div className="flex items-center gap-2 mb-4">
                            <Package size={18} className="text-emerald-400" />
                            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Lista de Materiales (BOM) — COT-{String(q.id).padStart(4, '0')}</h3>
                          </div>
                          {Object.entries(groupBomByCategory(bom)).map(([category, lines]) => (
                            <div key={category} className="mb-4">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span>{categoryIcons[category] || '📦'}</span> {category}
                              </h4>
                              <div className="space-y-1">
                                {lines.map((line, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-4 py-2 text-sm">
                                    <div className="flex items-center gap-3 flex-1">
                                      <span className="font-mono text-cyan-400 text-xs w-28 shrink-0">{line.sku}</span>
                                      <span className="text-slate-200">{line.name}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-right">
                                      <span className="text-slate-400 w-16 text-right">{line.quantity} {line.unit}</span>
                                      <span className="text-slate-400 w-32 text-right">{formatCOP(line.unit_price)}</span>
                                      <span className="text-emerald-400 font-semibold w-36 text-right">{formatCOP(line.subtotal)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-700">
                            <div>
                                <button onClick={(e) => { e.stopPropagation(); exportToPDF(q, bom); }} className="bg-slate-800/80 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 shadow-lg mb-4">
                                  <Download size={18} /> Exportar como PDF
                                </button>
                                {q.roi_years && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    <div className="p-3 bg-slate-800/50 rounded-lg">
                                      <p className="text-xs text-slate-400">Retorno Inversión</p>
                                      <p className="font-semibold text-emerald-400">{q.roi_years} años</p>
                                    </div>
                                    <div className="p-3 bg-slate-800/50 rounded-lg">
                                      <p className="text-xs text-slate-400">CO2 Mitigado</p>
                                      <p className="font-semibold text-cyan-400">{q.co2_saved_tons} Toneladas</p>
                                    </div>
                                    {q.financing_options && (() => {
                                      try { 
                                        const fin = JSON.parse(q.financing_options);
                                        return (
                                          <>
                                          <div className="p-3 bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-400">Crédito (5 años)</p>
                                            <p className="font-semibold text-slate-200">{formatCOP(fin.credito_5_anios_mensual)}/mes</p>
                                          </div>
                                          <div className="p-3 bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-400">Leasing (10 años)</p>
                                            <p className="font-semibold text-slate-200">{formatCOP(fin.leasing_10_anios_mensual)}/mes</p>
                                          </div>
                                          </>
                                        )
                                      } catch { return null; }
                                    })()}
                                  </div>
                                )}
                            </div>
                            <div className="text-right pb-2">
                              {q.discount_applied > 0 && (
                                <p className="text-rose-400 text-sm mb-1">Descuento aplicado: -{formatCOP(q.discount_applied)}</p>
                              )}
                              <span className="text-slate-400 text-sm mr-4">Total Cotización:</span>
                              <span className="text-2xl font-bold text-emerald-400">{formatCOP(q.total_price)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Editar Cotización' : 'Nueva Cotización'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre del Cliente *</label>
            <input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: Empacadora del Norte" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email del Cliente</label>
            <input value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="contacto@empresa.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Consumo mensual en kWh</label>
            <input type="number" value={form.consumo} onChange={e => setForm({...form, consumo: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Ej: 15000" />
          </div>
          {editingId && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all">
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-medium mb-1">🤖 Generación Automática</p>
            <p className="text-xs text-slate-400">El sistema calculará automáticamente el tamaño del sistema, seleccionará los materiales del inventario (paneles, inversores, estructuras, cableado, protecciones y monitoreo) y generará el precio total en COP.</p>
          </div>
          <button onClick={handleCreateOrUpdate} disabled={loading || !form.customer_name} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2">
            {loading ? 'Generando...' : editingId ? 'Actualizar Cotización' : '⚡ Generar Cotización'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
