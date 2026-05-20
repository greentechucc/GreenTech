'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Shield, UserCircle, Mail, Clock, ShieldAlert, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/mock-users';
import api from '@/services/api';

// Defines the structure fetched from client-portal-service's CustomerUser
interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  failed_login_attempts: number;
  login_locked_until: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu || cu.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }

    const fetchCustomers = async () => {
      try {
        const res = await api.get('/portal/users');
        setUsers(res.data);
      } catch (err) {
         console.error('Failed to fetch customer users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [router]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  // Derived state for lockouts
  const isLocked = (lockedUntil: string | null) => {
    if (!lockedUntil) return false;
    return new Date() < new Date(lockedUntil);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente al cliente "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/portal/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el cliente: ' + (err.response?.data?.message || 'Error desconocido'));
    }
  };

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <UserCircle className="text-blue-400" size={32} />
            Gestión de Clientes
          </h1>
          <p className="text-slate-400">Administración de clientes registrados en la plataforma web</p>
        </div>
        <button
          onClick={() => router.push('/users')}
          className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all border border-slate-600"
        >
          Volver a Selección
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-slate-400">Total Clientes</p>
        </div>
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">
             {users.filter(u => !isLocked(u.login_locked_until)).length}
          </p>
          <p className="text-xs text-slate-400">Cuentas Sin Bloqueo</p>
        </div>
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-rose-400">
             {users.filter(u => isLocked(u.login_locked_until)).length}
          </p>
          <p className="text-xs text-slate-400">Cuentas Bloqueadas</p>
        </div>
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-400">
             {users.reduce((acc, u) => acc + (u.failed_login_attempts || 0), 0)}
          </p>
          <p className="text-xs text-slate-400">Total Intentos Fallidos</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">Cliente</th>
              <th className="p-4 font-medium text-slate-300">Contacto</th>
              <th className="p-4 font-medium text-slate-300">Registro</th>
              <th className="p-4 font-medium text-slate-300">Seguridad</th>
              <th className="p-4 font-medium text-slate-300 w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                 <td colSpan={5} className="p-8 text-center text-slate-400">Cargando base de datos de clientes...</td>
              </tr>
            )}
            {!isLoading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {searchQuery ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'Aún no hay clientes registrados.'}
                </td>
              </tr>
            )}
            {!isLoading && filteredUsers.map((u) => {
              const locked = isLocked(u.login_locked_until);
              return (
                <tr key={u.id} onClick={() => router.push(`/users/clientes/${u.id}`)} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <span className="font-medium block group-hover:text-blue-400 transition-colors">{u.name}</span>
                         <span className="text-xs text-slate-400">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    <span className="text-sm flex items-center gap-2 text-slate-300">
                      <Mail size={14} className="text-blue-400" /> {u.email}
                    </span>
                    {u.phone && (
                       <span className="text-sm flex items-center gap-2 text-slate-400">
                         Tel: {u.phone}
                       </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                       <Clock size={14} className="text-slate-500" />
                       {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={cn(
                       "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                       locked ? "text-rose-400 bg-rose-400/10 border-rose-400/30" : "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
                    )}>
                      {locked ? <ShieldAlert size={14} /> : <CheckCircle size={14} />}
                      {locked ? 'Cuenta Bloqueada (DoS)' : 'Cuenta Transparente'}
                    </div>
                    {u.failed_login_attempts > 0 && !locked && (
                       <div className="text-xs text-amber-400 mt-2 font-medium">
                          {u.failed_login_attempts} intentos fallidos
                       </div>
                    )}
                  </td>
                  <td className="p-4">
                     <button
                       onClick={(e) => { e.stopPropagation(); handleDelete(u.id, u.name); }}
                       className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 relative z-10"
                       title="Eliminar cliente"
                     >
                       <Trash2 size={16} /> Eliminar
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
