'use client';

import { useState, useEffect } from 'react';
import { Leaf, Sun, Zap, Award, Factory, Home, CheckCircle2, FactoryIcon, ArrowRight, Globe } from 'lucide-react';
import api from '@/services/api';

import { useRouter, useSearchParams } from 'next/navigation';
import { SHOWCASE_PROJECTS } from './mockData';

function GlobalPageContent() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    consumo: '',
    phone: '',
    details: ''
  });

  const router = useRouter();

  useEffect(() => {
    const e = localStorage.getItem('customer_email');
    if (e) {
      setEmail(e);
      api.get(`/portal/profile/${encodeURIComponent(e)}`).then(res => {
        if (res.data?.name) {
           setName(res.data.name);
        } else {
           setName(e.split('@')[0]);
        }
        if (res.data?.phone) {
           setForm(f => ({ ...f, phone: res.data.phone }));
        }
      }).catch(() => setName(e.split('@')[0]));
    }
  }, []);

  useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     if (params.get('simulate') === 'true') {
        setShowForm(true);
        const cons = params.get('consumo');
        if (cons) {
            setForm(prev => ({...prev, consumo: cons }));
        }
     }
  }, []);

  const handleCotizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      // Determinar si ya tiene proyecto
      const res = await api.get('/projects/projects');
      const allProjects = res.data || [];
      const hasProject = allProjects.some((p: any) => p.customer_email === email);

      const finalConsumo = Number(form.consumo) || 1500;

      if (hasProject) {
        // Enviar a cotizaciones
        await api.post('/quotation/quotation', {
          customer_name: name || 'Cliente Plataforma',
          customer_email: email,
          consumo: finalConsumo,
          status: 'CALCULATED'
        });
      } else {
        // Enviar a CRM
        await api.post('/crm/prospects', {
          name: name || email,
          email: email,
          phone: form.phone || '0000',
          consumption: finalConsumo,
          source: 'Portal Global',
        });
      }
      setSuccess(true);
      setTimeout(() => setShowForm(false), 3000);
    } catch (err) {
      console.error('Error al cotizar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full fade-in pb-10">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden mb-12 shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe size={300} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold tracking-wide mb-4 border border-emerald-500/30">
             Showcase Global Inteligente
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Energizando el Futuro, Proyecto a Proyecto.
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Descubre nuestro portafolio global y descubre cómo ayudamos a la industria a transicionar hacia energía limpia y rentable.
          </p>
          <button onClick={() => setShowForm(!showForm)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            {!showForm ? <Zap size={20} /> : <ArrowRight size={20} />} 
            {showForm ? 'Ver Proyectos' : 'Nueva Cotización Inmediata'}
          </button>
        </div>
      </div>

      {/* Cotizar Form */}
      {showForm ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Simula tu Nuevo Sistema</h2>
            <p className="text-slate-500 mb-8">El sistema analizará tu perfil. Si eres cliente antiguo, preparará una cotización avanzada; si eres nuevo, un asesor de GreenTech te contactará pronto.</p>
            
            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-2">¡Solicitud Procesada Exitosamente!</h3>
                <p className="text-emerald-600">Nuestro sistema ha recibido tus datos y los ha enrutado al departamento correspondiente.</p>
              </div>
            ) : (
              <form onSubmit={handleCotizar} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo / Empresa</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl px-4 py-3 bg-slate-50 border" placeholder="GreenTech SA" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(Registrado)</span></label>
                    <input disabled value={email} type="email" className="w-full border-slate-200 text-slate-500 rounded-xl px-4 py-3 bg-slate-100 border cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                    <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" className="w-full border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl px-4 py-3 bg-slate-50 border" placeholder="+57 320 000 0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Consumo Eléctrico Mensual (kWh)</label>
                  <input required value={form.consumo} onChange={e => setForm({...form, consumo: e.target.value})} type="number" className="w-full border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl px-4 py-3 bg-slate-50 border font-mono tracking-wide text-lg" placeholder="Ej: 8500" />
                  <p className="text-xs text-slate-400 mt-1">Busca este dato en el historial de tu factura de energía.</p>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                    {loading ? <Zap className="animate-pulse" /> : <Sun />}
                    {loading ? 'Procesando Inteligencia...' : 'Simular y Enviar Datos'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Showcase grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8">
          {SHOWCASE_PROJECTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={p.id} onClick={() => router.push(`/dashboard/global/${p.id}`)} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                    <Icon size={12} /> {p.type}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-emerald-500 transition-colors">{p.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed flex-1">{p.description}</p>
                  
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Poder</p>
                      <p className="text-emerald-600 font-bold font-mono">{p.size}</p>
                    </div>
                    <div className="text-center border-l border-r border-slate-100">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Paneles</p>
                      <p className="text-slate-700 font-bold font-mono">{p.panels}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Ahorro CO2</p>
                      <p className="text-cyan-600 font-bold font-mono">{p.co2}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default function GlobalPage() {
  return <GlobalPageContent />;
}
