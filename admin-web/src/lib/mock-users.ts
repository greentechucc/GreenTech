export type UserRole = 'Admin' | 'Asesor' | 'Proyectos' | 'Bodega' | 'Tecnico' | 'Soporte';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
}

// Rutas permitidas por rol
export const roleRoutes: Record<UserRole, string[]> = {
  Admin: ['/dashboard', '/crm', '/quotations', '/projects', '/inventory', '/permits', '/monitoring', '/billing', '/users', '/soporte'],
  Asesor: ['/dashboard', '/crm', '/quotations'],
  Proyectos: ['/dashboard', '/projects', '/permits'],
  Bodega: ['/dashboard', '/inventory'],
  Tecnico: ['/dashboard', '/projects', '/monitoring'],
  Soporte: ['/dashboard', '/soporte'],
};

// Colores de badge para cada rol
export const roleColors: Record<UserRole, string> = {
  Admin: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Asesor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  Proyectos: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  Bodega: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Tecnico: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Soporte: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
};

const STORAGE_KEY = 'greentech_users';

const defaultUsers: AppUser[] = [
  { id: 1, name: 'Administrador GreenTech', email: 'asesor@greentech.com', password: '12345', role: 'Admin', active: true },
  { id: 2, name: 'Carlos Ventas', email: 'asesor.ventas@greentech.com', password: '12345', role: 'Asesor', active: true },
  { id: 3, name: 'María Proyectos', email: 'proyectos@greentech.com', password: '12345', role: 'Proyectos', active: true },
  { id: 4, name: 'Juan Bodega', email: 'bodega@greentech.com', password: '12345', role: 'Bodega', active: true },
  { id: 5, name: 'Pedro Técnico', email: 'tecnico@greentech.com', password: '12345', role: 'Tecnico', active: true },
  { id: 6, name: 'Laura Soporte', email: 'soporte@greentech.com', password: '12345', role: 'Soporte', active: true },
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
    localStorage.setItem('greentech_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy');
  } else {
    localStorage.removeItem('greentech_current_user');
    localStorage.removeItem('greentech_token');
  }
}

export function logoutUser() {
  setCurrentUser(null);
}
