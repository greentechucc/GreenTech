'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { authenticateUser, setCurrentUser } from '@/lib/mock-users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(r => setTimeout(r, 800));

      if (!email || !password) {
        setError('Por favor llena todos los campos');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/crm/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('greentech_token', data.access_token);
        setCurrentUser(data.user);
        router.push('/dashboard');
      } else {
        const errData = await res.json();
        setError(errData.message || 'Credenciales incorrectas o usuario inactivo');
      }
    } catch (err: any) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="bg-grid"></div>
      <div
        className="fixed top-[-50%] left-[-50%] w-[200%] h-[200%] -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1), transparent 60%)',
          animation: 'rotate 60s linear infinite'
        }}
      />

      <div className="glass p-8 w-full max-w-md relative z-10 transition-transform duration-500 ease-out translate-y-0 opacity-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 flex justify-center items-center gap-2">
            ☀️ <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-3xl tracking-tight">GreenTech</span>
          </div>
          <p className="text-slate-400 text-sm">Portal de Asesores y Operaciones</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="asesor@greentech.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center mb-2">Cuentas de demostración:</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
            <span className="text-amber-400/80">Admin:</span><span>admin@greentech.com</span>
            <span className="text-cyan-400/80">Asesor:</span><span>asesor.ventas@greentech.com</span>
            <span className="text-violet-400/80">Proyectos:</span><span>proyectos@greentech.com</span>
            <span className="text-orange-400/80">Bodega:</span><span>bodega@greentech.com</span>
            <span className="text-emerald-400/80">Técnico:</span><span>tecnico@greentech.com</span>
            <span className="text-emerald-400/80">Soporte:</span><span>soporte@greentech.com</span>
            <span className="text-slate-500 col-span-2 text-center mt-1">Contraseña: 12345</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
