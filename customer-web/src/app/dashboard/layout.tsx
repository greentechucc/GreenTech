'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Leaf, LogOut, LayoutDashboard, FileText, Sun, Zap, MessageSquare, User, Menu, X, Globe } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('customer_email');
    if (!savedEmail) {
      router.push('/');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Resumen', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Proyectos', path: '/dashboard/proyectos', icon: Sun },
    { label: 'Monitoreo', path: '/dashboard/monitoreo', icon: Zap },
    { label: 'Facturación', path: '/dashboard/pagos', icon: FileText },
    { label: 'Soporte', path: '/dashboard/soporte', icon: MessageSquare },
    { label: 'Global', path: '/dashboard/global', icon: Globe },
    { label: 'Mi Perfil', path: '/dashboard/perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Navbar */}
      <nav className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-md">
            <Leaf className="text-white" size={18}/>
          </div>
          <span className="font-bold text-lg text-slate-800">Mi Portal</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-500 hover:text-slate-800 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:w-64 md:flex-shrink-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header (Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="text-white" size={24}/>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">GreenTech</span>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}>
                 <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} /> 
                 {item.label}
              </Link>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User size={14} className="text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 truncate w-full">{email}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/'); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden min-h-screen relative flex flex-col pt-6 md:pt-10 pb-16">
        {/* Overlay when mobile menu is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        
        {children}
      </div>

    </div>
  );
}
