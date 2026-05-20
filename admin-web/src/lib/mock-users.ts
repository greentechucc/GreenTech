export type UserRole = 'Admin' | 'Asesor' | 'Proyectos' | 'Bodega' | 'Tecnico' | 'Soporte' | 'Auxiliar' | 'Facturas';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  crew_name?: string;
}

// Rutas permitidas por rol
export const roleRoutes: Record<UserRole, string[]> = {
  Admin: ['/dashboard', '/crm', '/quotations', '/projects', '/inventory', '/permits', '/monitoring', '/billing', '/users', '/soporte'],
  Asesor: ['/dashboard', '/crm', '/quotations'],
  Proyectos: ['/dashboard', '/projects', '/permits'],
  Bodega: ['/dashboard', '/inventory'],
  Tecnico: ['/dashboard', '/projects', '/monitoring'],
  Soporte: ['/dashboard', '/soporte'],
  Auxiliar: ['/dashboard', '/projects', '/monitoring'],
  Facturas: ['/dashboard', '/projects', '/billing'],
};

// Colores de badge para cada rol
export const roleColors: Record<UserRole, string> = {
  Admin: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Asesor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  Proyectos: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  Bodega: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Tecnico: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Soporte: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  Auxiliar: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
  Facturas: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30',
};

const STORAGE_KEY = 'greentech_users_v4';

export const defaultUsers: AppUser[] = [
  { id: 1, name: 'Administrador GreenTech', email: 'admin@greentech.com', password: '12345', role: 'Admin', active: true },
  { id: 2, name: 'Carlos Ventas', email: 'asesor.ventas@greentech.com', password: '12345', role: 'Asesor', active: true },
  { id: 3, name: 'María Proyectos', email: 'proyectos@greentech.com', password: '12345', role: 'Proyectos', active: true },
  { id: 4, name: 'Juan Bodega', email: 'bodega@greentech.com', password: '12345', role: 'Bodega', active: true },
  { id: 5, name: 'Jefe Alfa (Norte)', email: 'tecnicocuadrillanorte@greentech.com', password: '12345', role: 'Tecnico', active: true, crew_name: 'Cuadrilla Alfa (Norte)' },
  { id: 6, name: 'Jefe Beta (Sur)', email: 'tecnicocuadrillasur@greentech.com', password: '12345', role: 'Tecnico', active: true, crew_name: 'Cuadrilla Beta (Sur)' },
  { id: 7, name: 'Jefe Omega (Centro)', email: 'tecnicocuadrillacentro@greentech.com', password: '12345', role: 'Tecnico', active: true, crew_name: 'Cuadrilla Omega (Centro)' },
  { id: 8, name: 'Jefe Subcontratista', email: 'tecnicosubcontratista@greentech.com', password: '12345', role: 'Tecnico', active: true, crew_name: 'Subcontratista Energía Global' },
  { id: 9, name: 'Laura Soporte', email: 'soporte@greentech.com', password: '12345', role: 'Soporte', active: true },
  { id: 30, name: 'Analista Facturas', email: 'facturas@greentech.com', password: '12345', role: 'Facturas', active: true },
  // Auxiliares Alfa
  { id: 10, name: 'Auxiliar Alfa 1', email: 'aux1.alfa@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Alfa (Norte)' },
  { id: 11, name: 'Auxiliar Alfa 2', email: 'aux2.alfa@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Alfa (Norte)' },
  { id: 12, name: 'Auxiliar Alfa 3', email: 'aux3.alfa@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Alfa (Norte)' },
  { id: 13, name: 'Auxiliar Alfa 4', email: 'aux4.alfa@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Alfa (Norte)' },
  { id: 14, name: 'Auxiliar Alfa 5', email: 'aux5.alfa@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Alfa (Norte)' },
  // Auxiliares Beta
  { id: 15, name: 'Auxiliar Beta 1', email: 'aux1.beta@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Beta (Sur)' },
  { id: 16, name: 'Auxiliar Beta 2', email: 'aux2.beta@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Beta (Sur)' },
  { id: 17, name: 'Auxiliar Beta 3', email: 'aux3.beta@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Beta (Sur)' },
  { id: 18, name: 'Auxiliar Beta 4', email: 'aux4.beta@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Beta (Sur)' },
  { id: 19, name: 'Auxiliar Beta 5', email: 'aux5.beta@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Beta (Sur)' },
  // Auxiliares Omega
  { id: 20, name: 'Auxiliar Omega 1', email: 'aux1.omega@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Omega (Centro)' },
  { id: 21, name: 'Auxiliar Omega 2', email: 'aux2.omega@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Omega (Centro)' },
  { id: 22, name: 'Auxiliar Omega 3', email: 'aux3.omega@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Omega (Centro)' },
  { id: 23, name: 'Auxiliar Omega 4', email: 'aux4.omega@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Omega (Centro)' },
  { id: 24, name: 'Auxiliar Omega 5', email: 'aux5.omega@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Cuadrilla Omega (Centro)' },
  // Auxiliares Subcontratista
  { id: 25, name: 'Auxiliar Sub 1', email: 'aux1.sub@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Subcontratista Energía Global' },
  { id: 26, name: 'Auxiliar Sub 2', email: 'aux2.sub@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Subcontratista Energía Global' },
  { id: 27, name: 'Auxiliar Sub 3', email: 'aux3.sub@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Subcontratista Energía Global' },
  { id: 28, name: 'Auxiliar Sub 4', email: 'aux4.sub@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Subcontratista Energía Global' },
  { id: 29, name: 'Auxiliar Sub 5', email: 'aux5.sub@greentech.com', password: '12345', role: 'Auxiliar', active: true, crew_name: 'Subcontratista Energía Global' },
];

// Helpers para persistencia con localStorage
export function getUsers(): AppUser[] {
  if (typeof window === 'undefined') return defaultUsers;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
}

export function saveUsers(users: AppUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function authenticateUser(email: string, password: string): AppUser | null {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password && u.active) || null;
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('greentech_current_user');
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export function setCurrentUser(user: AppUser | null) {
  if (user) {
    localStorage.setItem('greentech_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('greentech_current_user');
    localStorage.removeItem('greentech_token');
  }
}

export function logoutUser() {
  setCurrentUser(null);
}
