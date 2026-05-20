'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Shield, UserCircle, Mail, Key, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { getUsers, saveUsers, getCurrentUser, roleColors, type AppUser, type UserRole } from '@/lib/mock-users';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const ROLES: UserRole[] = ['Admin', 'Asesor', 'Proyectos', 'Bodega', 'Tecnico', 'Auxiliar', 'Facturas', 'Soporte'];

const roleDescriptions: Record<UserRole, string> = {
  Admin: 'Acceso total a todos los módulos del sistema',
  Asesor: 'Dashboard, CRM & Clientes, Cotizaciones',
  Proyectos: 'Dashboard, Proyectos, Trámites',
  Bodega: 'Dashboard, Inventario',
  Tecnico: 'Dashboard, Proyectos, Monitoreo',
  Auxiliar: 'Módulo de Proyectos Simplificado',
  Facturas: 'Dashboard, Facturación (Exclusivo)',
  Soporte: 'Dashboard, Gestión de Tickets de Clientes',
};

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: UserRole; active: boolean; crew_name?: string }>({
    name: '', email: '', password: '', role: 'Asesor', active: true, crew_name: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu || cu.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }
    setCurrentUser(cu);
    setUsers(getUsers());
  }, [router]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }
    return result;
  }, [users, searchQuery, roleFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'Asesor', active: true, crew_name: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (u: AppUser) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active, crew_name: u.crew_name || '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      setError('Nombre y correo son obligatorios');
      return;
    }
    if (!editingId && !form.password) {
      setError('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    let updatedUsers = [...users];

    // Check duplicate email
    const dupIdx = updatedUsers.findIndex(u => u.email === form.email && u.id !== editingId);
    if (dupIdx !== -1) {
      setError('Ya existe un usuario con ese correo electrónico');
      return;
    }

    if (editingId) {
      updatedUsers = updatedUsers.map(u => {
        if (u.id === editingId) {
          return {
            ...u,
            name: form.name,
            email: form.email,
            role: form.role,
            active: form.active,
            crew_name: form.crew_name,
            ...(form.password ? { password: form.password } : {}),
          };
        }
        return u;
      });
    } else {
      const maxId = updatedUsers.reduce((max, u) => Math.max(max, u.id), 0);
      updatedUsers.push({
        id: maxId + 1,
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        active: form.active,
        crew_name: form.crew_name,
      });
    }

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (currentUser && currentUser.id === id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }
    if (!window.confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;
    const updatedUsers = users.filter(u => u.id !== id);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  const toggleActive = (id: number) => {
    if (currentUser && currentUser.id === id) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }
    const updatedUsers = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.active).length;
    const byRole = ROLES.map(r => ({ role: r, count: users.filter(u => u.role === r).length }));
    return { total, active, inactive: total - active, byRole };
  }, [users]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 fade-in p-4 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <Shield className="text-amber-400" size={32} />
            Gestión de Usuarios (Empresa)
          </h1>
          <p className="text-slate-400">Administración de cuentas y roles internos del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/users')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all border border-slate-600"
          >
            Volver
          </button>
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Plus size={20} /> Nuevo Usuario
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
          <p className="text-xs text-slate-400">Activos</p>
        </div>
        {stats.byRole.map(({ role, count }) => (
          <div key={role} className="glass p-4 rounded-xl text-center">
            <p className={cn("text-2xl font-bold", roleColors[role].split(' ')[0])}>{count}</p>
            <p className="text-xs text-slate-400">{role}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${roleFilter ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 hover:bg-slate-800'}`}
          >
            <Shield size={18} /> Rol {roleFilter && '•'}
          </button>
          {showFilters && (
            <div className="absolute top-12 right-0 z-50 glass p-3 rounded-xl min-w-[200px] space-y-2 shadow-2xl border border-slate-700">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Filtrar por Rol</p>
              <button
                onClick={() => { setRoleFilter(''); setShowFilters(false); }}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${!roleFilter ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                Todos
              </button>
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => { setRoleFilter(r); setShowFilters(false); }}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${roleFilter === r ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(searchQuery || roleFilter) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Mostrando {filteredUsers.length} de {users.length} usuarios</span>
          <button onClick={() => { setSearchQuery(''); setRoleFilter(''); }} className="text-emerald-400 hover:text-emerald-300 underline ml-2">
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="flex-1 glass overflow-hidden rounded-2xl flex flex-col overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-border sticky top-0">
              <th className="p-4 font-medium text-slate-300">Usuario</th>
              <th className="p-4 font-medium text-slate-300">Correo</th>
              <th className="p-4 font-medium text-slate-300">Rol</th>
              <th className="p-4 font-medium text-slate-300">Estado</th>
              <th className="p-4 font-medium text-slate-300 w-48">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {searchQuery || roleFilter ? 'No se encontraron resultados.' : 'No hay usuarios registrados.'}
                </td>
              </tr>
            )}
            {filteredUsers.map(u => (
              <tr key={u.id} onClick={() => router.push(`/users/empresa/${u.id}`)} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium group-hover:text-emerald-400 transition-colors">{u.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm flex items-center gap-2 text-slate-300">
                    <Mail size={14} /> {u.email}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", roleColors[u.role])}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleActive(u.id); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all relative z-10",
                      u.active
                        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20'
                        : 'text-rose-400 bg-rose-400/10 border-rose-400/30 hover:bg-rose-400/20'
                    )}
                    title={u.active ? 'Click para desactivar' : 'Click para activar'}
                  >
                    {u.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {u.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(u); }}
                      className="text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg border border-blue-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 relative z-10"
                      title="Editar"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
                      className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg border border-red-400/30 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 relative z-10"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre Completo *</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="usuario@greentech.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Contraseña {editingId ? '(dejar vacío para mantener)' : '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Rol *</label>
            <div className="space-y-2">
              {ROLES.map(r => (
                <label
                  key={r}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    form.role === r
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:bg-slate-800/50'
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => setForm({ ...form, role: r })}
                    className="sr-only"
                  />
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", roleColors[r])}>
                    {r}
                  </span>
                  <span className="text-xs text-slate-400">{roleDescriptions[r]}</span>
                </label>
              ))}
            </div>
          </div>

          {(form.role === 'Tecnico' || form.role === 'Auxiliar') && (
            <div className="mt-4 p-4 border border-teal-500/30 bg-teal-500/5 rounded-xl">
              <label className="block text-sm text-teal-400 mb-2 font-medium">Asignación Logística (Cuadrilla)</label>
              <select 
                value={(form as any).crew_name || ''} 
                onChange={e => setForm({ ...form, crew_name: e.target.value } as any)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="">Ninguna / Automática</option>
                <option value="Cuadrilla Alfa (Norte)">Cuadrilla Alfa (Norte)</option>
                <option value="Cuadrilla Beta (Sur)">Cuadrilla Beta (Sur)</option>
                <option value="Cuadrilla Omega (Centro)">Cuadrilla Omega (Centro)</option>
                <option value="Subcontratista Energía Global">Subcontratista Energía Global</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Crucial para que este empleado pueda ver y operar sobre los proyectos específicos de su escuadrón.</p>
            </div>
          )}
          {editingId && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400">Estado:</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, active: !form.active })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                  form.active
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                    : 'text-rose-400 bg-rose-400/10 border-rose-400/30'
                )}
              >
                {form.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {form.active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!form.name || !form.email}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-2"
          >
            {editingId ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
