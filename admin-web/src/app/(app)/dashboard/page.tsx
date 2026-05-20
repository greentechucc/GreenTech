'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, Package, AlertTriangle, Briefcase, FileText, CheckCircle, WifiOff } from 'lucide-react';
import api from '@/services/api';
import { getCurrentUser } from '@/lib/mock-users';

const mockGlobalData = [
  { name: 'Lun', kw: 400 },
  { name: 'Mar', kw: 300 },
  { name: 'Mie', kw: 550 },
  { name: 'Jue', kw: 450 },
  { name: 'Vie', kw: 600 },
  { name: 'Sab', kw: 700 },
  { name: 'Dom', kw: 580 },
];

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Global States
  const [prospects, setProspects] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [inverters, setInverters] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const loadData = async () => {
      try {
        if (!user) return;
        const role = user.role;

        const calls: Promise<any>[] = [];

        if (['Admin', 'Asesor'].includes(role)) {
          calls.push(api.get('/crm/prospects').then(r => setProspects(r.data)).catch(() => {}));
          calls.push(api.get('/quotation/quotation').then(r => setQuotations(r.data)).catch(() => {}));
        }
        
        if (['Admin', 'Proyectos', 'Tecnico', 'Auxiliar'].includes(role)) {
          calls.push(api.get('/projects/projects').then(r => setProjects(r.data)).catch(() => {}));
        }

        if (['Admin', 'Proyectos'].includes(role)) {
          calls.push(api.get('/permits/permits').then(r => setPermits(r.data)).catch(() => {}));
        }

        if (['Admin'].includes(role)) {
          calls.push(api.get('/billing/billing/invoices').then(r => setInvoices(r.data)).catch(() => {}));
        }

        if (['Admin', 'Tecnico', 'Auxiliar'].includes(role)) {
          calls.push(api.get('/monitoring/monitoring/inverters').then(r => setInverters(r.data)).catch(() => {}));
        }

        if (['Admin', 'Bodega'].includes(role)) {
          calls.push(api.get('/inventory/inventory').then(r => setInventory(r.data)).catch(() => {}));
        }

        if (['Admin', 'Soporte'].includes(role)) {
          calls.push(api.get('/portal/tickets').then(r => setTickets(r.data)).catch(() => {}));
        }

        await Promise.all(calls);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div className="p-12 text-slate-400 text-center">Cargando Inteligencia Operativa...</div>;
  }

  // Composed Data Processors
  const leads = prospects.length;
  const quoted = quotations.length;
  const installed = projects.filter((p: any) => p.completion === 100).length;
  const activeProjects = projects.filter((p: any) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
  const installingProjects = projects.filter((p: any) => p.status === 'INSTALLATION').length;
  const revenueMTD = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.amount, 0);
  const permitsPending = permits.filter((p: any) => p.status === 'UNDER_REVIEW').length;
  
  // Tecnico/Auxiliar filtering using crew_name
  const myCrew = currentUser?.crew_name || '';
  const myProjects = currentUser?.role === 'Tecnico' 
    ? projects.filter(p => p.assigned_crew === myCrew) 
    : currentUser?.role === 'Auxiliar'
      ? projects.filter(p => p.assigned_auxiliaries?.includes(currentUser.email))
      : projects;
  const myProjectIds = myProjects.map(p => p.id);
  const myInverters = (currentUser?.role === 'Tecnico' || currentUser?.role === 'Auxiliar') 
    ? inverters.filter(i => myProjectIds.includes(i.project_id)) 
    : inverters;
  const telemetryAlerts = myInverters.filter((inv: any) => inv.status === 'ERROR').length;

  const funnelData = [
    { name: 'Prospectos', amt: leads },
    { name: 'Cotizados', amt: quoted },
    { name: 'Instalados', amt: installed }
  ];

  /* ---------------- Views rendering ---------------- */

  if (currentUser?.role === 'Admin') {
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Panel Gerencial y Operaciones</h1>
          <p className="text-slate-400">Visión Maestro del ecosistema GreenTech</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium">Ingresos Cobrados</p>
                <h3 className="text-3xl font-bold mt-1">${revenueMTD.toLocaleString('en-US')}</h3>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><TrendingUp size={24}/></div>
            </div>
          </div>
          <div className="glass p-6 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium">Proyectos Activos</p>
                <h3 className="text-3xl font-bold mt-1">{activeProjects}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Briefcase size={24}/></div>
            </div>
            <p className="text-sm text-slate-400">{installingProjects} en instalación</p>
          </div>
          <div className="glass p-6 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium">Trámites Pendientes</p>
                <h3 className="text-3xl font-bold mt-1">{permitsPending}</h3>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><FileText size={24}/></div>
            </div>
          </div>
          <div className="glass p-6 hover:-translate-y-1 transition-transform relative overflow-hidden">
            {telemetryAlerts > 0 && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-slate-400 text-sm font-medium">Alertas Telemetría</p>
                <h3 className="text-3xl font-bold mt-1 text-rose-400">{telemetryAlerts}</h3>
              </div>
              <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><Activity size={24}/></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="glass p-6 lg:col-span-2">
            <h3 className="text-lg font-medium mb-6">Generación Global Acumulada (kW)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGlobalData}>
                  <defs>
                    <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="kw" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKw)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass p-6">
            <h3 className="text-lg font-medium mb-6">Embudo de Conversión Comercial</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <XAxis dataKey="name" stroke="#475569" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="amt" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Asesor') {
    const quotesApproved = quotations.filter((q:any) => q.status === 'ACCEPTED').length;
    const quotesPending = quotations.filter((q:any) => q.status === 'SENT').length;
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Mando Comercial</h1>
          <p className="text-slate-400">KPIs de ventas, leads y conversiones</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 border border-blue-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Prospectos Totales</p>
              <Users size={20} className="text-blue-400"/>
            </div>
            <h3 className="text-3xl font-bold">{leads}</h3>
          </div>
          <div className="glass p-6 border border-amber-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Cotizaciones Enviadas</p>
              <FileText size={20} className="text-amber-400"/>
            </div>
            <h3 className="text-3xl font-bold">{quotesPending}</h3>
          </div>
          <div className="glass p-6 border border-emerald-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Cotizaciones Aceptadas</p>
              <CheckCircle size={20} className="text-emerald-400"/>
            </div>
            <h3 className="text-3xl font-bold text-emerald-400">{quotesApproved}</h3>
          </div>
        </div>
        <div className="glass p-6 mt-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium mb-6">Eficiencia del Embudo</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <XAxis dataKey="name" stroke="#475569" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="amt" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Proyectos') {
    const inDesign = projects.filter((p: any) => p.status === 'DESIGN').length;
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Centro de Ingeniería</h1>
          <p className="text-slate-400">Progreso físico y normativo de instalaciones</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 border border-indigo-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">En Diseño / Visita</p>
              <Briefcase size={20} className="text-indigo-400"/>
            </div>
            <h3 className="text-3xl font-bold">{inDesign}</h3>
          </div>
          <div className="glass p-6 border border-cyan-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">En Instalación Activa</p>
              <Activity size={20} className="text-cyan-400"/>
            </div>
            <h3 className="text-3xl font-bold">{installingProjects}</h3>
          </div>
          <div className="glass p-6 border border-amber-500/20">
             <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Permisos Atascados</p>
              <FileText size={20} className="text-amber-400"/>
            </div>
            <h3 className="text-3xl font-bold">{permitsPending}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Bodega') {
    const lowStockItems = inventory.filter((i:any) => i.stock < 10).length;
    const inventoryVal = inventory.reduce((s: number, i: any) => s + (i.stock * i.unit_price), 0);
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Logística e Inventario</h1>
          <p className="text-slate-400">Control de insumos fotovoltaicos</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 border border-slate-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Variedad de Materiales</p>
              <Package size={20} className="text-slate-400"/>
            </div>
            <h3 className="text-3xl font-bold">{inventory.length}</h3>
          </div>
          <div className="glass p-6 border border-rose-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Alertas Bajo Stock</p>
              <AlertTriangle size={20} className="text-rose-400"/>
            </div>
            <h3 className="text-3xl font-bold text-rose-400">{lowStockItems}</h3>
          </div>
          <div className="glass p-6 border border-emerald-500/20">
             <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Capital Inmovilizado</p>
              <TrendingUp size={20} className="text-emerald-400"/>
            </div>
            <h3 className="text-3xl font-bold">${inventoryVal.toLocaleString('en-US')}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Tecnico') {
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Campo Logístico ({myCrew || 'No asignado'})</h1>
          <p className="text-slate-400">Ejecución del trabajo en terreno y salud de equipos instalados.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 border border-cyan-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Proyectos Vigentes de tu Cuadrilla</p>
              <Briefcase size={20} className="text-cyan-400"/>
            </div>
            <h3 className="text-4xl font-bold">{myProjects.length}</h3>
          </div>
          <div className="glass p-6 border border-rose-500/20 relative overflow-hidden">
             {telemetryAlerts > 0 && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
            <div className="flex justify-between items-start mb-2 relative z-10">
              <p className="text-slate-400 text-sm font-medium">Inversores con Pérdida (Tu Cuadrilla)</p>
              <WifiOff size={20} className="text-rose-400"/>
            </div>
            <h3 className="text-4xl font-bold text-rose-400 relative z-10">{telemetryAlerts}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Soporte') {
    const openTickets = tickets.filter(t => t.status === 'OPEN').length;
    const resolvedTickets = tickets.filter(t => t.status === 'CLOSED').length;
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Centro de Recepción e Incidencias</h1>
          <p className="text-slate-400">Atención al cliente y reportes del portal público</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 border border-rose-500/20 relative">
             {openTickets > 0 && <div className="absolute top-0 right-0 p-2"><span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span></div>}
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Tickets Críticos (Mesa Abierta)</p>
              <AlertTriangle size={20} className="text-rose-400"/>
            </div>
            <h3 className="text-4xl font-bold">{openTickets}</h3>
          </div>
          <div className="glass p-6 border border-emerald-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Tickets Cerrados Exitosamente</p>
              <CheckCircle size={20} className="text-emerald-400"/>
            </div>
            <h3 className="text-4xl font-bold text-emerald-400">{resolvedTickets}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Auxiliar') {
    const assignedToMe = projects.filter(p => p.assigned_auxiliaries?.includes(currentUser.email));
    return (
      <div className="space-y-6 fade-in p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight">Panel de Auxiliar Técnico</h1>
          <p className="text-slate-400">Plan de trabajo diario ({currentUser.crew_name || 'Sin Cuadrilla Asignada'})</p>
        </header>
        <div className="grid grid-cols-1 gap-6">
          <div className="glass p-6 border border-teal-500/20">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-sm font-medium">Proyectos Asignados a Mí</p>
              <Briefcase size={20} className="text-teal-400"/>
            </div>
            <h3 className="text-4xl font-bold text-teal-400">{assignedToMe.length}</h3>
          </div>
        </div>

        {/* Lista Simple para el Auxiliar */}
        {assignedToMe.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4 flex items-center gap-2"><Activity size={20} className="text-emerald-400"/> Órdenes de Trabajo Activas</h3>
            <div className="space-y-4">
               {assignedToMe.map(p => (
                 <div key={p.id} className="glass p-5 rounded-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div>
                     <h4 className="text-lg font-bold text-white">{p.name || p.customer_name}</h4>
                     <p className="text-slate-400 text-sm">Cliente: {p.customer_name}</p>
                   </div>
                   <div className="text-right">
                     <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm mb-1">{p.status?.replace(/_/g, ' ')}</span>
                     <p className="text-xs text-slate-500">Sistema: {p.system_size}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
