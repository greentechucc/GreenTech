'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield, CheckCircle, XCircle, Mail, Phone, Calendar, Key, Activity, List, LogIn } from 'lucide-react';
import { getUsers, roleColors, type AppUser } from '@/lib/mock-users';
import { cn } from '@/lib/utils';

export default function UserEmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    // Simulando carga
    setTimeout(() => {
        const u = getUsers().find(u => String(u.id) === userId);
        if (u) setUser(u);
        setLoading(false);
    }, 500);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando perfil de usuario...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Usuario no encontrado.</p>
        <button onClick={() => router.push('/users/empresa')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push('/users/empresa')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={16} /> Volver a Usuarios Empresa
          </button>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-cyan-500/20">
               {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="pt-2">
              <h1 className="text-3xl font-light tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                 <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5", roleColors[user.role])}>
                    <Shield size={12}/> {user.role}
                 </span>
                 <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", user.active ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-rose-400 bg-rose-400/10 border-rose-400/30')}>
                    {user.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {user.active ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Contacto y Credenciales</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><Mail size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Correo Electrónico</p>
                              <p className="font-medium">{user.email}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><Key size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Contraseña</p>
                              <p className="font-medium text-slate-400 italic">Oculta por seguridad</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Actividad de la Cuenta</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-cyan-400"><Calendar size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Fecha de Creación</p>
                              <p className="font-medium text-slate-300">01/05/2026</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><LogIn size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Último Acceso</p>
                              <p className="font-medium text-slate-300">Hoy, 09:30 AM</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                       <Shield size={16} /> Permisos Asignados (Basado en Rol MOCK)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.role === 'Admin' && (
                         <>
                         <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2">
                             <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-emerald-100">Acceso total a todos los módulos y configuraciones del sistema.</p>
                         </div>
                         <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2">
                             <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-emerald-100">Gestión de usuarios y permisos (Root).</p>
                         </div>
                         </>
                      )}
                      {user.role === 'Asesor' && (
                         <>
                         <div className="bg-slate-800/50 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2">
                             <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-slate-300">Lectura y Escritura en CRM Prospectos.</p>
                         </div>
                         <div className="bg-slate-800/50 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2">
                             <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-slate-300">Creación y Envío de Cotizaciones Comerciales.</p>
                         </div>
                         <div className="bg-slate-800/50 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2">
                             <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-slate-500">Restringido: Accesos a Inventario y Monitoreo Técnico.</p>
                         </div>
                         </>
                      )}
                      {(!['Admin', 'Asesor'].includes(user.role)) && (
                         <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl flex items-start gap-2 col-span-2">
                             <Activity size={16} className="text-slate-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-slate-300">La vista de permisos detallados para el rol <strong className="text-emerald-400">{user.role}</strong> está en construcción o depende del motor de permisos RBAC del microservicio.</p>
                         </div>
                      )}
                  </div>
              </div>

              <div className="glass p-6">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                       <List size={16} /> Auditoría Reciente (Simulada)
                  </h3>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                          <div>
                              <p className="text-sm font-medium text-slate-200">Inicio de Sesión Exitoso</p>
                              <p className="text-xs text-slate-500">Dirección IP: 192.168.1.45 (Bogotá, CO)</p>
                          </div>
                          <span className="text-xs text-slate-400">Hace 2 horas</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl opacity-60">
                          <div>
                              <p className="text-sm font-medium text-slate-200">Modificación de Perfil</p>
                              <p className="text-xs text-slate-500">Actualización de imagen de perfil</p>
                          </div>
                          <span className="text-xs text-slate-400">Ayer</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
