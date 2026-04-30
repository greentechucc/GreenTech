'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '@/services/api';

export default function RecuperarPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor ingresa un correo electrónico.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/portal/auth/forgot-password', { email });
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setErrorMsg('El código debe tener al menos 6 dígitos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/portal/auth/verify-reset-code', { email, code });
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/portal/auth/reset-password', { 
        email, 
        code, 
        newPass: newPassword 
      });
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Hubo un error al guardar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 glass flex flex-col items-center fade-in relative z-10 mx-4 shadow-xl border border-white/50 rounded-3xl bg-white/70 backdrop-blur-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 mb-6 group hover:scale-105 transition-transform duration-300">
          <ShieldCheck className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" size={32}/>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
          {step === 1 ? 'Recuperar Acceso' : step === 2 ? 'Verificar Código' : step === 3 ? 'Crear Nueva Contraseña' : '¡Contraseña Restablecida!'}
        </h1>
        <p className="text-slate-500 text-sm mt-2 text-center mb-8 px-4">
          {step === 1 
            ? 'Ingresa tu correo asociado y te enviaremos un código de seguridad de 6 dígitos.' 
            : step === 2 
            ? `Ingresa el código que enviamos a ${email}. Tienes intentos limitados.`
            : step === 3
            ? 'Crea tu nueva contraseña. Asegúrate de que sea tu preferida.'
            : 'Tu contraseña ha sido actualizada exitosamente. Ya puedes ingresar al portal.'}
        </p>

        {errorMsg && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm shadow-sm">
            <AlertCircle size={16} className="shrink-0" /> <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        <div className="w-full">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-slate-400" size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/80 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2 hover:scale-[1.02]">
                {loading ? 'Validando...' : (
                  <>Verificar Cuenta <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Código de Seguridad (6 dígitos)</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-4 text-center text-2xl tracking-[0.5em] text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold font-mono"
                  placeholder="------"
                />
              </div>

              <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2 hover:scale-[1.02]">
                {loading ? 'Validando...' : 'Confirmar Código'}
              </button>
            </form>
          )}
          
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-slate-400" size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-white/80 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="text-slate-400" size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full bg-white/80 border-2 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all font-medium ${confirmPassword && newPassword !== confirmPassword ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:border-emerald-500 focus:ring-emerald-500/10'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2 hover:scale-[1.02]">
                {loading ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center animate-fade-in space-y-6">
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle2 size={48} />
               </div>
               <button onClick={() => router.push('/auth')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all mt-4 hover:scale-[1.02]">
                 Volver a Iniciar Sesión <ArrowRight size={18} />
               </button>
            </div>
          )}
        </div>
        
        {step !== 4 && (
          <div className="mt-8 text-sm text-center">
             <button type="button" onClick={() => router.push('/auth')} className="text-slate-500 font-semibold hover:text-emerald-600 hover:underline inline-flex items-center gap-1 transition-colors">
                ← Regresar al login
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
