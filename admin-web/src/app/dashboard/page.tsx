'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, BatteryCharging, TrendingUp, Users } from 'lucide-react';
import api from '@/services/api';

const mockData = [
  { name: 'Lun', kw: 400 },
  { name: 'Mar', kw: 300 },
  { name: 'Mie', kw: 550 },
  { name: 'Jue', kw: 450 },
  { name: 'Vie', kw: 600 },
  { name: 'Sab', kw: 700 },
  { name: 'Dom', kw: 580 },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    activeProjects: 12,
    revenueMTD: 50000,
    permitsPending: 3,
    telemetryAlerts: 1
  });

  const [funnelData, setFunnelData] = useState<any[]>([
    { name: 'Leads', amt: 50 },
    { name: 'Cotizados', amt: 30 },
    { name: 'Instalados', amt: 10 }
  ]);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const [crmRes, qtRes, prjRes, billRes] = await Promise.all([
          api.get('/crm/prospects').catch(() => ({ data: [] })),
          api.get('/quotation/quotation').catch(() => ({ data: [] })),
          api.get('/projects/projects').catch(() => ({ data: [] })),
          api.get('/billing/billing/invoices').catch(() => ({ data: [] }))
        ]);

        const prospects = crmRes.data || [];
        const quotations = qtRes.data || [];
        const projects = prjRes.data || [];
        const invoices = billRes.data || [];

        const leads = prospects.length;
        const quoted = quotations.length;
        const installed = projects.filter((p: any) => p.completion === 100).length;

        const activeProjects = projects.filter((p: any) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
        
        // Sum all PAID invoices to show real total collected revenue
        const revenueMTD = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.amount, 0);
        
        setKpis(prev => ({
          ...prev,
          activeProjects,
          revenueMTD,
          permitsPending: projects.filter((p: any) => p.status === 'PERMIT_PROCESS').length,
          telemetryAlerts: 0 
        }));

        setFunnelData([
          { name: 'Prospectos', amt: leads },
          { name: 'Cotizados', amt: quoted },
          { name: 'Instalados', amt: installed }
        ]);

      } catch (err) {
        console.error('Error fetching real data dashboard:', err);
      }
    };
    loadRealData();
  }, []);

  return (
    <div className="space-y-6 fade-in p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight">Panel Gerencial y Operaciones</h1>
        <p className="text-slate-400">Resumen y KPIs del ecosistema GreenTech</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Ingresos Cobrados</p>
              <h3 className="text-3xl font-bold mt-1">${kpis.revenueMTD.toLocaleString('en-US')}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><TrendingUp size={24}/></div>
          </div>
          <p className="text-sm text-emerald-400 flex items-center gap-1">+12% vs mes anterior</p>
        </div>

        <div className="glass p-6 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Proyectos Activos</p>
              <h3 className="text-3xl font-bold mt-1">{kpis.activeProjects}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><BriefcaseIcon size={24}/></div>
          </div>
          <p className="text-sm text-slate-400">3 en fase de instalación</p>
        </div>

        <div className="glass p-6 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Trámites Pendientes</p>
              <h3 className="text-3xl font-bold mt-1">{kpis.permitsPending}</h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><FileTextIcon size={24}/></div>
          </div>
          <p className="text-sm text-slate-400">Para CFE Generación Distribuida</p>
        </div>

        <div className="glass p-6 hover:-translate-y-1 transition-transform relative overflow-hidden">
          {kpis.telemetryAlerts > 0 && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Alertas Telemetría</p>
              <h3 className="text-3xl font-bold mt-1 text-rose-400">{kpis.telemetryAlerts}</h3>
            </div>
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><Activity size={24}/></div>
          </div>
          <p className="text-sm text-rose-400 relative z-10">Revisión requerida inversor A-423</p>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="glass p-6 lg:col-span-2">
          <h3 className="text-lg font-medium mb-6">Generación Global Acumulada (kW)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="kw" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass p-6">
          <h3 className="text-lg font-medium mb-6">Embudo de Conversión</h3>
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

// Icons fallbacks
function BriefcaseIcon(probs: any) { return <Briefcase {...probs}/>;}
function FileTextIcon(probs: any) { return <FileText {...probs}/>;}
import { Briefcase, FileText } from 'lucide-react';
