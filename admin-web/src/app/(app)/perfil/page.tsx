'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Shield, ArrowRight, Camera, Lock, Key } from 'lucide-react';
import { getCurrentUser, roleColors, type AppUser } from '@/lib/mock-users';
import { cn } from '@/lib/utils';

export default function AdminPerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu) {
      router.push('/login');
      return;
    }
    setUser(cu);
  }, [router]);

  if (!user) return null;

  return (
    <div className="space-y-6 fade-in p-4 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Shield className="text-emerald-400" size={32} />
          Centro de Cuenta
        </h1>
        <p className="text-slate-400 text-lg">Administra tu identidad, datos de acceso y seguridad del portal administrativo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Identity Card */}
        <div className="glass p-8 flex flex-col items-center text-center md:col-span-1 relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
          
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold mb-5 relative z-10 shadow-2xl shadow-emerald-500/30 border-4 border-slate-800 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          
          <h2 className="text-xl font-bold text-white relative z-10">{user.name}</h2>
          <span className={cn("text-xs px-3 py-1 rounded-full border font-semibold mt-2 relative z-10", roleColors[user.role])}>
            {user.role}
          </span>
          
          <div className="w-full bg-slate-800/50 rounded-xl p-4 text-left relative z-10 mt-6 border border-slate-700/50">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cuenta Enlazada</p>
             <p className="font-semibold text-slate-300 truncate flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" /> {user.email}
             </p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="md:col-span-2 space-y-4">
          
          <Link href="/perfil/foto" className="group glass p-6 flex items-center justify-between hover:border-indigo-500/50 transition-all border border-transparent rounded-2xl">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Camera size={28} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white mb-0.5">Fotografía de Perfil</h3>
                 <p className="text-slate-400 text-sm">Actualiza tu avatar o foto visible en la barra lateral.</p>
               </div>
             </div>
             <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
               <ArrowRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
             </div>
          </Link>

          <Link href="/perfil/datos" className="group glass p-6 flex items-center justify-between hover:border-emerald-500/50 transition-all border border-transparent rounded-2xl">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <User size={28} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white mb-0.5">Datos Personales</h3>
                 <p className="text-slate-400 text-sm">Modifica tu nombre y correo electrónico de acceso.</p>
               </div>
             </div>
             <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
               <ArrowRight size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
             </div>
          </Link>

          <Link href="/perfil/seguridad" className="group glass p-6 flex items-center justify-between hover:border-rose-500/50 transition-all border border-transparent rounded-2xl">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Lock size={28} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white mb-0.5">Seguridad de la Cuenta</h3>
                 <p className="text-slate-400 text-sm">Cambia tu contraseña de acceso al portal administrativo.</p>
               </div>
             </div>
             <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-colors">
               <ArrowRight size={18} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
             </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
