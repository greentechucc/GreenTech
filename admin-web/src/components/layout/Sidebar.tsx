'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, FileText, Briefcase, 
  Package, CheckSquare, Activity, CreditCard, 
  LogOut, Shield, UserCircle, LifeBuoy, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser, roleRoutes, roleColors, type UserRole } from '@/lib/mock-users';

const allRoutes = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM & Clientes', path: '/crm', icon: Users },
  { name: 'Cotizaciones', path: '/quotations', icon: FileText },
  { name: 'Proyectos', path: '/projects', icon: Briefcase },
  { name: 'Inventario', path: '/inventory', icon: Package },
  { name: 'Trámites', path: '/permits', icon: CheckSquare },
  { name: 'Monitoreo', path: '/monitoring', icon: Activity },
  { name: 'Facturación', path: '/billing', icon: CreditCard },
  { name: 'Gestión de Usuarios', path: '/users', icon: Shield },
  { name: 'Soporte', path: '/soporte', icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadUser = () => {
      const user = getCurrentUser();
      if (user) {
        setUserRole(user.role);
        setUserName(user.name);
        setUserAvatar(user.avatar);
      } else {
        const token = localStorage.getItem('greentech_token');
        if (token) {
          setUserRole('Admin');
          setUserName('Administrador');
        }
      }
    };
    loadUser();

    // Listen for storage changes (e.g. login from another tab or when navigating)
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [pathname]);

  if (!mounted) return null;
  if (pathname === '/login') return null;

  const allowedPaths = userRole ? roleRoutes[userRole] : [];
  const filteredRoutes = allRoutes.filter(r => allowedPaths.includes(r.path));

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-40 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent flex items-center gap-2">
          ☀️ GreenTech
        </h2>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/50 rounded-lg border border-border"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={cn(
        "w-64 h-[calc(100vh-2rem)] border-r border-border glass flex flex-col m-4 rounded-2xl overflow-hidden fixed z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"
      )}>
        <div className="p-6 border-b border-border hidden md:block">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent flex items-center gap-2">
            ☀️ GreenTech
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {filteredRoutes.map((route) => {
            const isActive = pathname.startsWith(route.path);
            return (
              <Link 
                key={route.path} 
                href={route.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-emerald-500/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <route.icon size={20} />
                {route.name}
              </Link>
            );
          })}
        </div>

        {/* User info + Logout */}
        <div className="p-4 border-t border-border mt-auto space-y-3">
          {userRole && (
            <Link onClick={() => setIsOpen(false)} href="/perfil" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{userName}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold", roleColors[userRole])}>
                  {userRole}
                </span>
              </div>
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
