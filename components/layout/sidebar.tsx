"use client";

import { 
  Home, 
  BarChart3, 
  Package, 
  MessageSquare, 
  Users, 
  PieChart, 
  Settings, 
  Activity, 
  Building2, 
  GitBranch,
  Ticket as TicketIcon,
  Gift as GiftIcon,
  Bell as BellIcon,
  Crown as CrownIcon,
  ShoppingCart,
  Clock4,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { LogOut as LogOutIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from 'next/navigation';

// Admin sidebar items (shown for non-employee users)
const adminSidebarItems = [
  // Main sections
  { icon: Home, label: "Dashboard", href: "/dashboard" },
 
  // Core business
  { icon: Package, label: "Productos", href: "/dashboard/productos" },
  { icon: Users, label: "Clientes", href: "/dashboard/clientes" },
  { icon: CrownIcon, label: "Membresías", href: "/dashboard/membresias" },
  { icon: TicketIcon, label: "Cupones", href: "/dashboard/cupones" },
 
  // Communication & Feedback
  { icon: MessageSquare, label: "Comentarios", href: "/dashboard/comentarios" },
  { icon: BellIcon, label: "Notificaciones", href: "/dashboard/notificaciones" },
  
  // Reports & Settings
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: PieChart, label: "Reportes", href: "/dashboard/reportes" },
  { icon: Building2, label: "Compañía", href: "/dashboard/compania" },
  { icon: GitBranch, label: "Sucursales", href: "/dashboard/sucursales" },

  // Empleados
  { icon: Users, label: "Empleados", href: "/dashboard/empleados" },
  { icon: ShoppingCart, label: "Punto de Venta", href: "/dashboard/pos" },
  { icon: Clock4, label: "Horarios", href: "/dashboard/horarios" },
  { icon: CreditCardIcon, label: "Nómina", href: "/dashboard/nomina" },

  { icon: Settings, label: "Configuración", href: "/dashboard/configuracion" },
];

// Employee sidebar items (only Point of Sale)
const employeeSidebarItems = [
  { icon: ShoppingCart, label: "Punto de Venta", href: "/dashboard/pos" }
];

export function Sidebar() {
  const { user, logout, isEmployee } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  
  // Use different sidebar items based on user role
  const sidebarItems = isEmployee ? employeeSidebarItems : adminSidebarItems;
  
  // Get user initials for avatar fallback
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'US';
  };
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-500">Panel de control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href || 
                         (pathname.startsWith(item.href) && item.href !== '/dashboard');
          return (
            <Button
              key={index}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${
                isActive 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.firebase_name || 'User'} />
            <AvatarFallback className="bg-emerald-100 text-emerald-600">
              {getUserInitials(user?.firebase_name, user?.firebase_email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.firebase_name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.firebase_email || 'usuario@ejemplo.com'}
            </p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={async () => {
            await logout();
            router.push('/auth/login');
          }}
        >
          <LogOutIcon className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
