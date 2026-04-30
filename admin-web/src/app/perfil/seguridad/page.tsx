'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, KeyRound, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getCurrentUser, getUsers, saveUsers, setCurrentUser, type AppUser } from '@/lib/mock-users';

export default function AdminSeguridadPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu) {
      router.push('/login');
      return;
    }
    setUser(cu);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual.');
      return;
    }

    // Verify current password
    const allUsers = getUsers();
    const freshUser = allUsers.find(u => u.id === user!.id);
    if (!freshUser || freshUser.password !== currentPassword) {
      setError('La contraseña actual ingresada es incorrecta.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    // Update
    const updated = allUsers.map(u => {
      if (u.id === user!.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    saveUsers(updated);
    setCurrentUser({ ...user!, password: newPassword });
    setUser({ ...user!, password: newPassword });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 fade-in p-4 max-w-3xl mx-auto">
      <header className="mb-8">
        <Link href="/perfil" className="text-rose-400 hover:text-rose-300 font-bold mb-4 inline-flex items-center gap-2 transition-colors">
          <ArrowLeft size={16}/> Volver al Centro de Cuenta
        </Link>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Lock className="text-rose-400" size={32} />
          Seguridad de la Cuenta
        </h1>
        <p className="text-slate-400 text-lg">Protege tu cuenta administrativa modificando tu contraseña de acceso.</p>
      </header>

      <div className="glass p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {success ? (
          <div className="py-12 fade-in text-center relative z-10">
            <div className="w-24 h-24 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48} className="animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Contraseña Modificada!</h3>
            <p className="text-slate-400 mb-8 font-medium">Tu bóveda ha sido asegurada exitosamente. Usa tu nueva contraseña en los próximos accesos.</p>
            <button
              onClick={() => router.push('/perfil')}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg"
            >
              Cerrar y Volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm fade-in">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                <Lock size={16} className="text-rose-400" /> Contraseña Actual
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 px-5 text-slate-200 focus:outline-none focus:border-rose-500 transition-all text-lg tracking-widest"
                placeholder="••••••••"
              />
            </div>

            <div className="border-t border-slate-700/50 pt-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  <KeyRound size={16} className="text-rose-400" /> Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 px-5 text-slate-200 focus:outline-none focus:border-rose-500 transition-all text-lg tracking-widest"
                  placeholder="••••••••"
                />
                <p className="text-xs font-semibold text-slate-500 mt-2">Mínimo 6 caracteres requeridos.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-rose-400" /> Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 px-5 text-slate-200 focus:outline-none focus:border-rose-500 transition-all text-lg tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-3 text-lg mt-4"
            >
              Actualizar Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
