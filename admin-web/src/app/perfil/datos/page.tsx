'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { getCurrentUser, getUsers, saveUsers, setCurrentUser, type AppUser } from '@/lib/mock-users';

export default function AdminDatosPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu) {
      router.push('/login');
      return;
    }
    setUser(cu);
    setName(cu.name);
    setEmail(cu.email);
  }, [router]);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      setError('Nombre y correo son obligatorios.');
      return;
    }
    setError('');

    const allUsers = getUsers();
    // Check duplicate email
    const dup = allUsers.find(u => u.email === email && u.id !== user!.id);
    if (dup) {
      setError('Ya existe otro usuario con ese correo.');
      return;
    }

    const updated = allUsers.map(u => {
      if (u.id === user!.id) {
        return { ...u, name, email };
      }
      return u;
    });
    saveUsers(updated);

    // Update current user in session
    const newCurrent = { ...user!, name, email };
    setCurrentUser(newCurrent);
    setUser(newCurrent);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 fade-in p-4 max-w-3xl mx-auto">
      <header className="mb-8">
        <Link href="/perfil" className="text-emerald-400 hover:text-emerald-300 font-bold mb-4 inline-flex items-center gap-2 transition-colors">
          <ArrowLeft size={16}/> Volver al Centro de Cuenta
        </Link>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <User className="text-emerald-400" size={32} />
          Datos Personales
        </h1>
        <p className="text-slate-400 text-lg">Actualiza tu nombre y correo electrónico de acceso al sistema.</p>
      </header>

      <div className="glass p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm mb-6 fade-in">
            <CheckCircle size={18} /> Datos actualizados correctamente.
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm mb-6 fade-in">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <User size={16} className="text-emerald-400" /> Nombre Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-lg"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <Mail size={16} className="text-emerald-400" /> Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-lg"
              placeholder="usuario@greentech.com"
            />
            <p className="text-xs text-slate-500 mt-2">Este correo se usa para iniciar sesión en el panel.</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-lg mt-4"
          >
            <Save size={20} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
