'use client';

import { Shield, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersLandingPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col max-w-6xl mx-auto mt-8">
      <header className="flex flex-col mb-8 text-center items-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
           <Shield size={32} />
        </div>
        <h1 className="text-4xl font-light tracking-tight mb-2">Centro de Usuarios</h1>
        <p className="text-slate-400 text-lg">Administración de accesos de personal y clientes externos de GreenTech</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Empresa Option */}
        <button 
           onClick={() => router.push('/users/empresa')}
           className="glass p-10 rounded-3xl border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
           <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
              <Briefcase size={28} />
           </div>
           <h2 className="text-3xl font-semibold mb-3 text-white">Empresa</h2>
           <p className="text-slate-400 text-lg mb-8">
              Administración de empleados. Filtra por total, activos, asesores, proyectos, técnicos y roles administrativos.
           </p>
           <div className="flex items-center text-emerald-400 font-medium group-hover:translate-x-2 transition-transform">
              Ingresar a Empresa <ChevronRight className="ml-1" size={20} />
           </div>
        </button>

        {/* Clientes Option */}
        <button 
           onClick={() => router.push('/users/clientes')}
           className="glass p-10 rounded-3xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left group relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
           <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <Users size={28} />
           </div>
           <h2 className="text-3xl font-semibold mb-3 text-white">Clientes</h2>
           <p className="text-slate-400 text-lg mb-8">
              Visualiza y mapea a todos los clientes registrados desde el Portal Web. Controla sus accesos y estados de seguridad.
           </p>
           <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
              Ingresar a Clientes <ChevronRight className="ml-1" size={20} />
           </div>
        </button>
      </div>
    </div>
  );
}
