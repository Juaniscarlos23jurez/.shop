"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicWebApiClient } from '@/lib/api/public-web';
import { api } from '@/lib/api/api';
import { PublicItem, PublicCompanyLocation } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Dumbbell,
  Activity,
  Phone,
  Mail,
  Clock,
  Search,
  User,
  Download,
  Share2,
  X,
  Trophy,
  Calendar,
  MessageSquare,
  Send,
  CreditCard,
  Loader2,
  ChevronRight,
  Star,
  CheckCircle2,
  Gamepad2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils/currency';
import { CartProvider, useCart } from '@/lib/cart-context';
import { FloatingCartButton } from '@/components/cart/floating-cart-button';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { clientAuthApi } from '@/lib/api/client-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav as GymBottomNav, Section } from '@/components/gym/BottomNav';
import { PointsSection } from '@/components/gym/PointsSection';
import { PromotionsSection } from '@/components/gym/PromotionsSection';
import { CatalogCard } from '@/components/gym/CatalogCard';
import { WalletSection } from '@/components/gym/WalletSection';
import { CommentSheet } from '@/components/gym/CommentSheet';

// --- Types & Interfaces ---

interface ViewProps {
  user?: any;
  company?: any;
  userPoints?: number;
}

// --- Mock Views for Gym Modules ---

