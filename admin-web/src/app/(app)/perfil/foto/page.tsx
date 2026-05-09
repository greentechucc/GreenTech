'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, User, CheckCircle2, Trash2 } from 'lucide-react';
import { getCurrentUser, getUsers, saveUsers, setCurrentUser, type AppUser } from '@/lib/mock-users';

export default function AdminFotoPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu) {
      router.push('/login');
      return;
    }
    setUser(cu);
    if (cu.avatar) setPreview(cu.avatar);
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
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB.');
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Save to mock users
      const allUsers = getUsers();
      const updated = allUsers.map(u => {
        if (u.id === user!.id) return { ...u, avatar: dataUrl };
        return u;
      });
      saveUsers(updated);
      const newUser = { ...user!, avatar: dataUrl };
      setCurrentUser(newUser);
      setUser(newUser);
      setPreview(dataUrl);
      setLoading(false);
      setSuccess(true);
    };
    reader.onerror = () => {
      alert('Error leyendo el archivo.');
      setLoading(false);
    };
  };

  const handleRemovePhoto = () => {
    if (!window.confirm('¿Deseas eliminar tu foto de perfil?')) return;
    const allUsers = getUsers();
    const updated = allUsers.map(u => {
      if (u.id === user!.id) return { ...u, avatar: undefined };
      return u;
    });
    saveUsers(updated);
    const newUser = { ...user!, avatar: undefined };
    setCurrentUser(newUser);
    setUser(newUser);
    setPreview(null);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 fade-in p-4 max-w-3xl mx-auto">
      <header className="mb-8">
        <Link href="/perfil" className="text-indigo-400 hover:text-indigo-300 font-bold mb-4 inline-flex items-center gap-2 transition-colors">
          <ArrowLeft size={16}/> Volver al Centro de Cuenta
        </Link>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          Fotografía de Perfil
        </h1>
        <p className="text-slate-400 text-lg">Sube una imagen para identificarte dentro del portal administrativo.</p>
      </header>

      {/* Current Photo Preview */}
      {preview && !success && (
        <div className="glass p-6 rounded-2xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-500/30 shrink-0">
            <img src={preview} alt="Avatar actual" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Foto actual</p>
            <p className="text-slate-400 text-sm">Puedes subir una nueva o eliminarla.</p>
          </div>
          <button
            onClick={handleRemovePhoto}
            className="text-rose-400 hover:text-rose-300 bg-rose-400/10 hover:bg-rose-400/20 px-4 py-2 rounded-xl border border-rose-400/30 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}

      <div className="glass p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {!success ? (
          <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative z-10">
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleChange} />
            
            <label 
              htmlFor="file-upload" 
              className={`flex flex-col items-center justify-center w-full h-72 rounded-2xl border-4 border-dashed transition-all cursor-pointer relative overflow-hidden ${
                dragActive ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                 <User size={250} />
              </div>
              
              {!loading ? (
                <>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors shadow-lg ${dragActive ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-slate-700 text-indigo-400'}`}>
                    <UploadCloud size={36} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${dragActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {dragActive ? '¡Suéltalo aquí!' : 'Haz clic o arrastra tu foto'}
                  </h3>
                  <p className="text-slate-500 font-medium">PNG, JPG o GIF (Máx. 5MB)</p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 border-4 border-slate-600 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-indigo-400 font-bold">Procesando imagen...</p>
                </div>
              )}
            </label>
          </form>
        ) : (
          <div className="py-12 fade-in text-center relative z-10">
            <div className="w-28 h-28 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              {preview ? (
                <img src={preview} alt="New avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <CheckCircle2 size={56} className="animate-bounce" />
              )}
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Fotografía Actualizada!</h3>
            <p className="text-slate-400 mb-8 font-medium">Tu imagen de perfil se ha cambiado exitosamente y ya es visible en la barra lateral.</p>
            <button 
              onClick={() => router.push('/perfil')} 
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg"
            >
              Volver al Centro de Cuenta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
