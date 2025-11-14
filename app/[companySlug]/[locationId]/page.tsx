"use client";

import { useState, useEffect } from 'react';
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
      <div className="min-h-screen bg-gray-50">
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
                      <CatalogCard key={item.id} item={item} locationId={Number(location.id)} onAdd={() => setCartOpen(true)} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <FloatingCartButton onClick={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  );
}

function CatalogCard({ item, locationId, onAdd }: { item: PublicItem; locationId: number; onAdd: () => void }) {
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
    onAdd();
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

