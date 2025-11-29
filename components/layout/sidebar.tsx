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
  CreditCard as CreditCardIcon,
  ChevronLeft, // Import ChevronLeft icon
  ChevronDown, // Import ChevronDown icon
  Phone as PhoneIcon, // Rename Phone to PhoneIcon to avoid conflict
  Smartphone, // Import Smartphone icon
  Megaphone, // Import Megaphone icon
  Book, // Import Book icon
  Store, // Import Store icon
} from 'lucide-react';
import { LogOut as LogOutIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useLayoutEffect, useEffect } from 'react'; // Import useState, useLayoutEffect and useEffect
import { ordersApi } from "@/lib/api/orders";

// Admin sidebar items (shown for non-employee users)
const adminSidebarItems = [
  // Main sections
  { icon: Home, label: "Dashboard", href: "/dashboard" },
 
  // Core business
  { icon: Package, label: "Productos", href: "/dashboard/productos" },
  { icon: ShoppingCart, label: "Punto de Venta", href: "/dashboard/pos" },
  { icon: Clock4, label: "Órdenes Pendientes", href: "/dashboard/ordenes-pendientes" },
  { icon: CreditCardIcon, label: "Metodos de cobro", href: "/dashboard/stripe" },

  // Clientes Section
  { 
    icon: Users, 
    label: "Clientes", 
    href: "#", 
    isCollapsible: true, 
    subItems: [
      { icon: Users, label: "Clientes", href: "/dashboard/clientes" },
      { icon: TicketIcon, label: "Cupones", href: "/dashboard/cupones" },
      { icon: CrownIcon, label: "Membresías", href: "/dashboard/membresias" },
      { icon: GiftIcon, label: "Puntos", href: "/dashboard/puntos" },
    //  { icon: CreditCardIcon, label: "Wallet / Pass", href: "/dashboard/wallet-pass" },
    ]
  },
  
  // Orders
 
  // Empleados Section
  { 
    icon: Users, 
    label: "Empleados", 
    href: "#", 
    isCollapsible: true, 
    subItems: [
      { icon: Users, label: "Cuentas de Empleados", href: "/dashboard/empleados" }, // Renamed from "Empleados"
      { icon: CreditCardIcon, label: "Nómina", href: "/dashboard/nomina" },
    ]
  },
 
  // App Section (newly grouped)
  { 
    icon: Smartphone, // Changed from Phone
    label: "App", 
    href: "#", // Placeholder href, will not be navigated directly
    isCollapsible: true, // Custom property to mark as collapsible
    subItems: [
      { icon: TicketIcon, label: "Promociones", href: "/dashboard/promociones" },
      { icon: BellIcon, label: "Notificaciones", href: "/dashboard/notificaciones" },
      { icon: Megaphone, label: "Anuncios", href: "/dashboard/anuncios" }, // Changed from MessageSquare
      { icon: Book, label: "Comentarios", href: "/dashboard/comentarios" }, // Changed from MessageSquare
     ]
  },

  // Componentes playground
  { icon: PieChart, label: "Componentes", href: "/dashboard/componentes"},
  
  // Web Shop Store (new top-level item)
  { icon: Store, label: "Web Shop Store", href: "/dashboard/web-shop-store" },

  // Reports Section
  { 
    icon: BarChart3, 
    label: "Reportes", 
    href: "#", 
    isCollapsible: true, 
    subItems: [
       { icon: PieChart, label: "Ventas", href: "/dashboard/reportes" },
    ]
  },
  
  // Compañía Section
  { 
    icon: Building2, 
    label: "Compañía", 
    href: "#", 
    isCollapsible: true, 
    subItems: [
      { icon: Building2, label: "Compañía", href: "/dashboard/compania" }, // Renamed from "Compañía"
      { icon: GitBranch, label: "Sucursales", href: "/dashboard/sucursales" },
    ]
  },

  { icon: Settings, label: "Configuración", href: "/dashboard/configuracion" },
];

// Employee sidebar items (only Point of Sale)
const employeeSidebarItems = [
  { icon: ShoppingCart, label: "Punto de Venta", href: "/dashboard/pos" }
];

