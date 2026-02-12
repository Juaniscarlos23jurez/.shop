"use client";

import {
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  UserCheck,
  Building,
  FileText,
  TrendingUp,
  CreditCard,
  Settings,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Bot,
  Megaphone,
  SettingsIcon,
  PieChart,
  Store,
  Receipt,
  DollarSign,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  Shield,
  Clock4,
  CreditCard as CreditCardIcon,
  Phone as PhoneIcon,
  Ticket as TicketIcon,
  Gift as GiftIcon,
  Crown as CrownIcon,
  Smartphone,
  Book,
  Building2,
  GitBranch,
  Activity,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useLayoutEffect, useEffect } from 'react'; // Import useState, useLayoutEffect and useEffect
import { ordersApi } from "@/lib/api/orders";
import { api } from "@/lib/api/api";
import { notificationService } from "@/lib/notifications";
import { NotificationToast, useNotificationToast } from "@/components/notifications/NotificationToast";

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  isCollapsible?: boolean;
  subItems?: SidebarItem[];
}

const WhatsAppIcon = () => (
  <svg
    className="h-5 w-5 text-[#25D366]"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Admin sidebar items (shown for non-employee users)
const adminSidebarItems: SidebarItem[] = [
  // Main sections
  { icon: Home, label: "Dashboard", href: "/dashboard" },

  // Core business
  { icon: Package, label: "Productos", href: "/dashboard/productos" },
  { icon: Package, label: "Stock", href: "/dashboard/stock" },
  // { icon: Bot, label: "Asistente IA", href: "/dashboard/ai-assistant" },
  {
    icon: ShoppingCart,
    label: "Punto de Venta",
    href: "#",
    isCollapsible: true,
    subItems: [
      { icon: ShoppingCart, label: "Punto de Venta", href: "/dashboard/pos" },
      { icon: Smartphone, label: "Terminal", href: "/dashboard/terminal" },
    ]
  },
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
      { icon: Bell, label: "Notificaciones", href: "/dashboard/notificaciones" },
      { icon: Megaphone, label: "Anuncios", href: "/dashboard/anuncios" }, // Changed from MessageSquare
      { icon: Book, label: "Comentarios", href: "/dashboard/comentarios" }, // Changed from MessageSquare
    ]
  },

  // WhatsApp Section
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    href: "#",
    isCollapsible: true,
    subItems: [
      { icon: BarChart3, label: "Dashboard", href: "/dashboard/whatsapp" },
      { icon: MessageSquare, label: "Inbox", href: "/dashboard/whatsapp/inbox" },
      { icon: Bot, label: "Automatización", href: "/dashboard/whatsapp/automatizacion" },
      { icon: Megaphone, label: "Campañas", href: "/dashboard/whatsapp/campanas" },
      { icon: SettingsIcon, label: "Configuración", href: "/dashboard/whatsapp/configuracion" },
      { icon: Shield, label: "Monitor", href: "/dashboard/whatsapp/monitor" },
    ]
  },

  // Componentes playground
  { icon: PieChart, label: "Diseño", href: "/dashboard/componentes" },

  // Web Section
  {
    icon: Store,
    label: "Web",
    href: "#",
    isCollapsible: true,
    subItems: [
      { icon: Globe, label: "Dominio", href: "/dashboard/web-shop-store/dominios" },
      { icon: Activity, label: "SEO", href: "/dashboard/web-shop-store/seo" },
      { icon: BarChart3, label: "Analíticas", href: "/dashboard/web-shop-store/analiticas" },
    ]
  },

  // Reports Section
  {
    icon: BarChart3,
    label: "Reportes",
    href: "#",
    isCollapsible: true,
    subItems: [
      { icon: PieChart, label: "Ventas", href: "/dashboard/reportes" },
      { icon: DollarSign, label: "Finanzas", href: "/dashboard/finanzas" },
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

  {
    icon: CreditCard,
    label: "Suscripción",
    href: "#",
    isCollapsible: true,
    subItems: [
      { icon: Package, label: "Planes", href: "/dashboard/suscripcion/planes" },
      { icon: Receipt, label: "Facturas", href: "/dashboard/suscripcion/facturas" },
      { icon: Settings, label: "Gestionar", href: "/dashboard/suscripcion/gestion" },
    ]
  },
];

// Employee sidebar items (only Point of Sale)
const employeeSidebarItems: SidebarItem[] = [
  {
    icon: ShoppingCart,
    label: "Punto de Venta",
    href: "#",
    isCollapsible: true,
    subItems: [
      { icon: ShoppingCart, label: "Punto de Venta", href: "/dashboard/pos" },
      { icon: Smartphone, label: "Terminal", href: "/dashboard/terminal" },
    ]
  }
];

import { useToast } from "@/hooks/use-toast";
import { useLockedPlan } from "@/hooks/use-locked-plan";

export function Sidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (collapsed: boolean) => void }) {
  const { user, token, logout, isEmployee, userRole } = useAuth();
  const { getPlanName } = useCompany();
  const { toast } = useToast();
  const { showLockedToast } = useLockedPlan();
  const router = useRouter();
  const pathname = usePathname() || '';

  // Notification toast hook
  const { notifications, showOrderNotification, dismissNotification } = useNotificationToast();

  // Use different sidebar items based on user role
  const isSales = userRole === 'employee_sales';
  const sidebarItems = isSales ? employeeSidebarItems : adminSidebarItems;

  // State for collapsible sections
  const [isAppSectionExpanded, setIsAppSectionExpanded] = useState(() => {
    const appSection = adminSidebarItems.find(item => item.label === 'App');
    if (appSection && appSection.subItems) {
      return appSection.subItems.some(subItem => {
        const baseHref = subItem.href.split('#')[0];
        return pathname.startsWith(baseHref) && baseHref !== '/dashboard/whatsapp';
      });
    }
    return false;
  });

  const [isPOSSectionExpanded, setIsPOSSectionExpanded] = useState(() => {
    const posSection = sidebarItems.find(item => item.label === 'Punto de Venta');
    if (posSection && posSection.subItems) {
      return posSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [isWhatsAppSectionExpanded, setIsWhatsAppSectionExpanded] = useState(() => {
    const whatsappSection = adminSidebarItems.find(item => item.label === 'WhatsApp');
    if (whatsappSection && whatsappSection.subItems) {
      return whatsappSection.subItems.some(subItem => pathname.startsWith(subItem.href));
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

  const [isWebSectionExpanded, setIsWebSectionExpanded] = useState(() => {
    const webSection = adminSidebarItems.find(item => item.label === 'Web');
    if (webSection && webSection.subItems) {
      return webSection.subItems.some(subItem => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const [isSuscripcionSectionExpanded, setIsSuscripcionSectionExpanded] = useState(() => {
    const suscripcionSection = adminSidebarItems.find(item => item.label === 'Suscripción');
    if (suscripcionSection && suscripcionSection.subItems) {
      return suscripcionSection.subItems.some(subItem => pathname.startsWith(subItem.href.split('#')[0]));
    }
    return false;
  });

  // Unified toggle function with auto-scroll logic
  const toggleSection = (label: string, e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    let isOpening = false;

    if (label === 'App') {
      setIsAppSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Punto de Venta') {
      setIsPOSSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'WhatsApp') {
      setIsWhatsAppSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Clientes') {
      setIsClientesSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Empleados') {
      setIsEmpleadosSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Compañía') {
      setIsCompaniaSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Reportes') {
      setIsReportesSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Web') {
      setIsWebSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    } else if (label === 'Suscripción') {
      setIsSuscripcionSectionExpanded((prev: boolean) => { isOpening = !prev; return !prev; });
    }

    // Scroll to the item if it's opening to ensure children are visible
    if (isOpening) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150); // Slightly more delay to allow the CSS transition to start
    }
  };

  const [pendingOrdersCount, setPendingOrdersCount] = useState<number | null>(null);
  const [companySlug, setCompanySlug] = useState<string | null>(null);
  const [hasNewOrderNotification, setHasNewOrderNotification] = useState(false);
  const [isNotificationMuted, setIsNotificationMuted] = useState(false);

  const slugifyCompanyName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        if (!user?.company_id || !token) return;

        const response = await ordersApi.getAllOrders(String(user.company_id), token, {
          status: 'pending',
          per_page: 50,
        });

        if (response.success && response.data) {
          const pagination = response.data;
          const ordersArray = pagination.data || [];
          const total = typeof pagination.total === 'number'
            ? pagination.total
            : Array.isArray(ordersArray)
              ? ordersArray.length
              : 0;

          // Check if we have new orders (count increased)
          const previousCount = pendingOrdersCount || 0;
          setPendingOrdersCount(total);

          // Play notification sound if there are pending orders (not muted)
          if (total > 0 && !isNotificationMuted) {
            notificationService.playNotificationSound();

            // Show toast notification for pending orders
            if (pathname !== '/dashboard/ordenes-pendientes') {
              const latestOrder = Array.isArray(ordersArray) && ordersArray.length > 0 ? ordersArray[0] : null;

              showOrderNotification({
                id: latestOrder?.id?.toString() || 'pending',
                customer_name: latestOrder?.user?.name || 'Cliente',
                total: latestOrder?.total || '0.00'
              });
            }
          }

          // If count increased and we're not already on the orders page, show notification indicator
          if (total > previousCount && pathname !== '/dashboard/ordenes-pendientes') {
            setHasNewOrderNotification(true);

            // Auto-hide the notification indicator after 5 seconds
            setTimeout(() => {
              setHasNewOrderNotification(false);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('[Sidebar] Error fetching pending orders count:', error);
        // Don't throw error, just log it to prevent breaking the UI
      }
    };

    fetchPendingOrdersCount();

    // Set up polling for new orders every 20 seconds
    const interval = setInterval(fetchPendingOrdersCount, 20000);

    return () => clearInterval(interval);
  }, [user?.company_id, token, pathname, isNotificationMuted]); // Removed pendingOrdersCount from dependencies

  // Fetch company slug for the public link
  useEffect(() => {
    const fetchCompanySlug = async () => {
      try {
        if (!token) return;
        const response = await api.userCompanies.get(token);
        if (response.success && response.data?.data?.name) {
          const name = response.data.data.name;
          setCompanySlug(slugifyCompanyName(name));
        }
      } catch (error) {
        console.error('[Sidebar] Error fetching company slug', error);
      }
    };

    fetchCompanySlug();
  }, [token]);

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
    <div className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo moved to TopBar */}
      <div className="h-4" /> {/* Spacer */}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== '/dashboard');

          if ('isCollapsible' in item && item.isCollapsible && 'subItems' in item) {
            const isAnySubItemActive = item.subItems?.some(subItem => pathname.startsWith(subItem.href));
            return (
              <div key={index} className="space-y-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-11 ${isCollapsed ? 'px-2' : ''} text-slate-600 hover:text-slate-900 hover:bg-slate-100`}
                  onClick={(e) => toggleSection(item.label, e)}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                  <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                  {!isCollapsed && (
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${(item.label === 'App' && isAppSectionExpanded) ||
                      (item.label === 'Punto de Venta' && isPOSSectionExpanded) ||
                      (item.label === 'WhatsApp' && isWhatsAppSectionExpanded) ||
                      (item.label === 'Clientes' && isClientesSectionExpanded) ||
                      (item.label === 'Empleados' && isEmpleadosSectionExpanded) ||
                      (item.label === 'Compañía' && isCompaniaSectionExpanded) ||
                      (item.label === 'Reportes' && isReportesSectionExpanded) ||
                      (item.label === 'Web' && isWebSectionExpanded) ||
                      (item.label === 'Suscripción' && isSuscripcionSectionExpanded)
                      ? 'rotate-180' : ''
                      }`} />
                  )}
                </Button>
                {!isCollapsed &&
                  ((item.label === 'App' && isAppSectionExpanded) ||
                    (item.label === 'Punto de Venta' && isPOSSectionExpanded) ||
                    (item.label === 'WhatsApp' && isWhatsAppSectionExpanded) ||
                    (item.label === 'Clientes' && isClientesSectionExpanded) ||
                    (item.label === 'Empleados' && isEmpleadosSectionExpanded) ||
                    (item.label === 'Compañía' && isCompaniaSectionExpanded) ||
                    (item.label === 'Reportes' && isReportesSectionExpanded) ||
                    (item.label === 'Web' && isWebSectionExpanded) ||
                    (item.label === 'Suscripción' && isSuscripcionSectionExpanded)) && (
                    <div className="ml-6 space-y-2">
                      {item.subItems?.map((subItem, subIndex) => {
                        const isSubItemActive = pathname === subItem.href ||
                          (subItem.href !== '/dashboard/whatsapp' && pathname.startsWith(subItem.href));

                        // Check for locked items in Basic Plan
                        const planName = getPlanName();
                        const isBasicPlan = planName === 'Básico';
                        const isLocked = (isBasicPlan && item.label === 'App' && subItem.label !== 'Comentarios') ||
                          (isBasicPlan && item.label === 'WhatsApp') ||
                          (isBasicPlan && item.label === 'Clientes' && subItem.label === 'Membresías') ||
                          (isBasicPlan && item.label === 'Empleados');

                        return (
                          <Button
                            key={subIndex}
                            variant={isSubItemActive && !isLocked ? "default" : "ghost"}
                            className={`w-full justify-start h-11 ${isSubItemActive && !isLocked
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
                              : isLocked
                                ? "text-slate-400 cursor-not-allowed hover:bg-transparent"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                            onClick={() => {
                              if (isLocked) {
                                showLockedToast();
                                return;
                              }
                              router.push(subItem.href);
                            }}
                          >
                            <subItem.icon className="h-5 w-5 mr-3" />
                            <span>{subItem.label}</span>
                            {isLocked && <Lock className="ml-auto h-4 w-4 opacity-50" />}
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
              {!isCollapsed && item.href === '/dashboard/ordenes-pendientes' && pendingOrdersCount !== null && pendingOrdersCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {pendingOrdersCount}
                </span>
              )}
              {!isCollapsed && item.href === '/dashboard/ordenes-pendientes' && hasNewOrderNotification && (
                <span className="ml-2">
                  <Bell className="h-4 w-4 text-emerald-600 animate-pulse" />
                </span>
              )}
              {!isCollapsed && item.href === '/dashboard/ordenes-pendientes' && pendingOrdersCount !== null && pendingOrdersCount > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotificationMuted(!isNotificationMuted);
                  }}
                  className="ml-2 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title={isNotificationMuted ? "Activar sonido" : "Silenciar notificaciones"}
                >
                  {isNotificationMuted ? (
                    <Bell className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Bell className="h-4 w-4 text-emerald-600" />
                  )}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User profile removed - moved to TopBar */}
    </div>
  );
}
