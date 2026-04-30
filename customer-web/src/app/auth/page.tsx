'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'register') {
        setIsRegistering(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const endpoint = isRegistering ? '/portal/auth/register' : '/portal/auth/login';
      const payload = isRegistering ? { email, name, password } : { email, password };
      
      const res = await api.post(endpoint, payload);
      
      const data = res.data;
      
      // Success
      localStorage.setItem('customer_email', data.email);
      localStorage.setItem('customer_name', data.name);
      router.push('/dashboard');

    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Error en la autenticación';
      setErrorMsg(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 glass flex flex-col items-center fade-in relative z-10 mx-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 group hover:scale-105 transition-transform duration-300">
          <Leaf className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" size={32}/>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Portal Solar</h1>
        <p className="text-slate-500 text-sm mt-2 text-center mb-6">
          {isRegistering ? 'Crea tu cuenta segura para acceder a tu plataforma.' : 'Ingresa con tu correo registrado para ver el estatus de tu proyecto y ahorros.'}
        </p>

        {errorMsg && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {isRegistering && (
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                placeholder="Tu nombre o empresa"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              placeholder="tu@correo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              placeholder="••••••••"
            />
            {!isRegistering && (
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => router.push('/auth/recuperar')} className="text-sm text-emerald-600 font-medium hover:underline hover:text-emerald-700 transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-4 group">
            {loading ? 'Procesando...' : isRegistering ? (
              <>Crear Cuenta <UserPlus size={18} className="group-hover:scale-110 transition-transform" /></>
            ) : (
              <>Ingresar al Portal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-sm text-center">
            <span className="text-slate-500">
               {isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
            </span>
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }} className="ml-1 text-emerald-600 font-semibold hover:underline">
               {isRegistering ? 'Inicia Sesión' : 'Regístrate aquí'}
            </button>
        </div>

        <p className="text-xs text-slate-400 mt-6">© 2026 GreenTech Energy Solutions</p>
      </div>
    </div>
  );
}
