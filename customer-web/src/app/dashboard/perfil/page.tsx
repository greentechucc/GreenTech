'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, MapPin, Phone, Shield, ArrowRight, Camera, Lock } from 'lucide-react';
import api from '@/services/api';

export default function PerfilView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);
    setName(localStorage.getItem('customer_name') || 'Cliente Solar');

    // Fetch profile to get avatar
    api.get(`/portal/profile/${encodeURIComponent(savedEmail)}`)
      .then((res) => {
         if (res.data && res.data.avatar_url) {
           setAvatarUrl(res.data.avatar_url);
         }
      })
      .catch((e) => console.error(e));
  }, [router]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in pb-12">
      <header>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-800">Centro de Cuenta</h1>
        <p className="text-slate-500 mt-2 text-lg">Administra tus configuraciones de identidad, contacto y alta seguridad.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        
        {/* Identidad de Marca Rápida */}
        <div className="glass p-8 flex flex-col items-center text-center md:col-span-1 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500/10"></div>
          
          <div className="w-32 h-32 rounded-full bg-white border-4 border-emerald-50 shadow-2xl flex items-center justify-center text-emerald-200 mb-6 relative z-10 overflow-hidden">
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
               <User size={64} />
            )}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm z-20"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 relative z-10">{name}</h2>
          <p className="text-slate-500 font-medium text-sm mt-1 mb-6 flex items-center gap-1 justify-center relative z-10">
            <Shield size={16} className="text-emerald-500"/> Identidad Verificada
          </p>
          
          <div className="w-full bg-slate-50 rounded-xl p-4 text-left relative z-10 border border-slate-100">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cuenta Enlazada</p>
             <p className="font-semibold text-slate-700 truncate">{email}</p>
          </div>
        </div>

        {/* Tarjetas de Configuración */}
        <div className="md:col-span-2 space-y-6">
          
          <Link href="/dashboard/perfil/foto" className="group glass p-8 flex items-center justify-between hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all border-2 border-transparent">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                 <Camera size={32} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-800 mb-1">Fotografía de Perfil</h3>
                 <p className="text-slate-500 font-medium">Actualiza tu avatar o foto comercial visible.</p>
               </div>
             </div>
             <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
               <ArrowRight size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
             </div>
          </Link>

          <Link href="/dashboard/perfil/contacto" className="group glass p-8 flex items-center justify-between hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all border-2 border-transparent">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                 <MapPin size={32} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-800 mb-1">Datos de Contacto</h3>
                 <p className="text-slate-500 font-medium">Modifica teléfono, ubicación de los paneles o correo.</p>
               </div>
             </div>
             <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
               <ArrowRight size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
             </div>
          </Link>

          <Link href="/dashboard/perfil/seguridad" className="group glass p-8 flex items-center justify-between hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all border-2 border-transparent">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                 <Lock size={32} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-800 mb-1">Seguridad de la Cuenta</h3>
                 <p className="text-slate-500 font-medium">Cambio de contraseñas de acceso al portal.</p>
               </div>
             </div>
             <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:bg-rose-50 group-hover:border-rose-200 transition-colors">
               <ArrowRight size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
             </div>
          </Link>

        </div>
      </div>
    </main>
  );
}
