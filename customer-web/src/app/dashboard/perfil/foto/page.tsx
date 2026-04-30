'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, User, CheckCircle2, Trash2 } from 'lucide-react';
import api from '@/services/api';

export default function PerfilFotoView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);

    // Fetch current avatar
    api.get(`/portal/profile/${encodeURIComponent(savedEmail)}`)
      .then((res) => {
        if (res.data && res.data.avatar_url) {
          setCurrentAvatar(res.data.avatar_url);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  const processUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
       try {
         await api.put('/portal/profile/photo', {
            email,
            avatarDataUrl: reader.result
         });
         setCurrentAvatar(reader.result as string);
         setSuccess(true);
       } catch (err) {
         console.error('Error subiendo foto:', err);
         alert('Error guardando la fotografía');
       } finally {
         setLoading(false);
       }
    };
    reader.onerror = () => {
       alert('Error leyendo el archivo local');
       setLoading(false);
    };
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('¿Deseas eliminar tu foto de perfil?')) return;
    try {
      await api.put('/portal/profile/photo', {
        email,
        avatarDataUrl: ''
      });
      setCurrentAvatar(null);
    } catch (err) {
      console.error('Error eliminando foto:', err);
      alert('Error al eliminar la fotografía.');
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full fade-in pb-12 text-center">
      <header className="mb-8">
        <Link href="/dashboard/perfil" className="text-indigo-500 hover:text-indigo-600 font-bold mb-6 inline-flex items-center gap-2 transition-colors mx-auto"><ArrowLeft size={16}/> Volver al Centro de Cuenta</Link>
        <h1 className="text-3xl font-black tracking-tight text-slate-800">Fotografía de Perfil</h1>
        <p className="text-slate-500 mt-2 text-lg">Sube una imagen para identificarte más fácilmente dentro del portal.</p>
      </header>

      {/* Current Photo Preview */}
      {currentAvatar && !success && (
        <div className="glass p-6 flex items-center gap-6 text-left">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 shrink-0 shadow-lg">
            <img src={currentAvatar} alt="Avatar actual" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-slate-800 font-bold text-lg">Foto actual</p>
            <p className="text-slate-500 text-sm">Puedes subir una nueva o eliminarla.</p>
          </div>
          <button
            onClick={handleRemovePhoto}
            className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl border-2 border-rose-200 transition-all flex items-center gap-2 text-sm font-bold"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}

      <div className="glass p-8 sm:p-12">
        {!success ? (
          <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative">
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleChange} />
            
            {/* Drop Zone */}
            <label 
              htmlFor="file-upload" 
              className={`flex flex-col items-center justify-center w-full h-80 rounded-3xl border-4 border-dashed transition-all cursor-pointer relative overflow-hidden ${
                dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                 <User size={300} />
              </div>
              
              {!loading ? (
                <>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors shadow-lg ${dragActive ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-white text-indigo-400'}`}>
                    <UploadCloud size={40} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${dragActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {dragActive ? '¡Suéltalo aquí!' : 'Haz clic o arrastra tu foto'}
                  </h3>
                  <p className="text-slate-500 font-medium">PNG, JPG o GIF (Máx. 5MB)</p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-indigo-600 font-bold">Procesando y recortando imagen...</p>
                </div>
              )}
            </label>
          </form>
        ) : (
          <div className="py-12 fade-in">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 relative overflow-hidden border-4 border-emerald-100 shadow-2xl">
              {currentAvatar ? (
                <img src={currentAvatar} alt="New avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="bg-emerald-50 text-emerald-500 w-full h-full flex items-center justify-center">
                  <CheckCircle2 size={64} className="animate-bounce" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">¡Fotografía Actualizada!</h3>
            <p className="text-slate-500 mb-10 text-lg">Tu imagen de perfil ha sido cambiada exitosamente.</p>
            <button 
              onClick={() => router.push('/dashboard/perfil')} 
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl"
            >
              Volver al Centro de Cuenta
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
