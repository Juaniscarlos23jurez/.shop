"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { publicWebApiClient } from '@/lib/api/public-web';
import { api } from '@/lib/api/api';
import { PublicItem, PublicCompanyLocation } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Package, Phone, Mail, Store, Search, User, Download, Share2, X, MessageSquare } from 'lucide-react';
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

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── TTL constants (outside component to avoid re-creation on every render) ──
const COMPANY_TTL = 24 * 60 * 60 * 1000; // 24 h
const LOCATION_TTL = 24 * 60 * 60 * 1000; // 24 h
const ITEMS_TTL = 60 * 60 * 1000; //  1 h
const ANN_TTL = 30 * 60 * 1000; // 30 m
const PROFILE_TTL = 15 * 60 * 1000; // 15 m
const UI_TTL = 15 * 60 * 1000; // 15 m
const FOLLOW_TTL = 15 * 60 * 1000; // 15 m
const API_BASE = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api';

// ─── LocalStorage cache helpers ───────────────────────────────────────────────
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
    window.localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full – ignore */ }
}

function isFresh(entry: { ts: number } | null, ttlMs: number) {
  if (!entry) return false;
  return Date.now() - entry.ts < ttlMs;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Banner skeleton */}
      <div className="h-48 sm:h-64 w-full bg-gray-200" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header card skeleton */}
        <div className="-mt-16 relative z-10 mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gray-200" />
            <div className="w-48 h-6 bg-gray-200 rounded-full" />
            <div className="w-64 h-4 bg-gray-100 rounded-full" />
            <div className="flex gap-3">
              {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 rounded-full bg-gray-200" />)}
            </div>
          </div>
        </div>
        {/* Cards skeleton */}
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-white rounded-xl shadow-sm flex overflow-hidden">
              <div className="w-44 bg-gray-200 flex-shrink-0" />
              <div className="flex-1 p-5 flex flex-col gap-3 justify-center">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded-lg w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────
function PublicLocationProductsPageContent() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.companySlug as string;
  const locationId = params.locationId as string;
  const { addItem } = useCart();

  const baseKey = `plp:${companySlug}:${locationId}`;

  // Core data
  const [location, setLocation] = useState<PublicCompanyLocation | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'promotions' | 'points' | 'wallet' | 'coupons'>('home');
  const [shareUrl, setShareUrl] = useState('');
  const [initialProductId, setInitialProductId] = useState<string | null>(null);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Coupons
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);

  // User
  const [user, setUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);

  // UI settings
  const [uiSettings, setUiSettings] = useState<any>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // ── Analytics ──────────────────────────────────────────────────────────────
  const trackAnalyticsEvent = useCallback((eventName: string, eventParams: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', eventName, eventParams);
  }, []);

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('customer_token');
      if (!token) return;
      try {
        const cachedProfile = getCache('user_profile_full');
        if (isFresh(cachedProfile, PROFILE_TTL) && cachedProfile?.data) {
          setUser(cachedProfile.data);
          return;
        }
        // Show stale data instantly while we refresh
        const storedInfo = localStorage.getItem('customer_info');
        if (storedInfo) {
          try { setUser(JSON.parse(storedInfo)); } catch { /* ignore */ }
        }
        const res = await clientAuthApi.getProfile(token);
        if (res.success && res.data) {
          const userData = (res.data as any).data || res.data;
          setUser(userData);
          localStorage.setItem('customer_info', JSON.stringify(userData));
          setCache('user_profile_full', userData);
        } else {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_info');
          setUser(null);
        }
      } catch { /* silent */ }
    };
    checkAuth();
  }, []);

  // ── Read ?product= from URL ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const productId = new URL(window.location.href).searchParams.get('product');
      if (productId) setInitialProductId(productId);
    } catch { /* ignore */ }
    setShareUrl(window.location.href);
  }, []);

  // ── Pre-fill cart from ?cart= ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return;
    try {
      const url = new URL(window.location.href);
      const cartParam = url.searchParams.get('cart');
      if (!cartParam) return;
      const cartData = JSON.parse(decodeURIComponent(cartParam)) as Array<{ id: string; q: number }>;
      cartData.forEach(({ id, q }) => {
        const product = items.find(i => String(i.id) === id);
        if (product) {
          for (let k = 0; k < q; k++) addItem(product as any);
        }
      });
      url.searchParams.delete('cart');
      window.history.replaceState({}, '', url.toString());
    } catch { /* ignore */ }
  }, [items, addItem]);

  // ── Analytics view event ───────────────────────────────────────────────────
  useEffect(() => {
    if (!company || !location) return;
    trackAnalyticsEvent('view_rewin_location', {
      company_slug: companySlug,
      location_id: locationId,
      company_id: company?.id,
      company_name: company?.name,
      page_path: `/rewin/${companySlug}/${locationId}`,
    });
  }, [company, location, companySlug, locationId, trackAnalyticsEvent]);

  // ── Follow status + user points (single API call, shared cache) ────────────
  useEffect(() => {
    if (!user || !company) return;
    const checkFollowAndPoints = async () => {
      const cached = getCache('followed_companies_list');
      if (isFresh(cached, FOLLOW_TTL) && Array.isArray(cached?.data)) {
        const match = cached.data.find((c: any) => String(c.id) === String(company.id));
        setIsFollowing(!!match);
        if (match && typeof match.points_balance === 'number') setUserPoints(match.points_balance);
        return;
      }
      const token = localStorage.getItem('customer_token');
      if (!token) return;
      try {
        const res = await clientAuthApi.getFollowedCompanies(token);
        if (res.success && Array.isArray(res.data)) {
          setCache('followed_companies_list', res.data);
          const match = res.data.find((c: any) => String(c.id) === String(company.id));
          setIsFollowing(!!match);
          if (match && typeof match.points_balance === 'number') setUserPoints(match.points_balance);
        }
      } catch { /* silent */ }
    };
    checkFollowAndPoints();
  }, [user, company]);

  // ── Main data fetch (location + items + announcements + point_rules) ────────
  useEffect(() => {
    if (!locationId) return;

    // Hydrate from cache immediately
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
      if (currentCompany?.slug && currentCompany.slug !== companySlug) {
        router.push(`/rewin/${companySlug}`);
        return;
      }
      setCompany(cachedCompany!.data);
    }
    if (hasLocation) setLocation(cachedLocation!.data as PublicCompanyLocation);
    if (hasItems) {
      const normalized = cachedItems!.data as PublicItem[];
      setItems(normalized);
      setCategories(Array.from(new Set(normalized.map(i => i.category).filter(Boolean))) as string[]);
    }
    if (hasAnns) setAnnouncements(cachedAnns!.data);

    const needsPointRules = currentCompany && (!currentCompany.point_rules || currentCompany.point_rules.length === 0);

    if (hasLocation && hasCompany && hasItems) {
      setLoading(false);
      if (hasAnns && !needsPointRules) return; // everything cached → skip network
    }

    const fetchData = async () => {
      if (!hasLocation || !hasCompany || !hasItems) setLoading(true);
      setError(null);
      try {
        // ── Location + Company ──
        if (!hasLocation || !hasCompany) {
          const locationDetailsRes = await publicWebApiClient.getLocationDetailsById(locationId);
          if (locationDetailsRes.success && locationDetailsRes.data) {
            const rd = locationDetailsRes.data as any;
            let loc: any = rd.data?.location ?? rd.location ?? rd;
            let comp: any = rd.data?.company ?? rd.company ?? null;

            if (comp?.slug && comp.slug !== companySlug) {
              router.push(`/rewin/${companySlug}`);
              return;
            }
            setLocation(loc as PublicCompanyLocation);
            setCompany(comp);
            setCache(`${baseKey}:location`, loc);
            setCache(`${baseKey}:company`, comp);
            currentLocation = loc;
            currentCompany = comp;
          } else {
            throw new Error(locationDetailsRes.error || 'Failed to fetch location details');
          }
        }

        // ── Items ──
        if (!hasItems) {
          const itemsRes = await publicWebApiClient.getPublicItemsByLocationId(locationId);
          if (itemsRes.success && itemsRes.data) {
            let products: any[] = [];
            const d = itemsRes.data as any;
            if (d.data?.products) products = d.data.products;
            else if (d.products) products = d.products;
            else if (Array.isArray(d)) products = d;

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
            setCategories(Array.from(new Set(normalized.map(i => i.category).filter(Boolean))) as string[]);
            setCache(`${baseKey}:items_v2`, normalized);
          } else {
            throw new Error(itemsRes.error || 'Failed to fetch products');
          }
        }

        // ── Announcements ──
        if (!hasAnns) {
          const comp = currentCompany;
          const loc = currentLocation;
          const companyId =
            (comp && (comp.id || comp.company_id)) ||
            (loc && ((loc as any).company_id || (loc as any).company?.id));
          if (companyId) {
            try {
              const res = await fetch(`${API_BASE}/public/companies/${companyId}/announcements`);
              if (res.ok) {
                const json = await res.json();
                const rawList = (json?.data?.data ?? json?.data ?? []) as any[];
                const now = new Date();
                const active = rawList.filter(a => {
                  const ok = a.is_active !== false;
                  const s = !a.starts_at || new Date(a.starts_at) <= now;
                  const e = !a.ends_at || new Date(a.ends_at) >= now;
                  return ok && s && e;
                });
                setAnnouncements(active);
                setCache(`${baseKey}:announcements`, active);
              }
            } catch { /* non-critical */ }
          }
        }

        // ── Point rules ──
        const comp = currentCompany;
        const companyId = comp && (comp.id || comp.company_id);
        if (companyId && (!comp.point_rules || comp.point_rules.length === 0)) {
          try {
            const companyDetailsRes = await publicWebApiClient.getCompanyById(String(companyId));
            if (companyDetailsRes.success && companyDetailsRes.data) {
              const full = (companyDetailsRes.data as any).data || companyDetailsRes.data;
              const updated = { ...comp, point_rules: full.point_rules || [] };
              setCompany(updated);
              setCache(`${baseKey}:company`, updated);
            }
          } catch { /* non-critical */ }
        }

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companySlug, locationId]);

  // ── UI Settings (cached, deduped by companyId) ─────────────────────────────
  useEffect(() => {
    const comp: any = company;
    const loc: any = location;
    const companyId =
      (comp && (comp.id || comp.company_id)) ||
      (loc && (loc.company_id || loc.company?.id));
    if (!companyId) return;

    const cacheKey = `ui_settings:${companyId}:${locationId}`;
    const cached = getCache(cacheKey);
    if (isFresh(cached, UI_TTL) && cached?.data) {
      setUiSettings(cached.data);
      if (cached.data?.popup_enabled) setPopupOpen(true);
      return;
    }

    const load = async () => {
      try {
        const res = await api.uiSettings.getPublic({
          company_id: companyId,
          location_id: locationId,
          context: 'public_store_home',
        });
        if (res.success && res.data) {
          const settings = res.data.data || res.data;
          setUiSettings(settings);
          setCache(cacheKey, settings);
          if (settings?.popup_enabled) setPopupOpen(true);
        }
      } catch { /* non-critical */ }
    };
    load();
    // Only re-run when companyId changes, NOT on every company object mutation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, location?.id, locationId]);

  // ── Announcement auto-rotate ───────────────────────────────────────────────
  useEffect(() => {
    setCurrentAnnouncement(0);
    if (!announcements || announcements.length <= 1) {
      if (rotationRef.current) { clearInterval(rotationRef.current); rotationRef.current = null; }
      return;
    }
    if (rotationRef.current) clearInterval(rotationRef.current);
    rotationRef.current = setInterval(() => {
      setCurrentAnnouncement(idx => (idx + 1) % announcements.length);
    }, 5000);
    return () => { if (rotationRef.current) { clearInterval(rotationRef.current); rotationRef.current = null; } };
  }, [announcements]);

  // ── Coupons (lazy, on demand) ──────────────────────────────────────────────
  useEffect(() => {
    if (activeSection !== 'coupons') return;
    const comp: any = company;
    const loc: any = location;
    const companyId =
      (comp && (comp.id || comp.company_id)) ||
      (loc && (loc.company_id || loc.company?.id));
    if (!companyId) return;

    const load = async () => {
      try {
        setCouponsError(null);
        setCouponsLoading(true);
        const res = await fetch(`${API_BASE}/public/companies/${companyId}/coupons`);
        if (!res.ok) throw new Error(`Error al cargar cupones (${res.status})`);
        const json = await res.json();
        const list = (json?.data ?? json ?? []) as any[];
        setCoupons(Array.isArray(list) ? list : []);
      } catch (e: any) {
        setCouponsError(e?.message || 'No se pudieron cargar los cupones');
      } finally {
        setCouponsLoading(false);
      }
    };
    load();
  }, [activeSection, company?.id, location?.id]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_info');
    setUser(null);
    window.location.reload();
  }, []);

  // ── Download app ───────────────────────────────────────────────────────────
  const handleDownloadApp = useCallback((location_label: string) => {
    trackAnalyticsEvent('download_app_click', {
      location: location_label,
      company_slug: companySlug,
      location_id: locationId,
      user_logged_in: !!user,
    });
    const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const target = isIOS
      ? 'https://apps.apple.com/us/app/rewin-reward/id6748548104'
      : (process.env.NEXT_PUBLIC_ANDROID_URL || 'https://play.google.com/store/apps/details?id=com.fynlink.BoostYou');
    window.location.href = target;
  }, [companySlug, locationId, user, trackAnalyticsEvent]);

  // ── Filtered items ─────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let filtered = items;
    if (selectedCategory !== 'all') filtered = filtered.filter(i => i.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [items, selectedCategory, searchQuery]);

  // ── Not found render ───────────────────────────────────────────────────────
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

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  if (error && typeof error === 'string' && error.toLowerCase().includes('location not found')) {
    return renderNotFound('No encontramos esta sucursal.');
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }
  if (!location) return renderNotFound('Sucursal no encontrada.');

  // ── Render ─────────────────────────────────────────────────────────────────
  const appColor = uiSettings?.download_app_color || '#059669';
  const cartColor = uiSettings?.cart_button_color;

  return (
    <div
      className="min-h-[100dvh] pb-32 relative overflow-x-hidden"
      style={{ backgroundColor: uiSettings?.background_color ?? '#f9fafb' }}
    >
      {/* ── Top notification banner ── */}
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

      {/* ── Fixed header buttons ── */}
      <div className="fixed top-8 right-4 z-[60] flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-3 pointer-events-none">
        {/* Download app button */}
        <div className="pointer-events-auto">
          <Button
            className="gap-2 shadow-xl text-white rounded-full h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm font-semibold flex hover:opacity-90 transition-opacity"
            style={{ backgroundColor: appColor }}
            onClick={() => handleDownloadApp(user ? 'top_right_logged_in' : 'top_right_guest')}
          >
            <Download className="h-4 w-4" />
            <span className="sm:hidden">App</span>
            <span className="hidden sm:inline">Descargar app</span>
          </Button>
        </div>

        <div className="pointer-events-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 sm:gap-3 shadow-xl bg-white text-emerald-600 hover:bg-gray-50 hover:text-emerald-700 border-2 border-emerald-100 rounded-full pl-2 sm:pl-3 pr-4 sm:pr-6 h-10 sm:h-12 text-sm sm:text-lg">
                  <Avatar className="h-6 w-6 sm:h-9 sm:w-9 border-2 border-emerald-200">
                    <AvatarImage src={user.profile_photo_path || user.avatar_url || user.photo_url} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold max-w-[80px] sm:max-w-[140px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/rewin/${companySlug}/${locationId}/profile`)}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Mis Pedidos en desarrollo')}>
                  Mis Pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`/rewin/${companySlug}/${locationId}/auth/login`}>
              <Button
                variant="outline"
                className="gap-2 sm:gap-3 shadow-xl bg-white rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-lg font-semibold border-2 hover:bg-gray-50 transition-all"
                style={{ color: appColor, borderColor: appColor }}
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Banner image ── */}
      {company?.banner_url && (
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
          <Image
            src={company.banner_url}
            alt={company.name || 'Banner'}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Location header card ── */}
        <div className="-mt-16 sm:-mt-20 relative z-10 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center gap-6">
              {/* Logo */}
              {company?.logo_url && (
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
                    <Image
                      src={company.logo_url}
                      alt={company.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {user && company && (
                    <Button
                      className={`group gap-2 shadow-lg border-2 h-12 px-5 text-sm font-bold rounded-full transition-all uppercase tracking-tight ${isFollowing
                        ? 'bg-white text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        }`}
                      onClick={() => setIsFollowing(f => !f)}
                    >
                      {isFollowing ? (
                        <>
                          <span className="group-hover:hidden">Siguiendo</span>
                          <span className="hidden group-hover:inline">Dejar de seguir</span>
                        </>
                      ) : <span>Seguir</span>}
                    </Button>
                  )}
                </div>
              )}

              {/* Location info */}
              <div className="flex-1 w-full text-center">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words uppercase">
                  {location.name}
                </h1>
                {company?.description && (
                  <p className="text-gray-600 mb-4 font-medium max-w-2xl mx-auto">{company.description}</p>
                )}
                <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
                  {location.address && (
                    <Button
                      size="icon" variant="outline"
                      title={location.address}
                      className="h-12 w-12 rounded-full border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                      onClick={() => {
                        const lat = (location as any).latitude;
                        const lng = (location as any).longitude;
                        const q = lat && lng
                          ? `${lat},${lng}`
                          : `${location.address}, ${location.city}, ${location.state}, ${location.country}`;
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
                      }}
                    >
                      <MapPin className="h-6 w-6" />
                    </Button>
                  )}
                  {(location as any).phone && (
                    <a href={`tel:${(location as any).phone}`}>
                      <Button size="icon" variant="outline" title={(location as any).phone}
                        className="h-12 w-12 rounded-full border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm">
                        <Phone className="h-6 w-6" />
                      </Button>
                    </a>
                  )}
                  {(location as any).email && (
                    <a href={`mailto:${(location as any).email}`}>
                      <Button size="icon" variant="outline" title={(location as any).email}
                        className="h-12 w-12 rounded-full border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm">
                        <Mail className="h-6 w-6" />
                      </Button>
                    </a>
                  )}
                  <Button size="icon" variant="outline" title="Comentar"
                    className="h-12 w-12 rounded-full border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                    onClick={() => setCommentSheetOpen(true)}>
                    <MessageSquare className="h-6 w-6" />
                  </Button>
                  <Button size="icon" variant="outline" title="Compartir"
                    className="h-12 w-12 rounded-full border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                    onClick={() => {
                      const baseText = `${company?.name || location.name} - ${company?.description || 'Mira esta sucursal en Rewin'}`;
                      const url = shareUrl || window.location.href;
                      window.open(`https://wa.me/?text=${encodeURIComponent(`${baseText} ${url}`)}`, '_blank');
                    }}>
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2" />

        {/* ── HOME section ── */}
        {activeSection === 'home' && (
          <>
            {/* Announcements carousel */}
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
                          <h3 className="text-lg sm:text-2xl font-bold">{announcements[currentAnnouncement].title}</h3>
                        )}
                        {announcements[currentAnnouncement]?.subtitle && (
                          <p className="text-sm sm:text-base opacity-90">{announcements[currentAnnouncement].subtitle}</p>
                        )}
                        {announcements[currentAnnouncement]?.text && (
                          <p className="mt-1 text-xs sm:text-sm opacity-90 line-clamp-2">{announcements[currentAnnouncement].text}</p>
                        )}
                        {announcements[currentAnnouncement]?.link_url && (
                          <a
                            href={announcements[currentAnnouncement].link_url as string}
                            target="_blank" rel="noopener noreferrer"
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
                      <button aria-label="Anterior"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => setCurrentAnnouncement(i => (i - 1 + announcements.length) % announcements.length)}>
                        ‹
                      </button>
                      <button aria-label="Siguiente"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => setCurrentAnnouncement(i => (i + 1) % announcements.length)}>
                        ›
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                        {announcements.map((_, i) => (
                          <button key={i} aria-label={`Ir al anuncio ${i + 1}`}
                            className={`w-2.5 h-2.5 rounded-full ${i === currentAnnouncement ? 'bg-white' : 'bg-white/60 hover:bg-white'}`}
                            onClick={() => setCurrentAnnouncement(i)} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Products catalog */}
            <div className="pb-16">
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
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 h-12 text-base sm:text-lg w-full"
                    />
                  </div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Badge
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all px-5 py-2.5 text-base sm:text-lg rounded-full ${selectedCategory === 'all' ? `text-white ${!cartColor ? 'bg-emerald-600 hover:bg-emerald-700' : ''}` : 'hover:bg-gray-100'}`}
                        style={selectedCategory === 'all' && cartColor ? { backgroundColor: cartColor } : {}}
                        onClick={() => setSelectedCategory('all')}
                      >
                        Todos ({items.length})
                      </Badge>
                      {categories.map(category => {
                        const count = items.filter(i => i.category === category).length;
                        const active = selectedCategory === category;
                        return (
                          <Badge
                            key={category}
                            variant={active ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all px-5 py-2.5 text-base sm:text-lg rounded-full ${active ? `text-white ${!cartColor ? 'bg-emerald-600 hover:bg-emerald-700' : ''}` : 'hover:bg-gray-100'}`}
                            style={active && cartColor ? { backgroundColor: cartColor } : {}}
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
                      <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                        Limpiar filtros
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {filteredItems.map(item => (
                        <CatalogCard
                          key={item.id}
                          item={item}
                          locationId={Number(location.id)}
                          phone={(location as any)?.phone ?? company?.phone}
                          initialOpen={initialProductId === String(item.id)}
                          pointRules={company?.point_rules || null}
                          userPoints={userPoints}
                          buttonColor={cartColor}
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
                      Crea una cuenta o inicia sesión para registrar tus compras y ver tus puntos disponibles.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/rewin/${companySlug}/${locationId}/auth/login`} className="sm:w-auto w-full">
                        <Button variant="outline" className="w-full font-semibold border-2 hover:bg-gray-50 transition-all"
                          style={{ color: appColor, borderColor: appColor }}>
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2"
                        onClick={() => handleDownloadApp('points_section_cta')}>
                        <Download className="h-4 w-4" />
                        <span>Descargar app</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {activeSection === 'wallet' && (
          <WalletSection companyName={company?.name} buttonColor={cartColor} />
        )}

        {activeSection === 'coupons' && (
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
                    {coupons.map(c => {
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

      {/* ── Floating widgets ── */}
      <FloatingCartButton
        onClick={() => setCartOpen(true)}
        isHidden={cartOpen}
        backgroundColor={cartColor}
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
        activeItemColor={cartColor}
      />

      {/* ── Popup modal ── */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="w-[90%] sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <button
            onClick={() => setPopupOpen(false)}
            className="absolute right-4 top-4 z-50 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-black hover:bg-gray-100 transition-colors shadow-sm"
          >
            <X className="h-4 w-4 text-black" />
          </button>
          {uiSettings?.popup_image_url && (
            <div className="w-full h-64 sm:h-72 overflow-hidden">
              <img src={uiSettings.popup_image_url} alt={uiSettings.popup_title || 'Popup'} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="px-5 py-4 space-y-4">
            <DialogHeader className="p-0">
              {uiSettings?.popup_title && <DialogTitle className="text-xl font-bold">{uiSettings.popup_title}</DialogTitle>}
              {uiSettings?.popup_description && (
                <DialogDescription className="text-base mt-2">{uiSettings.popup_description}</DialogDescription>
              )}
            </DialogHeader>
            {uiSettings?.popup_button_label && uiSettings?.popup_button_url && (
              <div className="pt-2 flex justify-center">
                <Button
                  className="w-[90%] max-w-xs text-sm font-semibold rounded-full"
                  style={{ backgroundColor: uiSettings.popup_button_color || '#059669', color: '#ffffff' }}
                  onClick={() => window.open(uiSettings.popup_button_url, '_blank')}
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

// ─── Root export ──────────────────────────────────────────────────────────────
export default function PublicLocationProductsPage() {
  return (
    <CartProvider>
      <PublicLocationProductsPageContent />
    </CartProvider>
  );
}