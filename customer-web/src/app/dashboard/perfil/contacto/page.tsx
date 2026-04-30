'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Mail, Phone, CheckCircle2, Save, User } from 'lucide-react';
import api from '@/services/api';

export default function PerfilContactoView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);
    fetchProfile(savedEmail);
  }, [router]);

  const fetchProfile = async (customerEmail: string) => {
    try {
      const res = await api.get(`/portal/profile/${encodeURIComponent(customerEmail)}`);
      if (res.data) {
        if (res.data.name) setName(res.data.name);
        if (res.data.phone) setPhone(res.data.phone);
        if (res.data.address) setAddress(res.data.address);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/portal/profile/contact', {
        email,
        name,
        phone,
        address
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Error guardando los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in pb-12">
      <header className="mb-8 text-center sm:text-left">
        <Link href="/dashboard/perfil" className="text-emerald-500 hover:text-emerald-600 font-bold mb-6 inline-flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Volver al Centro de Cuenta</Link>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center justify-center sm:justify-start gap-3">
          Datos de Contacto
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Actualiza tus métodos de contacto y dirección para la facturación.</p>
      </header>

      <div className="glass p-8 sm:p-12 relative overflow-hidden">
        {success && (
          <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white py-3 font-bold flex justify-center items-center gap-2 fade-in z-20 shadow-md">
            <CheckCircle2 size={18} /> Datos guardados exitosamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <User size={16} className="text-emerald-500" /> Nombre de Usuario / Empresa
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-lg"
              placeholder="GreenTech SRL"
            />
          </div>
          
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <Mail size={16} className="text-emerald-500" /> Correo Principal
            </label>
            <input 
              type="email" 
              required
              value={email}
              readOnly
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-500 cursor-not-allowed font-medium text-lg"
            />
            <p className="text-xs text-slate-400 mt-2 font-medium">El correo es el identificador único de cuenta y no se puede modificar desde acá.</p>
          </div>

          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <Phone size={16} className="text-emerald-500" /> Teléfono de Contacto
            </label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-lg"
              placeholder="+57 320 000 0000"
            />
          </div>

          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <MapPin size={16} className="text-emerald-500" /> Dirección de Instalación
            </label>
            <textarea 
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none font-medium text-lg leading-relaxed"
              placeholder="Ej: Bogotá D.C., Colombia"
            ></textarea>
          </div>

          <button disabled={loading} type="submit" className="w-full mt-8 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 text-lg">
             {loading ? 'Sincronizando...' : <><Save size={20} /> Guardar Cambios</>}
          </button>
        </form>
      </div>
    </main>
  );
}
