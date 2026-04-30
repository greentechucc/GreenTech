'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, KeyRound, AlertTriangle } from 'lucide-react';

import api from '@/services/api';

export default function PerfilSeguridadView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (newPassword.length < 8) {
       setErrorMsg('La contraseña nueva debe tener al menos 8 caracteres.');
       return;
    }
    if (newPassword !== confirmPassword) {
       setErrorMsg('Las contraseñas nuevas no coinciden.');
       return;
    }

    setLoading(true);
    try {
      await api.put('/portal/profile/password', {
        email,
        currentPass: currentPassword,
        newPass: newPassword
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 400) {
         setErrorMsg('La contraseña actual ingresada es incorrecta.');
      } else {
         setErrorMsg('Se produjo un error al cambiar la contraseña. Intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in pb-12">
      <header className="mb-8 text-center sm:text-left">
        <Link href="/dashboard/perfil" className="text-rose-500 hover:text-rose-600 font-bold mb-6 inline-flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Volver al Centro de Cuenta</Link>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center justify-center sm:justify-start gap-3">
          Seguridad de la Cuenta
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Protege tu cuenta de GreenTech modificando tu contraseña de acceso.</p>
      </header>

      <div className="glass p-8 sm:p-12 relative overflow-hidden">
        {/* Decoración Visual */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

        {success ? (
          <div className="py-12 fade-in text-center relative z-10">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48} className="animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">¡Contraseña Modificada!</h3>
            <p className="text-slate-500 mb-8 font-medium">Bóveda asegurada exitosamente. Usa tu nueva contraseña en tus próximos inicios de sesión.</p>
            <button 
              onClick={() => router.push('/dashboard/perfil')} 
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg"
            >
              Cerrar y Volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {errorMsg && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm fade-in border border-rose-200">
                 <AlertTriangle size={18} /> {errorMsg}
              </div>
            )}

            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                <Lock size={16} className="text-rose-500" /> Contraseña Actual
              </label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium text-lg tracking-widest"
                placeholder="••••••••"
              />
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-6">
               <div className="group">
                 <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                   <KeyRound size={16} className="text-rose-500" /> Nueva Contraseña
                 </label>
                 <input 
                   type="password" 
                   required
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium text-lg tracking-widest"
                   placeholder="••••••••"
                 />
                 <p className="text-xs font-semibold text-slate-400 mt-2">Mínimo 8 caracteres requeridos.</p>
               </div>

               <div className="group">
                 <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                   <ShieldCheck size={16} className="text-rose-500" /> Confirmar Nueva Contraseña
                 </label>
                 <input 
                   type="password" 
                   required
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium text-lg tracking-widest"
                   placeholder="••••••••"
                 />
               </div>
            </div>

            <button disabled={loading} type="submit" className="w-full mt-8 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-3 text-lg">
               {loading ? 'Encriptando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