export function Sidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (collapsed: boolean) => void }) {
  const { user, token, logout, isEmployee, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  
  // Use different sidebar items based on user role
  const isSales = userRole === 'employee_sales';
  const sidebarItems = isSales ? employeeSidebarItems : adminSidebarItems;

  // State for collapsible sections
  const [isAppSectionExpanded, setIsAppSectionExpanded] = useState(() => {
    const appSection = adminSidebarItems.find(item => item.label === 'App');
    if (appSection && appSection.subItems) {
      return appSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [isClientesSectionExpanded, setIsClientesSectionExpanded] = useState(() => {
    const clientesSection = adminSidebarItems.find(item => item.label === 'Clientes');
    if (clientesSection && clientesSection.subItems) {
      return clientesSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [isEmpleadosSectionExpanded, setIsEmpleadosSectionExpanded] = useState(() => {
    const empleadosSection = adminSidebarItems.find(item => item.label === 'Empleados');
    if (empleadosSection && empleadosSection.subItems) {
      return empleadosSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [isCompaniaSectionExpanded, setIsCompaniaSectionExpanded] = useState(() => {
    const companiaSection = adminSidebarItems.find(item => item.label === 'Compañía');
    if (companiaSection && companiaSection.subItems) {
      return companiaSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [isReportesSectionExpanded, setIsReportesSectionExpanded] = useState(() => {
    const reportesSection = adminSidebarItems.find(item => item.label === 'Reportes');
    if (reportesSection && reportesSection.subItems) {
      return reportesSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [pendingOrdersCount, setPendingOrdersCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        if (!user?.company_id || !token) return;

        const response = await ordersApi.getAllOrders(String(user.company_id), token, {
          status: 'pending',
          per_page: 50,
        });

        if (response.success && response.data) {
          const pagination = (response.data as any).data || response.data;
          const total = typeof pagination.total === 'number'
            ? pagination.total
            : Array.isArray(pagination)
            ? pagination.length
            : 0;
          setPendingOrdersCount(total);
        }
      } catch (error) {
        console.error('[Sidebar] Error fetching pending orders count', error);
      }
    };

    fetchPendingOrdersCount();
  }, [user?.company_id, token]);
   
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

  useLayoutEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 768) { // Adjust breakpoint as needed
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    updateSize(); // Set initial state
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [setIsCollapsed]);

  return (
    <div className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo and Toggle Button */}
      <div className={`p-6 border-b border-slate-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-500">Panel de control</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isCollapsed ? 'ml-0' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href || 
                         (pathname.startsWith(item.href) && item.href !== '/dashboard');

          if (item.isCollapsible) {
            const isAnySubItemActive = item.subItems?.some(subItem => pathname.startsWith(subItem.href));
            return (
              <div key={index} className="space-y-2">
                <Button
                  variant={isAnySubItemActive ? "default" : "ghost"}
                  className={`w-full justify-start h-11 ${isCollapsed ? 'px-2' : ''} ${ 
                    isAnySubItemActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    if (item.label === 'App') {
                      setIsAppSectionExpanded(!isAppSectionExpanded);
                    } else if (item.label === 'Clientes') {
                      setIsClientesSectionExpanded(!isClientesSectionExpanded);
                    } else if (item.label === 'Empleados') {
                      setIsEmpleadosSectionExpanded(!isEmpleadosSectionExpanded);
                    } else if (item.label === 'Compañía') {
                      setIsCompaniaSectionExpanded(!isCompaniaSectionExpanded);
                    } else if (item.label === 'Reportes') {
                      setIsReportesSectionExpanded(!isReportesSectionExpanded);
                    }
                  }}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                  <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                  {!isCollapsed && (
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${ 
                      (item.label === 'App' && isAppSectionExpanded) || 
                      (item.label === 'Clientes' && isClientesSectionExpanded) ||
                      (item.label === 'Empleados' && isEmpleadosSectionExpanded) ||
                      (item.label === 'Compañía' && isCompaniaSectionExpanded) ||
                      (item.label === 'Reportes' && isReportesSectionExpanded)
                        ? 'rotate-180' : ''
                    }`} />
                  )}
                </Button>
                {!isCollapsed && 
                 ((item.label === 'App' && isAppSectionExpanded) || 
                  (item.label === 'Clientes' && isClientesSectionExpanded) ||
                  (item.label === 'Empleados' && isEmpleadosSectionExpanded) ||
                  (item.label === 'Compañía' && isCompaniaSectionExpanded) ||
                  (item.label === 'Reportes' && isReportesSectionExpanded)) && (
                  <div className="ml-6 space-y-2">
                    {item.subItems?.map((subItem, subIndex) => {
                      const isSubItemActive = pathname.startsWith(subItem.href);
                      return (
                        <Button
                          key={subIndex}
                          variant={isSubItemActive ? "default" : "ghost"}
                          className={`w-full justify-start h-11 ${ 
                            isSubItemActive
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                          onClick={() => router.push(subItem.href)}
                        >
                          <subItem.icon className="h-5 w-5 mr-3" />
                          <span>{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Button
              key={index}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${isCollapsed ? 'px-2' : ''} ${ // Add px-2 for collapsed state
                isActive 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              onClick={() => router.push(item.href)}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
              <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
              {!isCollapsed && item.href === '/dashboard/ordenes-pendientes' && pendingOrdersCount !== null && (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {pendingOrdersCount}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-slate-200 mt-auto ${isCollapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.firebase_name || 'User'} />
            <AvatarFallback className="bg-emerald-100 text-emerald-600">
              {getUserInitials(user?.firebase_name, user?.firebase_email)}
            </AvatarFallback>
          </Avatar>
          <div className={`flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
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
          className={`w-full mt-4 justify-start text-red-600 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? 'justify-center' : ''}`}
          onClick={async () => {
            await logout();
            router.push('/auth/login');
          }}
        >
          <LogOutIcon className={`h-4 w-4 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
          <span className={`${isCollapsed ? 'hidden' : ''}`}>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
}
