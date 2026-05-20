'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCircle, Mail, Phone, MapPin, ShieldAlert, CheckCircle, Clock, Search, Folder, Shield, AlertTriangle, Key } from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    fetchCustomer();
  }, [userId]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/portal/users`);
      const found = res.data.find((item: any) => String(item.id) === userId);
      if (found) setUser(found);
    } catch (err) {
      console.error('Error loading customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!confirm('¿Desbloquear cuenta de cliente (remover DoS protecciòn)?')) return;
    try {
        await api.put(`/portal/users/${userId}/unlock`);
        fetchCustomer();
    } catch(err) {
        console.error(err);
        alert('Error al desbloquear cuenta');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando perfil del cliente...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Cliente no encontrado en el portal.</p>
        <button onClick={() => router.push('/users/clientes')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Clientes
        </button>
      </div>
    );
  }

  const isLocked = user.login_locked_until && new Date() < new Date(user.login_locked_until);

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto w-full max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push('/users/clientes')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={16} /> Volver a Clientes del Portal
          </button>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
               {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="pt-2">
              <h1 className="text-3xl font-light tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                 <span className="px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center gap-1.5">
                    <UserCircle size={12}/> Cliente Externo
                 </span>
                 <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", isLocked ? 'text-rose-400 bg-rose-400/10 border-rose-400/30' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30')}>
                    {isLocked ? <ShieldAlert size={12} /> : <CheckCircle size={12} />}
                    {isLocked ? 'Acceso Bloqueado (DoS)' : 'Acceso Permitido'}
                 </span>
              </div>
            </div>
          </div>
        </div>
        {isLocked && (
            <button onClick={handleUnlock} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all self-start mt-8">
                <Key size={18} /> Desbloquear Cuenta
            </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Datos de Contacto</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Mail size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Correo Electrónico</p>
                              <p className="font-medium">{user.email}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Phone size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Teléfono</p>
                              <p className="font-medium">{user.phone || 'No registrado'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><MapPin size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Dirección</p>
                              <p className="font-medium truncate">{user.address || 'No registrada'}</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Seguridad y Acceso</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><Clock size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Fecha de Registro</p>
                              <p className="font-medium text-slate-300">{new Date(user.created_at).toLocaleString()}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-slate-800 rounded-lg text-rose-400"><AlertTriangle size={18}/></div>
                          <div>
                              <p className="text-xs text-slate-500">Intentos Fallidos (Login)</p>
                              <p className={`font-medium ${user.failed_login_attempts > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                                  {user.failed_login_attempts} intentos
                              </p>
                          </div>
                      </div>
                      {isLocked && (
                          <div className="mt-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs text-rose-300">
                              Esta cuenta está bloqueada temporalmente por protección contra fuerza bruta o DoS.
                              <p className="mt-1 font-semibold">Bloqueada hasta: {new Date(user.login_locked_until).toLocaleString()}</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
              <div className="glass p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                       <Folder size={16} /> Relación con GreenTech (Dashboard)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-slate-200">Proyectos Activos</p>
                              <p className="text-xs text-slate-500">Instalaciones en curso o completadas</p>
                          </div>
                          <span className="text-2xl font-black text-blue-400">0</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-slate-200">Tickets de Soporte</p>
                              <p className="text-xs text-slate-500">Solicitudes enviadas</p>
                          </div>
                          <span className="text-2xl font-black text-indigo-400">0</span>
                      </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 flex items-start gap-3">
                      <Search className="text-slate-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-slate-400">
                         Para vincular facturación, proyectos u otros servicios a este cliente, el correo electrónico (<strong className="text-slate-300">{user.email}</strong>) se utilizará como llave principal (Foreign Key lógica) en los otros microservicios.
                      </p>
                  </div>
              </div>

              <div className="glass p-6 opacity-60">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                       <Shield size={16} /> Logs de Portal Cliente (Proximamente)
                  </h3>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                          <div>
                              <p className="text-sm font-medium text-slate-200">Inicio de sesión en portal</p>
                              <p className="text-xs text-slate-500">Acceso validado a Client Portal</p>
                          </div>
                          <span className="text-xs text-slate-400">Hace 3 días</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
