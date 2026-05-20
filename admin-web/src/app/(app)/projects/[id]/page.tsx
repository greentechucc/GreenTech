'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Circle, Clock, DollarSign, FileText, Users, MapPin, Calendar, Cpu, Edit, Briefcase, X, Activity } from 'lucide-react';
import api from '@/services/api';
import { getCurrentUser, type AppUser } from '@/lib/mock-users';

interface ProjectTask {
  id: number;
  name: string;
  done: boolean;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const projectId = params.id as string;

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/projects/${projectId}`);
      const p = res.data;
      setProject(p);
      if (p.tasks) {
        try {
          setTasks(JSON.parse(p.tasks));
        } catch {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check inventory if attempting to mark task 3 ("Adquisicion de materiales") as done
    if (taskId === 3 && !task.done && project.bom_json) {
      try {
        setSaving(true);
        const bom = typeof project.bom_json === 'string' ? JSON.parse(decodeURIComponent(project.bom_json)) : project.bom_json;
        // Si no está decodeado o es array real
        const finalBom = typeof bom === 'string' ? JSON.parse(bom) : bom;
        
        const res = await api.get('/inventory/inventory');
        const items = res.data;
        let missingItems = [];
        
        for (const line of finalBom) {
          const inv = items.find((i: any) => i.sku === line.sku);
          if (!inv || inv.stock < line.quantity) {
             missingItems.push(`${line.name} (Requiere: ${line.quantity} ${line.unit}, Stock: ${inv ? inv.stock : 0})`);
          }
        }
        
        if (missingItems.length > 0) {
          setAlertMsg(`Faltan artículos en el inventario para seguir con el proyecto. Productos sin stock suficiente:\n - ${missingItems.join('\n - ')}\n\nSugerencia: Ve a la sección de Inventario para reabastecer.`);
          setSaving(false);
          return;
        }
      } catch (e) {
        console.warn("Could not check inventory constraint", e);
      }
    }

    const updated = tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    setTasks(updated);
    setSaving(true);
    try {
      const res = await api.put(`/projects/projects/${projectId}/tasks`, { tasks: updated });
      if (res.data) {
        setProject(res.data);
      }
    } catch (err) {
      console.error('Error saving tasks:', err);
      // revert
      setTasks(tasks);
    } finally {
      setSaving(false);
    }
  };

  const completedCount = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const completion = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No definida';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (n: number) => `$${(n || 0).toLocaleString('en-US')}`;

  const statusStyles: Record<string, string> = {
    CREATED: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
    TECHNICAL_VISIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    DESIGN: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    PERMIT_PROCESS: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    APPROVED: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    IN_PROGRESS: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    INSTALLATION: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    GRID_CONNECTION: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
    COMPLETED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    ON_HOLD: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    CANCELLED: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-slate-400 text-lg animate-pulse">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-slate-400 text-lg">Proyecto no encontrado.</p>
        <button onClick={() => router.push('/projects')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Volver a Proyectos
        </button>
      </div>
    );
  }
  const handleBillingClick = async () => {
    try {
      const res = await api.get('/billing/billing/invoices');
      const facturas = Array.isArray(res.data) ? res.data : [];
      const hasInvoices = facturas.some((inv: any) => String(inv.project_id) === String(project.id) || String(inv.projectId) === String(project.id));
      if (hasInvoices) {
        router.push(`/billing/${project.id}`);
      } else {
        const cName = encodeURIComponent(project.customer_name || '');
        router.push(`/billing?customer_name=${cName}&projectId=${project.id || ''}&amount=${project.estimated_amount || ''}`);
      }
    } catch {
      const cName = encodeURIComponent(project.customer_name || '');
      router.push(`/billing?customer_name=${cName}&projectId=${project.id || ''}&amount=${project.estimated_amount || ''}`);
    }
  };

  const handlePermitsClick = async () => {
    try {
      const res = await api.get('/permits/permits');
      const tramites = Array.isArray(res.data) ? res.data : [];
      const permit = tramites.find((p: any) => String(p.project_id) === String(project.id) || String(p.projectId) === String(project.id));
      if (permit) {
        router.push(`/permits/${permit.id}`);
      } else {
        router.push(`/permits?projectId=${project.id || ''}`);
      }
    } catch {
      router.push(`/permits?projectId=${project.id || ''}`);
    }
  };

  const handleMonitoringClick = async () => {
    try {
      const res = await api.get('/monitoring/monitoring/inverters');
      const inverters = Array.isArray(res.data) ? res.data : [];
      const inverter = inverters.find((i: any) => String(i.project_id) === String(project.id) || String(i.projectId) === String(project.id));
      if (inverter) {
        router.push(`/monitoring/${inverter.id}`);
      } else {
        router.push(`/monitoring?projectId=${project.id || ''}`);
      }
    } catch {
      router.push(`/monitoring?projectId=${project.id || ''}`);
    }
  };

  return (
    <div className="fade-in p-4 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="mb-6">
        <button onClick={() => router.push('/projects')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a Proyectos
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light tracking-tight">{project.name || project.customer_name}</h1>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700 font-mono">#{project.id}</span>
            </div>
            <p className="text-slate-400">{project.customer_name} — {project.customer_email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusStyles[project.status] || statusStyles.CREATED}`}>
              {project.status?.replace(/_/g, ' ')}
            </span>
            {currentUser?.role !== 'Auxiliar' && currentUser?.role !== 'Tecnico' && currentUser?.role !== 'Proyectos' && (
              <button
                onClick={handleBillingClick}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl border border-cyan-500/30 flex items-center gap-2 text-sm font-medium transition-all"
              >
                <DollarSign size={16} /> Facturar
              </button>
            )}
            {currentUser?.role !== 'Auxiliar' && currentUser?.role !== 'Tecnico' && currentUser?.role !== 'Facturas' && (
              <button
                onClick={handlePermitsClick}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 px-4 py-2 rounded-xl border border-violet-500/30 flex items-center gap-2 text-sm font-medium transition-all"
              >
                <FileText size={16} /> Trámites
              </button>
            )}
            {currentUser?.role !== 'Facturas' && currentUser?.role !== 'Proyectos' && (
              <button
                onClick={handleMonitoringClick}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2 text-sm font-medium transition-all"
              >
                <Activity size={16} /> Monitoreo
              </button>
            )}
          </div>
        </div>
      </header>
      
      {alertMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-xl mb-6 flex items-start justify-between fade-in shadow-lg mx-auto w-full max-w-4xl">
          <div className="text-sm font-medium flex gap-2 whitespace-pre-line">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mt-1.5 shrink-0"></div>
            {alertMsg}
          </div>
          <button onClick={() => setAlertMsg('')} className="text-rose-500/60 hover:text-rose-500 transition-colors shrink-0 ml-4"><X size={18}/></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 pb-6 w-full max-w-7xl mx-auto">
        {/* Left Column — Project Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Card */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Progreso General</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-800" />
                <circle cx="60" cy="60" r="52" stroke="url(#progressGrad)" strokeWidth="8" fill="none"
                  strokeDasharray={`${completion * 3.27} 327`} strokeLinecap="round" className="transition-all duration-700" />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-white">{completion}%</p>
                <p className="text-xs text-slate-400">{completedCount}/{totalTasks}</p>
              </div>
            </div>
            {saving && <p className="text-xs text-center text-amber-400 animate-pulse">Guardando...</p>}
          </div>

          {/* Details Card */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Detalles del Proyecto</h3>
            <div className="space-y-3">
              {project.system_size && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Cpu size={16} /></div>
                  <div>
                    <p className="text-xs text-slate-500">Sistema</p>
                    <p className="text-sm text-white font-medium">{project.system_size}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500">Monto Estimado</p>
                  <p className="text-sm text-white font-medium">{formatCurrency(project.estimated_amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><Users size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500">Cuadrilla</p>
                  <p className="text-sm text-white font-medium">{project.assigned_crew || 'No asignada'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Calendar size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500">Inicio Planeado</p>
                  <p className="text-sm text-white font-medium">{formatDate(project.planned_start_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Calendar size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500">Fin Planeado</p>
                  <p className="text-sm text-white font-medium">{formatDate(project.planned_end_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500">Creado</p>
                  <p className="text-sm text-white font-medium">{formatDate(project.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Tasks Checklist */}
        <div className="lg:col-span-2">
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={16} className="text-emerald-400" /> Checklist de Tareas
              </h3>
              <span className="text-xs text-slate-500">{completedCount} de {totalTasks} completadas</span>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No hay tareas definidas para este proyecto.</p>
                <p className="text-sm mt-1">Edita el proyecto o crea uno nuevo para generar tareas automáticas.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    disabled={saving || currentUser?.role === 'Facturas'}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${
                      task.done
                        ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                        : 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600'
                    } ${saving ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      {task.done ? (
                        <CheckCircle2 size={24} className="text-emerald-400" />
                      ) : (
                        <Circle size={24} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium block ${task.done ? 'text-emerald-300 line-through opacity-70' : 'text-slate-200'}`}>
                        {task.name}
                      </span>
                    </div>
                    <span className={`text-xs font-mono flex-shrink-0 px-2 py-0.5 rounded ${task.done ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar at bottom */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progreso del Proyecto</span>
                <span className="text-emerald-400 font-bold">{completion}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