function GymActivityView({ user, company, userPoints }: ViewProps) {
  return (
    <div className="pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] overflow-hidden border-2 shadow-2xl">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            Resumen Atleta
          </CardTitle>
          <CardDescription className="text-zinc-400 font-medium">Progreso semanal detectado</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 text-center">
              <span className="text-3xl font-black text-white">{userPoints || 0}</span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Puntos Poder</p>
            </div>
            <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 text-center">
              <span className="text-3xl font-black text-blue-500">12</span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Sesiones</p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Actividades Recientes</h4>
            <div className="space-y-3">
              {[
                { title: 'Entrenamiento de Pecho', time: 'Ayer, 6:30 PM', dur: '55 min' },
                { title: 'Clase de Spinning', time: 'Lunes, 7:00 AM', dur: '45 min' },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50">
                  <div>
                    <p className="font-bold text-white text-sm">{act.title}</p>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">{act.time}</p>
                  </div>
                  <Badge className="bg-blue-600/10 text-blue-400 border-none font-black text-[10px] px-3">{act.dur}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Points Section Integration */}
      {company && (
        <PointsSection
          companyId={company?.id}
          pointRules={company?.point_rules || []}
          userPoints={userPoints || 0}
          companyName={company?.name}
        />
      )}

      {/* Power Level Summary */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 -mr-10 -mt-10">
          <Trophy className="h-40 w-40" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-80">Rango Actual</h3>
        <p className="text-4xl font-black tracking-tighter mb-4">ELITE WARRIOR</p>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-white w-[75%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Faltan 250 PTS para Master Level</p>
      </div>
    </div>
  );
}

function GymMessagingView() {
  return (
    <div className="pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] border-2 shadow-2xl h-[65vh] flex flex-col overflow-hidden">
        <CardHeader className="p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-blue-500 p-0.5">
              <AvatarImage src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&h=100&fit=crop" />
              <AvatarFallback>Coach</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-tighter">Coach Alex</CardTitle>
              <CardDescription className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                En línea
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="bg-zinc-800 p-4 rounded-[1.5rem] rounded-tl-none max-w-[85%] text-white text-sm font-medium leading-relaxed">
            ¡Hola! He ajustado tu rutina de hoy para enfocar un poco más en resistencia. ¿Cómo te sientes para la sesión de pierna?
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-[1.5rem] rounded-tr-none max-w-[85%] ml-auto text-white text-sm font-medium shadow-lg leading-relaxed">
            Perfecto coach, ya estoy en el box. ¡Vamos a darle con todo hoy! 🏋️‍♂️
          </div>
          <div className="bg-zinc-800 p-4 rounded-[1.5rem] rounded-tl-none max-w-[85%] text-white text-sm font-medium leading-relaxed">
            Excelente. Te veo en la zona de pesas en 5 minutos.
          </div>
        </CardContent>
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-3">
          <Input className="bg-zinc-900 border-zinc-800 text-white rounded-2xl h-14" placeholder="Escribe un mensaje al coach..." />
          <Button size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-2xl w-14 h-14 shadow-lg shadow-blue-600/20">
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function GymAttendanceView() {
  return (
    <div className="pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] border-2 shadow-2xl overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            Historial de Acceso
          </CardTitle>
          <CardDescription className="text-zinc-400 font-medium">Tus visitas al centro este mes</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="space-y-4">
            {[
              { date: '12 Feb 2024', time: '08:15 AM', status: 'Entrada confirmada' },
              { date: '11 Feb 2024', time: '06:30 PM', status: 'Entrada confirmada' },
              { date: '10 Feb 2024', time: '07:05 AM', status: 'Entrada confirmada' },
              { date: '08 Feb 2024', time: '05:45 PM', status: 'Entrada confirmada' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/30">
                <div className="flex gap-4 items-center">
                  <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{log.date}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{log.time}</p>
                  </div>
                </div>
                <Badge className="bg-blue-600/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-black px-3 py-1 rounded-lg">OK</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GymPaymentsView({ user, company }: ViewProps) {
  return (
    <div className="pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      {/* Wallet / Membership Info */}
      <WalletSection />

      <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] border-2 shadow-2xl overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-500" />
            Facturación y Pagos
          </CardTitle>
          <CardDescription className="text-zinc-400 font-medium">Control de tus transacciones</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="space-y-4">
            {[
              { id: '#PX-8921', date: '01 Feb 2024', title: 'Membresía Black', amount: '$1,299.00', status: 'Pagado' },
              { id: '#PX-7742', date: '15 Ene 2024', title: 'Suplementos Proteína', amount: '$850.00', status: 'Pagado' },
            ].map((pay, i) => (
              <div key={i} className="p-6 bg-zinc-950 rounded-[1.5rem] border border-zinc-800 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">{pay.id}</p>
                    <p className="text-xl font-black text-white tracking-tighter uppercase">{pay.title}</p>
                  </div>
                  <p className="text-xl font-black text-blue-500 tracking-tighter">{pay.amount}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
                  <span className="text-xs text-zinc-500 font-medium">{pay.date}</span>
                  <Badge className="bg-blue-600/10 text-blue-400 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">{pay.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Announcement = {
  id: number;
  company_id: number;
  title?: string;
  subtitle?: string;
  text?: string;
  link_url?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

type PublicCoupon = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: 'percentage' | 'fixed' | string;
  discount_amount?: number | null;
  discount_percentage?: number | null;
  min_purchase_amount?: string | number | null;
  expires_at?: string | null;
  company?: { id: number; name: string; logo_url?: string } | null;
};

// Simple localStorage cache helpers with TTL
function getCache<T = any>(key: string): { data: T; ts: number } | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCache<T = any>(key: string, data: T) {
  try {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({ data, ts: Date.now() });
    window.localStorage.setItem(key, payload);
  } catch {
    // ignore
  }
}

function isFresh(entry: { ts: number } | null, ttlMs: number) {
  if (!entry) return false;
  return Date.now() - entry.ts < ttlMs;
}

function PublicLocationProductsPageContent() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.companySlug as string;
  const locationId = params.locationId as string;
  const { addItem } = useCart();

  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<PublicCompanyLocation | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('workout');
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const [user, setUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [lastAnalyticsPayload, setLastAnalyticsPayload] = useState<any | null>(null);
  const [uiSettings, setUiSettings] = useState<any>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [initialProductId, setInitialProductId] = useState<string | null>(null);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Scroll Sync Refs
  const sectionRefs = {
    activity: useRef<HTMLDivElement>(null),
    workout: useRef<HTMLDivElement>(null),
    messaging: useRef<HTMLDivElement>(null),
    attendance: useRef<HTMLDivElement>(null),
    payments: useRef<HTMLDivElement>(null),
  };
  const isInternalScrollRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trackAnalyticsEvent = (eventName: string, params: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.gtag) {
      console.log('[Analytics Debug] gtag not available, event not sent:', eventName, params);
      return;
    }
    console.log('[Analytics Debug] Sending GA event:', eventName, params);
    window.gtag('event', eventName, params);
  };

  // Intersection Observer to sync Scroll -> Nav
  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Detect middle of viewport
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (isInternalScrollRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as Section);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [mounted, loading]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    isInternalScrollRef.current = true;

    const element = sectionRefs[section].current;
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    // Release internal scroll lock after animation
    setTimeout(() => {
      isInternalScrollRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('customer_token');
      if (token) {
        try {
          // 1. Try to get stored info first for speed
          const cachedProfile = getCache('user_profile_full');
          let userData = null;

          if (isFresh(cachedProfile, PROFILE_TTL) && cachedProfile?.data) {
            userData = cachedProfile.data;
            setUser(userData);
          } else {
            // Fallback to old raw cache if new one missing (migration)
            const storedInfo = localStorage.getItem('customer_info');
            if (storedInfo && !userData) {
              userData = JSON.parse(storedInfo);
              setUser(userData);
            }

            // Validate/Refresh with API
            const res = await clientAuthApi.getProfile(token);
            if (res.success && res.data) {
              userData = (res.data as any).data || res.data;
              setUser(userData);
              localStorage.setItem('customer_info', JSON.stringify(userData)); // Keep for backward compat if needed
              setCache('user_profile_full', userData);
            } else {
              // Token invalid
              localStorage.removeItem('customer_token');
              localStorage.removeItem('customer_info');
              setUser(null);
              return; // Stop here if auth failed
            }
          }

          // Check if following - REMOVED redundant call here, handled by checkFollow effect
          // We don't need to fetch here because the checkFollow effect will run as soon as user is set
          // and it handles caching and fetching.
        } catch (e) {
          console.error("Auth check failed", e);
        }
      }
    };
    checkAuth();
  }, []);

  // Read product from query string to open product modal directly when shared
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      const productId = url.searchParams.get('product');
      if (productId) {
        setInitialProductId(productId);
      }
    } catch (e) {
      console.warn('Error reading product from URL', e);
    }
  }, []);

  // Read cart from query string to pre-fill cart when shared
  useEffect(() => {
    if (typeof window === 'undefined' || !items || items.length === 0) return;

    try {
      const url = new URL(window.location.href);
      const cartParam = url.searchParams.get('cart');

      if (cartParam) {
        const cartData = JSON.parse(decodeURIComponent(cartParam)) as Array<{ id: string; q: number }>;

        // Agregar items al carrito
        cartData.forEach(({ id, q }) => {
          const product = items.find(item => String(item.id) === id);
          if (product) {
            // Agregar el producto q veces
            for (let i = 0; i < q; i++) {
              addItem(product as any);
            }
          }
        });

        // Limpiar el query param después de cargar
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('cart');
        window.history.replaceState({}, '', newUrl.toString());
      }
    } catch (e) {
      console.warn('Error reading cart from URL', e);
    }
  }, [items, addItem]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setShareUrl(window.location.href);
  }, []);

  // Analytics: track detailed view of this location
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!company || !location) return;

    const nav = window.navigator || ({} as Navigator);
    const screenInfo = typeof window !== 'undefined' ? window.screen : undefined;

    const deviceInfo = {
      user_agent: nav.userAgent,
      language: nav.language,
      languages: (nav as any).languages,
      platform: nav.platform,
      screen_width: screenInfo?.width,
      screen_height: screenInfo?.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      connection_type: (nav as any).connection?.effectiveType,
    };

    const locationInfo = {
      company_slug: companySlug,
      location_id: locationId,
      company_id: (company as any)?.id,
      company_name: (company as any)?.name,
      city: (location as any)?.city,
      state: (location as any)?.state,
      country: (location as any)?.country,
      timezone: (company as any)?.timezone || (location as any)?.timezone,
    };

    const userInfo = {
      user_id: user?.id,
      user_email: user?.email,
      user_name: user?.name,
    };

    const payload = {
      ...deviceInfo,
      ...locationInfo,
      ...userInfo,
      page_path: `/gym/${companySlug}/${locationId}`,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      event_time: new Date().toISOString(),
    };

    console.log('[Analytics Debug] View gym location payload:', payload);
    setLastAnalyticsPayload(payload);
    trackAnalyticsEvent('view_gym_location', payload);
  }, [company, location, user, companySlug, locationId]);

  // Check follow status when user and company are available
  useEffect(() => {
    const checkFollow = async () => {
      if (!user || !company) return;

      // Try cache first
      const cachedFollowed = getCache('followed_companies_list');
      if (cachedFollowed && Array.isArray(cachedFollowed.data)) {
        const isFollowed = cachedFollowed.data.some((c: any) => String(c.id) === String(company.id));
        setIsFollowing(isFollowed);
        return;
      }

      const token = localStorage.getItem('customer_token');
      if (!token) return;

      try {
        const res = await clientAuthApi.getFollowedCompanies(token);
        if (res.success && Array.isArray(res.data)) {
          const isFollowed = res.data.some((c: any) => String(c.id) === String(company.id));
          setIsFollowing(isFollowed);
          setCache('followed_companies_list', res.data);
        }
      } catch (e) {
        console.error("Error checking follow status", e);
      }
    };
    checkFollow();
  }, [user, company]);

  // Get user points when user and company are available
  useEffect(() => {
    const getUserPoints = async () => {
      if (!user || !company) return;

      const token = localStorage.getItem('customer_token');
      if (!token) return;

      try {
        const res = await clientAuthApi.getFollowedCompanies(token);
        if (res.success && Array.isArray(res.data)) {
          const currentCompany = res.data.find((c: any) => String(c.id) === String(company.id));
          if (currentCompany && typeof currentCompany.points_balance === 'number') {
            setUserPoints(currentCompany.points_balance);
          }
        }
      } catch (e) {
        console.error("Error getting user points", e);
      }
    };
    getUserPoints();
  }, [user, company]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_info');
    setUser(null);
    window.location.reload();
  };

  // Cache key builder and TTLs
  const baseKey = `plp:${companySlug}:${locationId}`;
  const COMPANY_TTL = 24 * 60 * 60 * 1000; // 24h
  const LOCATION_TTL = 24 * 60 * 60 * 1000; // 24h
  const ITEMS_TTL = 60 * 60 * 1000; // 1h
  const ANN_TTL = 30 * 60 * 1000; // 30m
  const PROFILE_TTL = 15 * 60 * 1000; // 15 minutes
  const FOLLOWED_TTL = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    if (!locationId) return;

    // 1) Try to hydrate from cache immediately
    const cachedCompany = getCache<any>(`${baseKey}:company`);
    const cachedLocation = getCache<PublicCompanyLocation>(`${baseKey}:location`);
    const cachedItems = getCache<PublicItem[]>(`${baseKey}:items_v2`);
    const cachedAnns = getCache<Announcement[]>(`${baseKey}:announcements`);

    const hasCompany = isFresh(cachedCompany, COMPANY_TTL) && !!cachedCompany?.data;
    const hasLocation = isFresh(cachedLocation, LOCATION_TTL) && !!cachedLocation?.data;
    const hasItems = isFresh(cachedItems, ITEMS_TTL) && Array.isArray(cachedItems?.data);
    const hasAnns = isFresh(cachedAnns, ANN_TTL) && Array.isArray(cachedAnns?.data);

    let currentCompany = hasCompany ? cachedCompany!.data : null;
    let currentLocation = hasLocation ? cachedLocation!.data : null;

    if (hasCompany) {
      if (currentCompany && currentCompany.slug && currentCompany.slug !== companySlug) {
        router.push(`/gym/${companySlug}`);
        return;
      }
      setCompany(cachedCompany!.data);
    }
    if (hasLocation) setLocation(cachedLocation!.data as PublicCompanyLocation);

    if (hasItems) {
      const normalized = cachedItems!.data as PublicItem[];
      setItems(normalized);
      const uniqueCategories = Array.from(new Set(
        normalized.map(i => i.category).filter(Boolean)
      )) as string[];
      setCategories(uniqueCategories);
    }

    if (hasAnns) setAnnouncements(cachedAnns!.data);

    // Check if we need to fetch point_rules even if we have company cached
    const needsPointRules = currentCompany && (!currentCompany.point_rules || currentCompany.point_rules.length === 0);

    // If we have core data (location, company, items), we can stop loading
    if (hasLocation && hasCompany && hasItems) {
      setLoading(false);
      // If we have everything including announcements and point_rules, we can skip fetch entirely
      if (hasAnns && !needsPointRules) return;
    }

    // 2) Fetch missing data
    const fetchData = async () => {
      // Only show full page loading if we are missing core data
      if (!hasLocation || !hasCompany || !hasItems) {
        setLoading(true);
      }

      setError(null);
      try {
        // Fetch Location if missing
        if (!hasLocation || !hasCompany) {
          const locationDetailsRes = await publicWebApiClient.getLocationDetailsById(locationId);
          if (locationDetailsRes.success && locationDetailsRes.data) {
            const responseData = locationDetailsRes.data as any;

            let loc: any = null;
            let comp: any = null;

            if (responseData.data) {
              loc = responseData.data.location;
              comp = responseData.data.company;
            } else if (responseData.location) {
              loc = responseData.location;
              comp = responseData.company;
            } else {
              loc = responseData;
            }

            console.log('🏢 Company data received:', {
              company: comp,
              logo_url: comp?.logo_url,
              logo_url_type: typeof comp?.logo_url,
              banner_url: comp?.banner_url
            });

            setLocation(loc as PublicCompanyLocation);
            setCompany(comp);

            // Verify if the location belongs to the company slug in the URL
            if (comp && comp.slug && comp.slug !== companySlug) {
              console.error(`Slug mismatch: URL has ${companySlug}, but location belongs to ${comp.slug}`);
              router.push(`/gym/${companySlug}`);
              return;
            }

            setCache(`${baseKey}:location`, loc as PublicCompanyLocation);
            setCache(`${baseKey}:company`, comp);

            currentLocation = loc;
            currentCompany = comp;
          } else {
            throw new Error(locationDetailsRes.error || 'Failed to fetch location details');
          }
        }

        // Fetch Items if missing
        if (!hasItems) {
          const itemsRes = await publicWebApiClient.getPublicItemsByLocationId(locationId);
          if (itemsRes.success && itemsRes.data) {
            let products: any[] = [];
            if ((itemsRes.data as any).data?.products) {
              products = (itemsRes.data as any).data.products;
            } else if ((itemsRes.data as any).products) {
              products = (itemsRes.data as any).products;
            } else if (Array.isArray(itemsRes.data)) {
              products = itemsRes.data;
            }

            if (Array.isArray(products)) {
              const normalized: PublicItem[] = products.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                description: p.description ?? '',
                price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0),
                points: typeof p.points === 'string' ? parseFloat(p.points) : p.points ?? undefined,
                image_url: p.image_url ?? undefined,
                category: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0]?.name : undefined,
                product_type: p.product_type,
              } as PublicItem));
              setItems(normalized);
              const uniqueCategories = Array.from(new Set(
                normalized.map(item => item.category).filter(Boolean)
              )) as string[];
              setCategories(uniqueCategories);
              setCache(`${baseKey}:items_v2`, normalized);
              console.log('Items loaded:', normalized);
            } else {
              setItems([]);
              setCache(`${baseKey}:items`, [] as PublicItem[]);
            }
          } else {
            throw new Error(itemsRes.error || 'Failed to fetch products for location');
          }
        }

        // Fetch Announcements if missing (and we have company ID)
        if (!hasAnns) {
          const comp = currentCompany;
          const loc = currentLocation;
          const companyId = (comp && (comp.id || comp.company_id)) || (loc && ((loc as any).company_id || ((loc as any).company && (loc as any).company.id)));

          if (companyId) {
            try {
              const url = `https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/public/companies/${companyId}/announcements`;
              const res = await fetch(url, { cache: 'no-store' });
              if (res.ok) {
                const json = await res.json();
                const rawList = (json?.data?.data ?? json?.data ?? []) as any[];
                const now = new Date();
                const active = rawList.filter(a => {
                  const isActive = a.is_active !== false;
                  const startsOk = !a.starts_at || new Date(a.starts_at) <= now;
                  const endsOk = !a.ends_at || new Date(a.ends_at) >= now;
                  return isActive && startsOk && endsOk;
                });
                setAnnouncements(active);
                setCache(`${baseKey}:announcements`, active);
              }
            } catch (e) {
              console.warn('Announcements fetch error', e);
            }
          }
        }

        // Fetch Company Details with point_rules if we have company ID and don't have point_rules yet
        const comp = currentCompany;
        const companyId = comp && (comp.id || comp.company_id);
        if (companyId && (!comp.point_rules || comp.point_rules.length === 0)) {
          try {
            console.log('🔄 Fetching company point rules for company:', companyId);
            const companyDetailsRes = await publicWebApiClient.getCompanyById(String(companyId));
            if (companyDetailsRes.success && companyDetailsRes.data) {
              const fullCompanyData = (companyDetailsRes.data as any).data || companyDetailsRes.data;
              // Merge point_rules into current company data
              const updatedCompany = {
                ...comp,
                point_rules: fullCompanyData.point_rules || [],
              };
              setCompany(updatedCompany);
              setCache(`${baseKey}:company`, updatedCompany);
              console.log('✅ Point rules loaded:', updatedCompany.point_rules);
            }
          } catch (e) {
            console.warn('Could not fetch company point rules', e);
          }
        }

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companySlug, locationId]);

  // Auto-rotate announcements
  useEffect(() => {
    // Reset index when announcements change
    setCurrentAnnouncement(0);
    if (!announcements || announcements.length <= 1) {
      if (rotationRef.current) {
        clearInterval(rotationRef.current);
        rotationRef.current = null;
      }
      return;
    }
    if (rotationRef.current) clearInterval(rotationRef.current);
    rotationRef.current = setInterval(() => {
      setCurrentAnnouncement((idx) => (idx + 1) % announcements.length);
    }, 5000);
    return () => {
      if (rotationRef.current) {
        clearInterval(rotationRef.current);
        rotationRef.current = null;
      }
    };
  }, [announcements]);

  // Fetch coupons when Payments section becomes active
  useEffect(() => {
    const shouldLoad = activeSection === 'payments';
    if (!shouldLoad) return;
    // Derive companyId from company or location
    const comp: any = company;
    const loc: any = location;
    const companyId = (comp && (comp.id || comp.company_id)) || (loc && (loc.company_id || (loc.company && loc.company.id)));
    if (!companyId) return;
    const loadCoupons = async () => {
      try {
        setCouponsError(null);
        setCouponsLoading(true);
        const url = `https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/public/companies/${companyId}/coupons`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Error al cargar cupones (${res.status})`);
        }
        const json = await res.json();
        const list = (json?.data ?? json ?? []) as any[];
        setCoupons(Array.isArray(list) ? list : []);
      } catch (e: any) {
        setCouponsError(e?.message || 'No se pudieron cargar los cupones');
      } finally {
        setCouponsLoading(false);
      }
    };
    loadCoupons();
  }, [activeSection, company, location]);

  // Load UI Settings (banner + popup)
  useEffect(() => {
    if (!company && !location) return;

    const comp: any = company;
    const loc: any = location;
    const companyId = (comp && (comp.id || comp.company_id)) || (loc && (loc.company_id || (loc.company && loc.company.id)));

    if (!companyId) return;

    const loadUiSettings = async () => {
      try {
        console.log('[UI Settings] Loading for company:', companyId, 'location:', locationId);
        const res = await api.uiSettings.getPublic({
          company_id: companyId,
          location_id: locationId,
          context: 'public_store_home',
        });

        console.log('[UI Settings] Response:', res);

        if (res.success && res.data) {
          const settings = res.data.data || res.data;
          setUiSettings(settings);
          console.log('[UI Settings] Loaded:', settings);

          // Auto-open popup every time if enabled
          if (settings?.popup_enabled) {
            setPopupOpen(true);
          }
        }
      } catch (e) {
        console.error('[UI Settings] Error loading:', e);
      }
    };

    loadUiSettings();
  }, [company, location, locationId]);

  // Filter products based on search and category
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [items, selectedCategory, searchQuery]);

  const renderNotFound = (message: string) => (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)] pointer-events-none" />
      <div className="relative max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-sm font-semibold tracking-wide uppercase">
          <MapPin className="h-4 w-4" />
          Ubicación no disponible
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-8 py-10 space-y-4 shadow-[0_25px_120px_rgba(16,185,129,0.25)]">
          <h1 className="text-3xl font-semibold">{message}</h1>
          <p className="text-base text-white/70 leading-relaxed">
            Puede que la sucursal haya cambiado de nombre, ya no esté activa o el enlace esté incompleto.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={companySlug ? `/gym/${companySlug}` : '/'}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              Ver otros gimnasios
            </Link>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Cargando productos de la sucursal...</div>;
  }

  if (error && typeof error === 'string' && error.toLowerCase().includes('location not found')) {
    return renderNotFound('No encontramos esta sucursal.');
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }

  if (!location) {
    return renderNotFound('Sucursal no encontrada.');
  }

  return (
    <div
      className="min-h-screen pb-32 relative overflow-x-hidden bg-zinc-950 text-white scroll-smooth"
      style={{ backgroundColor: uiSettings?.background_color ?? '#09090b' }}
    >
      {/* Banner from UI Settings */}
      {uiSettings?.banner_enabled && uiSettings.banner_text && (
        <div
          className="w-full py-3 px-4 text-center text-white font-bold shadow-md uppercase tracking-wider sticky top-0 z-[60]"
          style={{ backgroundColor: uiSettings.banner_color || '#2563eb' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
            <span>{uiSettings.banner_text}</span>
            {uiSettings.banner_button_label && uiSettings.banner_button_url && (
              <a
                href={uiSettings.banner_button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-colors"
              >
                {uiSettings.banner_button_label}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Header Buttons (Left & Right Sides) */}

      {/* Login/User Button (Right Side) + Descargar app */}
      <div className="fixed top-16 right-6 z-50 flex items-center gap-3">
        {user ? (
          <>
            <Button
              className="gap-2 shadow-xl text-white rounded-full h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm font-semibold flex hover:opacity-90 transition-opacity"
              style={{ backgroundColor: uiSettings?.download_app_color || '#059669' }}
              onClick={() => {
                if (typeof window === 'undefined') return;

                trackAnalyticsEvent('download_app_click', {
                  location: 'top_right_logged_in',
                  company_slug: companySlug,
                  location_id: locationId,
                  user_logged_in: !!user,
                });

                const IOS_URL = 'https://apps.apple.com/us/app/rewin-reward/id6748548104';
                const ANDROID_URL = process.env.NEXT_PUBLIC_ANDROID_URL ||
                  'https://play.google.com/store/apps/details?id=com.fynlink.BoostYou';

                const userAgent = window.navigator.userAgent || '';
                const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
                const isAndroid = /Android/i.test(userAgent);

                const targetUrl = isIOS ? IOS_URL : ANDROID_URL;
                window.location.href = targetUrl;
              }}
            >
              <Download className="h-4 w-4" />
              <span className="sm:hidden">App</span>
              <span className="hidden sm:inline">Descargar app</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 sm:gap-3 shadow-xl bg-zinc-900 text-blue-400 hover:bg-zinc-800 hover:text-blue-300 border-2 border-zinc-800 rounded-full pl-2 sm:pl-3 pr-4 sm:pr-6 h-10 sm:h-16 text-sm sm:text-lg">
                  <Avatar className="h-7 w-7 sm:h-11 sm:w-11 border-2 border-blue-500/50">
                    <AvatarImage src={user.profile_photo_path || user.avatar_url || user.photo_url} />
                    <AvatarFallback className="bg-zinc-800 text-blue-400 font-black">
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold max-w-[80px] sm:max-w-[140px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/gym/${companySlug}/${locationId}/profile`)}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Mis Pedidos en desarrollo")}>
                  Mis Pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold cursor-pointer">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href={`/gym/${companySlug}/${locationId}/login`}>
            <Button className="gap-2 sm:gap-3 shadow-2xl bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 sm:px-10 h-10 sm:h-16 text-sm sm:text-xl font-black uppercase tracking-widest transition-all scale-100 hover:scale-105 active:scale-95 shadow-blue-600/20">
              <User className="h-4 w-4 sm:h-6 sm:w-6" />
              Entrar
            </Button>
          </Link>
        )}
      </div>

      {/* Hero Section with Banner */}
      {
        company?.banner_url && (
          <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
            <img
              src={company.banner_url}
              alt={company.name || 'Banner'}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Error loading company banner:', company.banner_url);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )
      }

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20">
        {/* Profile Card / Header */}
        <div className="relative mb-16 text-center">
          {/* Logo container */}
          <div className="flex flex-col items-center">
            {company?.logo_url ? (
              <div className="relative mb-8 group">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-700 animate-pulse" />
                <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-zinc-900 shadow-2xl overflow-hidden bg-zinc-900 flex items-center justify-center p-4">
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                    onLoad={() => {
                      console.log('✅ Logo image loaded successfully:', company?.logo_url);
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.error('❌ Logo failed to load:', company?.logo_url);
                      img.src = '/default-logo.png'; // Fallback if available
                    }}
                  />
                </div>

                {/* Follow Button */}
                {user && company && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center z-10">
                    <Button
                      className={`group gap-2 shadow-lg border-2 h-10 px-6 text-sm font-bold rounded-full transition-all uppercase tracking-tight ${isFollowing
                        ? 'bg-zinc-900/90 backdrop-blur-md text-blue-400 border-blue-400/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50'
                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        }`}
                      onClick={() => {
                        // Toggle logic handled partially here, would need API call
                        setIsFollowing(!isFollowing);
                      }}
                    >
                      {isFollowing ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 group-hover:hidden" />
                          <span className="group-hover:hidden">Siguiendo</span>
                          <X className="h-4 w-4 hidden group-hover:inline" />
                          <span className="hidden group-hover:inline">Dejar de seguir</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Seguir</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-zinc-900 bg-zinc-900 flex items-center justify-center mb-8 shadow-2xl">
                <Dumbbell className="h-16 w-16 md:h-24 md:w-24 text-zinc-800" />
              </div>
            )}

            {/* Location Info */}
            <div className="flex-1 w-full pt-4">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 break-words uppercase tracking-tighter">
                {location.name}
              </h1>
              {company?.description && (
                <p className="text-zinc-500 mb-6 font-medium max-w-2xl mx-auto text-lg leading-relaxed">{company.description}</p>
              )}

              {/* Contact Info - Buttons (Icon Only) */}
              <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
                {location.address && (
                  <Button
                    size="icon"
                    variant="outline"
                    title={location.address}
                    className="h-14 w-14 rounded-full bg-zinc-900/50 border-zinc-800 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-lg"
                    onClick={() => {
                      const lat = (location as any).latitude;
                      const lng = (location as any).longitude;
                      let url = '';
                      if (lat && lng) {
                        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
                      } else {
                        const addr = `${location.address}, ${location.city}, ${location.state}, ${location.country}`;
                        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
                      }
                      window.open(url, '_blank');
                    }}
                  >
                    <MapPin className="h-6 w-6" />
                  </Button>
                )}
                {(location as any).phone && (
                  <a href={`tel:${(location as any).phone}`}>
                    <Button
                      size="icon"
                      variant="outline"
                      title={(location as any).phone}
                      className="h-14 w-14 rounded-full bg-zinc-900/50 border-zinc-800 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-lg"
                    >
                      <Phone className="h-6 w-6" />
                    </Button>
                  </a>
                )}
                {(location as any).email && (
                  <a href={`mailto:${(location as any).email}`}>
                    <Button
                      size="icon"
                      variant="outline"
                      title={(location as any).email}
                      className="h-14 w-14 rounded-full bg-zinc-900/50 border-zinc-800 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-lg"
                    >
                      <Mail className="h-6 w-6" />
                    </Button>
                  </a>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  title="Comentar"
                  className="h-14 w-14 rounded-full bg-zinc-900/50 border-zinc-800 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-lg"
                  onClick={() => setCommentSheetOpen(true)}
                >
                  <MessageSquare className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  title="Compartir"
                  className="h-14 w-14 rounded-full bg-zinc-900/50 border-zinc-800 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-lg"
                  onClick={() => {
                    if (typeof window === 'undefined') return;
                    const baseText = `${company?.name || location.name} - ${company?.description || 'Entrena con los mejores en Rewin Gym'}`;
                    const url = shareUrl || window.location.href;
                    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${baseText} ${url}`)}`;
                    window.open(waUrl, '_blank');
                  }}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- STACKED SECTIONS --- */}
        <div className="space-y-32">
          {/* 1. Activity Section */}
          <div id="activity" ref={sectionRefs.activity} className="scroll-mt-32">
            <GymActivityView user={user} company={company} userPoints={userPoints} />
          </div>

          {/* 2. Workout Section (Catalog) */}
          <div id="workout" ref={sectionRefs.workout} className="scroll-mt-32">
            {/* Announcements Carousel */}
            {announcements.length > 0 && (
              <div className="mb-10">
                <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl bg-zinc-900 border-2 border-zinc-800">
                  {announcements[currentAnnouncement]?.image_url ? (
                    <img
                      src={announcements[currentAnnouncement].image_url as string}
                      alt={announcements[currentAnnouncement]?.title || 'Anuncio'}
                      className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] object-cover transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                      <Sparkles className="h-20 w-20 text-blue-500/20" />
                    </div>
                  )}

                  {(announcements[currentAnnouncement]?.title || announcements[currentAnnouncement]?.text) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex items-end">
                      <div className="text-white max-w-2xl">
                        {announcements[currentAnnouncement]?.title && (
                          <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-2">
                            {announcements[currentAnnouncement].title}
                          </h3>
                        )}
                        {announcements[currentAnnouncement]?.text && (
                          <p className="mt-1 text-sm sm:text-lg opacity-80 font-medium leading-relaxed">
                            {announcements[currentAnnouncement].text}
                          </p>
                        )}
                        {announcements[currentAnnouncement]?.link_url && (
                          <Button
                            className="mt-6 font-black bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl shadow-xl uppercase tracking-widest text-base"
                            onClick={() => window.open(announcements[currentAnnouncement].link_url as string, '_blank')}
                          >
                            VER PROMO
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Catalog */}
            <div className="pb-16">
              <Card className="flex flex-col md:block bg-zinc-900 border-zinc-800 shadow-2xl rounded-[3rem] border-2 overflow-hidden">
                <CardHeader className="p-8 sm:p-12 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                    <div>
                      <CardTitle className="flex items-center text-4xl text-white font-black uppercase tracking-tighter">
                        <ShoppingBag className="mr-4 h-10 w-10 text-blue-500" /> PLANES DE PODER
                      </CardTitle>
                      <CardDescription className="text-zinc-500 text-xl mt-2 font-medium">
                        {items.length} programas diseñados para tu evolución
                      </CardDescription>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-10">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-7 w-7 text-zinc-600" />
                    <Input
                      type="text"
                      placeholder="Buscar tu próximo nivel..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-16 pr-6 py-8 h-20 text-xl w-full bg-zinc-950 border-zinc-800 text-white rounded-3xl placeholder:text-zinc-700 focus:ring-blue-500 border-2"
                    />
                  </div>

                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Badge
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all px-6 py-3 text-sm rounded-full font-black uppercase tracking-widest ${selectedCategory === 'all'
                          ? `text-white ${!uiSettings?.cart_button_color ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : ''}`
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700'
                          }`}
                        style={selectedCategory === 'all' && uiSettings?.cart_button_color ? { backgroundColor: uiSettings.cart_button_color } : {}}
                        onClick={() => setSelectedCategory('all')}
                      >
                        Todo ({items.length})
                      </Badge>
                      {categories.map((category) => {
                        const count = items.filter(item => item.category === category).length;
                        const isCurrentActive = selectedCategory === category;
                        return (
                          <Badge
                            key={category}
                            variant={isCurrentActive ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all px-6 py-3 text-sm rounded-full font-black uppercase tracking-widest ${isCurrentActive
                              ? `text-white ${!uiSettings?.cart_button_color ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : ''}`
                              : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700'
                              }`}
                            style={isCurrentActive && uiSettings?.cart_button_color ? { backgroundColor: uiSettings.cart_button_color } : {}}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category} ({count})
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-8 pt-0">
                  {items.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950/50 rounded-[2.5rem] border-2 border-dashed border-zinc-800">
                      <Activity className="h-20 w-20 text-zinc-800 mx-auto mb-6" />
                      <p className="text-zinc-600 text-xl font-black uppercase tracking-widest">Sin planes activos</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950/50 rounded-[2.5rem] border-2 border-dashed border-zinc-800">
                      <Search className="h-20 w-20 text-zinc-800 mx-auto mb-6" />
                      <p className="text-zinc-600 text-xl font-black uppercase tracking-widest">No hay coincidencias</p>
                      <Button
                        variant="link"
                        className="mt-4 text-blue-500 font-bold"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                      >
                        REESTABLECER FILTROS
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {filteredItems.map((item) => (
                        <CatalogCard
                          key={item.id}
                          item={item}
                          locationId={Number(location.id)}
                          phone={(location as any)?.phone ?? company?.phone}
                          initialOpen={initialProductId === String(item.id)}
                          pointRules={company?.point_rules || null}
                          userPoints={userPoints}
                          buttonColor={uiSettings?.cart_button_color}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. Messaging Section */}
          <div id="messaging" ref={sectionRefs.messaging} className="scroll-mt-32">
            <GymMessagingView />
          </div>

          {/* 4. Attendance Section */}
          <div id="attendance" ref={sectionRefs.attendance} className="scroll-mt-32">
            <GymAttendanceView />
          </div>

          {/* 5. Payments Section */}
          <div id="payments" ref={sectionRefs.payments} className="scroll-mt-32">
            <GymPaymentsView user={user} company={company} />
          </div>
        </div>
      </div>

      <FloatingCartButton
        onClick={() => setCartOpen(true)}
        isHidden={cartOpen}
        backgroundColor={uiSettings?.cart_button_color}
        iconColor={uiSettings?.cart_icon_color}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        locationPhone={(location as any)?.phone ?? company?.phone}
        locationName={location?.name}
        userPoints={userPoints}
        userName={user?.name}
      />

      <GymBottomNav
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        backgroundColor={uiSettings?.navigation_bar_color}
        activeItemColor={uiSettings?.cart_button_color}
      />

      {/* Popup Modal from UI Settings */}
      <Dialog open={popupOpen} onOpenChange={(open) => {
        setPopupOpen(open);
      }}>
        <DialogContent className="w-[90%] sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden bg-zinc-900 border-2 border-zinc-800">
          <button
            onClick={() => setPopupOpen(false)}
            className="absolute right-6 top-6 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black transition-colors shadow-xl"
          >
            <X className="h-5 w-5" />
          </button>
          {uiSettings?.popup_image_url && (
            <div className="w-full h-80 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10" />
              <img
                src={uiSettings.popup_image_url}
                alt={uiSettings.popup_title || 'Popup'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="px-8 py-8 space-y-6 relative z-10">
            <DialogHeader className="p-0">
              {uiSettings?.popup_title && (
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white">{uiSettings.popup_title}</DialogTitle>
              )}
              {uiSettings?.popup_description && (
                <DialogDescription className="text-lg mt-4 text-zinc-400 font-medium leading-relaxed">
                  {uiSettings.popup_description}
                </DialogDescription>
              )}
            </DialogHeader>

            {uiSettings?.popup_button_label && uiSettings?.popup_button_url && (
              <div className="pt-4 flex justify-center">
                <Button
                  className="w-full py-8 text-lg font-black rounded-3xl uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: uiSettings.popup_button_color || '#2563eb',
                    color: '#ffffff',
                  }}
                  onClick={() => {
                    window.open(uiSettings.popup_button_url, '_blank');
                  }}
                >
                  {uiSettings.popup_button_label}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CommentSheet
        isOpen={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        companyId={company?.id || ''}
      />
    </div >
  );
}

export default function PublicLocationProductsPage() {
  return (
    <CartProvider>
      <PublicLocationProductsPageContent />
    </CartProvider>
  );
}