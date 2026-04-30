'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/services/api';

function UnlockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No se proporcionó ningún token de seguridad.');
      return;
    }

    const unlock = async () => {
      try {
        await api.post('/portal/auth/unlock', { token });
        setStatus('success');
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'El enlace de recuperación es inválido o ha expirado.');
      }
    };

    unlock();
  }, [token]);

  return (
    <div className="w-full max-w-md p-8 glass flex flex-col items-center fade-in relative z-10 mx-4 shadow-xl border border-white/50 rounded-3xl bg-white/70 backdrop-blur-xl">
      
      {status === 'loading' && (
        <div className="flex flex-col items-center text-center space-y-4">
           <Loader2 className="animate-spin text-emerald-600" size={48} />
           <h1 className="text-xl font-bold text-slate-800">Verificando Credenciales...</h1>
           <p className="text-slate-500 text-sm">Por favor, espera un momento.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center animate-fade-in text-center">
           <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shrink-0 shadow-inner">
              <CheckCircle2 size={40} />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">¡Cuenta Desbloqueada!</h1>
           <p className="text-slate-500 text-sm mt-3 mb-8">
             Hemos limpiado los registros de seguridad. Ahora puedes iniciar sesión nuevamente o recuperar tu contraseña si lo necesitas.
           </p>
           <button onClick={() => router.push('/auth')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
             Volver a Iniciar Sesión <ArrowRight size={18} />
           </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center animate-fade-in text-center">
           <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0 shadow-inner">
              <AlertCircle size={40} />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Enlace Inválido</h1>
           <p className="text-slate-500 text-sm mt-3 mb-6">
             {errorMsg}
           </p>
           <button onClick={() => router.push('/auth')} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
             Ir a Seguridad <ArrowRight size={18} />
           </button>
        </div>
      )}

    </div>
  );
}

export default function UnlockAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-3xl" />
      
      <Suspense fallback={<div>Cargando módulo de seguridad...</div>}>
         <UnlockContent />
      </Suspense>
    </div>
  );
}
