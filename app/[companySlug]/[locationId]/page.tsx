"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { publicWebApiClient } from '@/lib/api/public-web';
import { PublicItem, PublicCompanyLocation } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Package, Phone, Mail, Clock, Store, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils/currency';
import { CartProvider, useCart } from '@/lib/cart-context';
import { FloatingCartButton } from '@/components/cart/floating-cart-button';
import { CartDrawer } from '@/components/cart/cart-drawer';

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

export default function PublicLocationProductsPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;
  const locationId = params.locationId as string;

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
  const [activeSection, setActiveSection] = useState<'home' | 'coupons'>('home');
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch specific location details by ID
        const locationDetailsRes = await publicWebApiClient.getLocationDetailsById(locationId);
        if (locationDetailsRes.success && locationDetailsRes.data) {
          // locationDetailsRes.data is the full response: { success: true, data: { location: {...}, company: {...}, menu: {...} } }
          const responseData = locationDetailsRes.data as any;
          console.log('Location API response:', responseData);
          
          // Extract from nested structure
          let loc: any = null;
          let comp: any = null;
          
          if (responseData.data) {
            // Response has nested data property
            loc = responseData.data.location;
            comp = responseData.data.company;
          } else if (responseData.location) {
            // Response has direct location property
            loc = responseData.location;
            comp = responseData.company;
          } else {
            // Fallback: use responseData as location
            loc = responseData;
          }
          
          console.log('Extracted location:', loc);
          console.log('Extracted company:', comp);
          
          setLocation(loc as PublicCompanyLocation);
          setCompany(comp);

          // Fetch announcements for the company if we have its ID
          const companyId = (comp && (comp.id || comp.company_id)) || (loc && (loc.company_id || (loc.company && loc.company.id)));
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
              } else {
                console.warn('Announcements fetch failed', res.status);
              }
            } catch (e) {
              console.warn('Announcements fetch error', e);
            }
          }
        } else {
          throw new Error(locationDetailsRes.error || 'Failed to fetch location details');
        }

        const itemsRes = await publicWebApiClient.getPublicItemsByLocationId(locationId);
        if (itemsRes.success && itemsRes.data) {
          // API returns wrapped: ApiResponse<{ status: 'success', data: { products: [...] } }>
          // So itemsRes.data is { status: 'success', data: { products: [...] } }
          let products: any[] = [];
          
          if ((itemsRes.data as any).data?.products) {
            // Nested structure: { data: { products: [...] } }
            products = (itemsRes.data as any).data.products;
          } else if ((itemsRes.data as any).products) {
            // Direct structure: { products: [...] }
            products = (itemsRes.data as any).products;
          } else if (Array.isArray(itemsRes.data)) {
            // Direct array
            products = itemsRes.data;
          }

          if (Array.isArray(products) && products.length > 0) {
            // Normalize to PublicItem shape used by UI
            const normalized: PublicItem[] = products.map((p: any) => ({
              id: String(p.id),
              name: p.name,
              description: p.description ?? '',
              price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0),
              image_url: p.image_url ?? undefined,
              category: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0]?.name : undefined,
            } as PublicItem));
            setItems(normalized);
            setFilteredItems(normalized);
            
            // Extract unique categories
            const uniqueCategories = Array.from(new Set(
              normalized.map(item => item.category).filter(Boolean)
            )) as string[];
            setCategories(uniqueCategories);
            
            console.log('Products loaded:', normalized.length);
          } else {
            console.warn('No products found or unexpected format:', itemsRes.data);
            setItems([]);
            setFilteredItems([]);
          }
        } else {
          throw new Error(itemsRes.error || 'Failed to fetch products for location');
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

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Cargando productos de la sucursal...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }

  if (!location) {
    return <div className="flex justify-center items-center h-screen text-lg">Sucursal no encontrada.</div>;
  }

  console.log('Rendering with company:', company);
  console.log('Rendering with location:', location);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Hero Section with Banner */}
        {company?.banner_url && (
          <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
            <img
              src={company.banner_url}
              alt={company.name || 'Banner'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Location Header */}
          <div className="-mt-16 sm:-mt-20 relative z-10 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Logo */}
                {company?.logo_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg border-4 border-white shadow-md bg-white"
                    />
                  </div>
                )}

                {/* Location Info */}
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {location.name}
                  </h1>
                  {company?.description && (
                    <p className="text-gray-600 mb-4">{company.description}</p>
                  )}

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {location.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          {location.address}, {location.city}, {location.state}, {location.country}
                        </span>
                      </div>
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
                    {(location as any).timezone && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">Zona horaria: {(location as any).timezone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer where top nav used to be */}
          <div className="mb-2" />

          {/* Sections */}
          {activeSection === 'home' ? (
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
                <Card>
                  <CardHeader>
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
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full"
                      />
                    </div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant={selectedCategory === 'all' ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            selectedCategory === 'all'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedCategory('all')}
                        >
                          Todos ({items.length})
                        </Badge>
                        {categories.map((category) => {
                          const count = items.filter(item => item.category === category).length;
                          return (
                            <Badge
                              key={category}
                              variant={selectedCategory === category ? 'default' : 'outline'}
                              className={`cursor-pointer transition-all ${
                                selectedCategory === category
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'hover:bg-gray-100'
                              }`}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                          <CatalogCard key={item.id} item={item} locationId={Number(location.id)} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
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

        <FloatingCartButton onClick={() => setCartOpen(true)} />
        <CartDrawer 
          open={cartOpen} 
          onClose={() => setCartOpen(false)} 
          locationPhone={(location as any)?.phone ?? company?.phone}
          locationName={location?.name}
        />

        {/* Floating Bottom Navigation Dock */}
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="mx-auto max-w-md px-4 pb-4 safe-bottom">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2">
              <div className="flex items-center justify-around gap-2">
                <button
                  className={`flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                    activeSection === 'home' 
                      ? 'text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-lg scale-105' 
                      : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                  }`}
                  onClick={() => setActiveSection('home')}
                >
                  <Store className={`h-6 w-6 ${activeSection === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="font-semibold">Inicio</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                    activeSection === 'coupons' 
                      ? 'text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-lg scale-105' 
                      : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                  }`}
                  onClick={() => setActiveSection('coupons')}
                >
                  <Package className={`h-6 w-6 ${activeSection === 'coupons' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="font-semibold">Cupones</span>
                </button>
              </div>
            </div>
            {/* Safe area inset support */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}

function CatalogCard({ item, locationId }: { item: PublicItem; locationId: number }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    // Map public item to the cart's expected Product shape
    const product = {
      id: String(item.id),
      name: item.name,
      description: item.description || '',
      price: typeof item.price === 'number' ? item.price : 0,
      product_type: 'made_to_order' as const,
      is_active: true,
      category: item.category || '',
      image_url: item.image_url,
      locations: [
        {
          id: locationId,
          is_available: true,
          stock: undefined,
        },
      ],
    };
    addItem(product as any);
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
        {item.category && (
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
            {item.category}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">{item.description}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(typeof item.price === 'number' ? item.price : 0)}
            </span>
          </div>
          <Button 
            size="lg" 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all" 
            onClick={handleAdd}
          >
            Agregar al carrito
          </Button>
        </div>
      </div>
    </Card>
  );
}