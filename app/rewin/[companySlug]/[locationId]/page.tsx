"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicWebApiClient } from '@/lib/api/public-web';
import { api } from '@/lib/api/api';
import { PublicItem, PublicCompanyLocation } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as Lucide from 'lucide-react';
const { MapPin, Package, Phone, Mail, Clock, Store, Search, User, Download, Share2, X } = Lucide as any;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils/currency';
import { CartProvider, useCart } from '@/lib/cart-context';
import { FloatingCartButton } from '@/components/cart/floating-cart-button';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { clientAuthApi } from '@/lib/api/client-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from '@/components/shop/BottomNav';
import { PointsSection } from '@/components/shop/PointsSection';
import { PromotionsSection } from '@/components/shop/PromotionsSection';
import { CatalogCard } from '@/components/shop/CatalogCard';
import { WalletSection } from '@/components/shop/WalletSection';
import { CommentSheet } from '@/components/shop/CommentSheet';
import { MessageSquare } from 'lucide-react';

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

  const [location, setLocation] = useState<PublicCompanyLocation | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PublicItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeSection, setActiveSection] = useState<'home' | 'promotions' | 'points' | 'wallet' | 'coupons'>('home');
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

  const trackAnalyticsEvent = (eventName: string, params: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.gtag) {
      console.log('[Analytics Debug] gtag not available, event not sent:', eventName, params);
      return;
    }
    console.log('[Analytics Debug] Sending GA event:', eventName, params);
    window.gtag('event', eventName, params);
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
      page_path: `/rewin/${companySlug}/${locationId}`,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      event_time: new Date().toISOString(),
    };

    console.log('[Analytics Debug] View rewin location payload:', payload);
    setLastAnalyticsPayload(payload);
    trackAnalyticsEvent('view_rewin_location', payload);
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
        router.push(`/rewin/${companySlug}`);
        return;
      }
      setCompany(cachedCompany!.data);
    }
    if (hasLocation) setLocation(cachedLocation!.data as PublicCompanyLocation);

    if (hasItems) {
      const normalized = cachedItems!.data as PublicItem[];
      setItems(normalized);
      setFilteredItems(normalized);
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
              router.push(`/rewin/${companySlug}`);
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
              setFilteredItems(normalized);
              const uniqueCategories = Array.from(new Set(
                normalized.map(item => item.category).filter(Boolean)
              )) as string[];
              setCategories(uniqueCategories);
              setCache(`${baseKey}:items_v2`, normalized);
              console.log('Items loaded:', normalized);
            } else {
              setItems([]);
              setFilteredItems([]);
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

  // Fetch coupons when Coupons section becomes active
  useEffect(() => {
    const shouldLoad = activeSection === 'coupons';
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
  useEffect(() => {
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

    setFilteredItems(filtered);
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
              href={companySlug ? `/rewin/${companySlug}` : '/'}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors"
            >
              Ver otras sucursales
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
      className="min-h-screen pb-32 relative"
      style={{ backgroundColor: uiSettings?.background_color ?? '#f9fafb' }}
    >
      {/* Banner from UI Settings */}
      {uiSettings?.banner_enabled && uiSettings.banner_text && (
        <div
          className="w-full py-3 px-4 text-center text-white font-medium shadow-md"
          style={{ backgroundColor: uiSettings.banner_color || '#059669' }}
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

      {/* Follow Button (Left Side) */}
      {user && company && (
        <div className="fixed top-16 left-6 z-50">


          {/* Botón Descargar app solo en móvil, debajo del botón Seguir */}
          <div className="mt-3 sm:hidden">
            <Button
              className="w-full gap-2 shadow-xl text-white rounded-full h-12 px-4 text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: uiSettings?.download_app_color || '#059669' }}
              onClick={() => {
                if (typeof window === 'undefined') return;

                trackAnalyticsEvent('download_app_click', {
                  location: 'follow_button_mobile',
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
              <span>Descargar app</span>
            </Button>
          </div>
        </div>
      )}

      {/* Login/User Button (Right Side) + Descargar app */}
      <div className="fixed top-16 right-6 z-50 flex items-center gap-3">
        {user ? (
          <>
            <Button
              className="gap-2 shadow-xl text-white rounded-full h-12 px-5 text-sm font-semibold hidden sm:inline-flex hover:opacity-90 transition-opacity"
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
              <span>Descargar app</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-3 shadow-xl bg-white text-emerald-600 hover:bg-gray-50 hover:text-emerald-700 border-2 border-emerald-100 rounded-full pl-3 pr-6 h-16 text-lg">
                  <Avatar className="h-11 w-11 border-2 border-emerald-200">
                    <AvatarImage src={user.profile_photo_path || user.avatar_url || user.photo_url} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold max-w-[140px] truncate text-base">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/rewin/${companySlug}/${locationId}/profile`)}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Mis Pedidos en desarrollo")}>
                  Mis Pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              className="gap-2 shadow-xl text-white rounded-full h-12 px-5 text-sm font-semibold hidden sm:inline-flex hover:opacity-90 transition-opacity"
              style={{ backgroundColor: uiSettings?.download_app_color || '#059669' }}
              onClick={() => {
                if (typeof window === 'undefined') return;

                trackAnalyticsEvent('download_app_click', {
                  location: 'top_right_guest',
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
              <span>Descargar app</span>
            </Button>

            <Link href={`/rewin/${companySlug}/${locationId}/auth/login`}>
              <Button className="gap-3 shadow-xl bg-white text-emerald-600 hover:bg-gray-50 hover:text-emerald-700 border-2 border-emerald-100 rounded-full h-16 px-6 text-lg font-semibold">
                <User className="h-6 w-6" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          </>
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Location Header */}
        <div className="-mt-16 sm:-mt-20 relative z-10 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Logo */}
              {company?.logo_url && (
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg border-4 border-white shadow-md bg-white"
                    onLoad={() => {
                      console.log('✅ Company logo loaded successfully:', company?.logo_url);
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const currentSrc = img.src;
                      console.error('❌ Error loading company logo:', {
                        currentSrc,
                        originalUrl: company?.logo_url,
                        companyName: company?.name
                      });
                      img.style.display = 'none';
                    }}
                  />

                  {/* Follow Button */}
                  {user && company && (
                    <Button
                      className={`group gap-2 shadow-lg border-2 h-12 px-4 text-sm font-semibold rounded-full transition-all ${isFollowing
                        ? 'bg-white text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        }`}
                      onClick={() => {
                        if (isFollowing) {
                          setIsFollowing(false);
                        } else {
                          setIsFollowing(true);
                        }
                      }}
                    >
                      {isFollowing ? (
                        <>
                          <span className="group-hover:hidden">Siguiendo</span>
                          <span className="hidden group-hover:inline">Dejar de seguir</span>
                        </>
                      ) : (
                        <>
                          <span>Seguir</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Location Info */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {company?.name} <span className="text-gray-400 font-normal text-xl sm:text-2xl">| {location.name}</span>
                </h1>
                {company?.description && (
                  <p className="text-gray-600 mb-4">{company.description}</p>
                )}

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {location.address && (
                    <button
                      type="button"
                      className="flex items-start gap-2 text-left hover:text-emerald-700"
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
                      <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 underline">
                        {location.address}, {location.city}, {location.state}, {location.country}
                      </span>
                    </button>
                  )}
                  {(location as any).phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <a href={`tel:${(location as any).phone}`} className="text-gray-700 hover:text-emerald-600">
                        {(location as any).phone}
                      </a>
                    </div>
                  )}
                  {(location as any).email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <a href={`mailto:${(location as any).email}`} className="text-gray-700 hover:text-emerald-600">
                        {(location as any).email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 text-xs sm:text-sm"
                      onClick={() => setCommentSheetOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Comentar</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 text-xs sm:text-sm"
                      onClick={() => {
                        if (typeof window === 'undefined') return;
                        const baseText = `${company?.name || location.name} - ${company?.description || 'Mira esta sucursal en Rewin'}`;
                        const url = shareUrl || window.location.href;
                        const waUrl = `https://wa.me/?text=${encodeURIComponent(`${baseText} ${url}`)}`;
                        window.open(waUrl, '_blank');
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Compartir</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer where top nav used to be */}
        <div className="mb-2" />

        {/* Sections */}
        {activeSection === 'home' && (
          <>
            {/* Announcements Carousel */}
            {announcements.length > 0 && (
              <div className="mb-10">
                <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
                  {announcements[currentAnnouncement]?.image_url ? (
                    <img
                      src={announcements[currentAnnouncement].image_url as string}
                      alt={announcements[currentAnnouncement]?.title || 'Anuncio'}
                      className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-gray-500">Anuncio</span>
                    </div>
                  )}

                  {(announcements[currentAnnouncement]?.title || announcements[currentAnnouncement]?.text) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-6 flex items-end">
                      <div className="text-white max-w-2xl">
                        {announcements[currentAnnouncement]?.title && (
                          <h3 className="text-lg sm:text-2xl font-bold">
                            {announcements[currentAnnouncement].title}
                          </h3>
                        )}
                        {announcements[currentAnnouncement]?.subtitle && (
                          <p className="text-sm sm:text-base opacity-90">{announcements[currentAnnouncement].subtitle}</p>
                        )}
                        {announcements[currentAnnouncement]?.text && (
                          <p className="mt-1 text-xs sm:text-sm opacity-90 line-clamp-2">
                            {announcements[currentAnnouncement].text}
                          </p>
                        )}
                        {announcements[currentAnnouncement]?.link_url && (
                          <a
                            href={announcements[currentAnnouncement].link_url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md shadow"
                          >
                            Ver más
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {announcements.length > 1 && (
                    <>
                      <button
                        aria-label="Anterior"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => setCurrentAnnouncement((idx) => (idx - 1 + announcements.length) % announcements.length)}
                      >
                        ‹
                      </button>
                      <button
                        aria-label="Siguiente"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => setCurrentAnnouncement((idx) => (idx + 1) % announcements.length)}
                      >
                        ›
                      </button>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                        {announcements.map((_, i) => (
                          <button
                            key={i}
                            aria-label={`Ir al anuncio ${i + 1}`}
                            className={`w-2.5 h-2.5 rounded-full ${i === currentAnnouncement ? 'bg-white' : 'bg-white/60 hover:bg-white'}`}
                            onClick={() => setCurrentAnnouncement(i)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="pb-16">
              {/* En móvil dejamos que el contenido crezca y use el scroll de toda la página.
                    La idea de panel alto tipo app se mantiene más para pantallas grandes. */}
              <Card className="flex flex-col md:block">
                <CardHeader className="flex-shrink-0 md:static">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <CardTitle className="flex items-center text-2xl">
                        <Package className="mr-2 h-6 w-6" /> Nuestro Catálogo
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        {items.length} productos disponibles
                      </CardDescription>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 h-12 text-base sm:text-lg w-full"
                    />
                  </div>

                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Badge
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all px-5 py-2.5 text-base sm:text-lg rounded-full ${selectedCategory === 'all'
                          ? `text-white ${!uiSettings?.cart_button_color ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`
                          : 'hover:bg-gray-100'
                          }`}
                        style={selectedCategory === 'all' && uiSettings?.cart_button_color ? { backgroundColor: uiSettings.cart_button_color } : {}}
                        onClick={() => setSelectedCategory('all')}
                      >
                        Todos ({items.length})
                      </Badge>
                      {categories.map((category) => {
                        const count = items.filter(item => item.category === category).length;
                        const isCurrentActive = selectedCategory === category;
                        return (
                          <Badge
                            key={category}
                            variant={isCurrentActive ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all px-5 py-2.5 text-base sm:text-lg rounded-full ${isCurrentActive
                              ? `text-white ${!uiSettings?.cart_button_color ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`
                              : 'hover:bg-gray-100'
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
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay productos disponibles en esta sucursal.</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                      >
                        Limpiar filtros
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
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeSection === 'promotions' && <PromotionsSection companyId={company?.id} />}

        {activeSection === 'points' && (
          user ? (
            <PointsSection companyId={company?.id} pointRules={company?.point_rules || null} />
          ) : (
            <div className="pb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Tus puntos</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Inicia sesión o descarga la app para ver y acumular tus puntos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm sm:text-base">
                      Crea una cuenta o inicia sesión para que podamos registrar tus compras y mostrarte tus puntos disponibles.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/${companySlug}/${locationId}/auth/login`} className="sm:w-auto w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link href="/descargar-app" className="sm:w-auto w-full">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto flex items-center gap-2"
                          onClick={() => {
                            trackAnalyticsEvent('download_app_click', {
                              location: 'points_section_cta',
                              company_slug: companySlug,
                              location_id: locationId,
                              user_logged_in: !!user,
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                          <span>Descargar app</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {activeSection === 'wallet' && (
          <WalletSection companyName={company?.name} />
        )}

        {activeSection === 'coupons' && (
          // Coupons section
          <div className="pb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">Cupones</CardTitle>
                <CardDescription className="text-base mt-1">
                  {couponsLoading ? 'Cargando cupones...' : `${coupons.length} cupón(es) disponible(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {couponsError ? (
                  <div className="text-red-500">{couponsError}</div>
                ) : couponsLoading ? (
                  <div className="text-gray-600">Cargando...</div>
                ) : coupons.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay cupones disponibles en este momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((c) => {
                      const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
                      return (
                        <div key={c.id} className={`border rounded-lg p-4 shadow-sm ${isExpired ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3 mb-3">
                            {c.company?.logo_url && (
                              <img src={c.company.logo_url} alt={c.company.name} className="w-10 h-10 rounded object-cover" />
                            )}
                            <div>
                              <h3 className="font-bold text-lg">{c.name}</h3>
                              <p className="text-xs text-gray-500">Código: <span className="font-mono font-semibold">{c.code}</span></p>
                            </div>
                          </div>
                          {c.description && <p className="text-sm text-gray-700 mb-2">{c.description}</p>}
                          <div className="flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                              {c.type === 'percentage' ? `${c.discount_percentage ?? 0}%` : c.discount_amount ? formatCurrency(Number(c.discount_amount)) : 'Descuento'}
                            </span>
                            {c.expires_at && (
                              <span className="text-gray-500">Expira: {new Date(c.expires_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
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

      <BottomNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        backgroundColor={uiSettings?.navigation_bar_color}
        activeItemColor={uiSettings?.cart_button_color}
      />

      {/* Popup Modal from UI Settings */}
      <Dialog open={popupOpen} onOpenChange={(open) => {
        setPopupOpen(open);
      }}>
        <DialogContent className="w-[90%] sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <button
            onClick={() => setPopupOpen(false)}
            className="absolute right-4 top-4 z-50 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-black hover:bg-gray-100 transition-colors shadow-sm"
          >
            <X className="h-4 w-4 text-black" />
          </button>
          {uiSettings?.popup_image_url && (
            <div className="w-full h-64 sm:h-72 overflow-hidden">
              <img
                src={uiSettings.popup_image_url}
                alt={uiSettings.popup_title || 'Popup'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="px-5 py-4 space-y-4">
            <DialogHeader className="p-0">
              {uiSettings?.popup_title && (
                <DialogTitle className="text-xl font-bold">{uiSettings.popup_title}</DialogTitle>
              )}
              {uiSettings?.popup_description && (
                <DialogDescription className="text-base mt-2">
                  {uiSettings.popup_description}
                </DialogDescription>
              )}
            </DialogHeader>

            {uiSettings?.popup_button_label && uiSettings?.popup_button_url && (
              <div className="pt-2 flex justify-center">
                <Button
                  className="w-[90%] max-w-xs text-sm font-semibold rounded-full"
                  style={{
                    backgroundColor: uiSettings.popup_button_color || '#059669',
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
    </div>
  );
}

export default function PublicLocationProductsPage() {
  return (
    <CartProvider>
      <PublicLocationProductsPageContent />
    </CartProvider>
  );
}