'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart, Search } from 'lucide-react';
import { getProducts, reorderProducts } from '@/lib/api/products';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// Importing getProducts directly from products.ts
import { Product, ProductListResponse } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 20;

const ProductTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    physical: { label: 'Físico', color: 'bg-blue-100 text-blue-800' },
    made_to_order: { label: 'Bajo Pedido', color: 'bg-purple-100 text-purple-800' },
    service: { label: 'Servicio', color: 'bg-green-100 text-green-800' },
  };

  const { label, color } = typeConfig[type as keyof typeof typeConfig] ||
    { label: type, color: 'bg-gray-100 text-gray-800' };

  return (
    <Badge className={`${color} hover:${color} flex items-center gap-1`}>
      <ShoppingCart className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function ProductosPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  // Obtener companyId real desde el contexto de autenticación
  const companyId = user?.company_id;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [productType, setProductType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchProducts = async (page: number = 1, type: string = 'all', search: string = '') => {
    if (!token || !companyId) return;

    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: ITEMS_PER_PAGE
      };

      if (type && type !== 'all') {
        params.type = type as 'physical' | 'made_to_order' | 'service';
      }

      if (search) {
        params.search = search;
      }

      const response = await getProducts(companyId, token, params);
      // Debug: log raw api wrapper response
      console.log('[Productos] getProducts response:', response);

      if (response?.success && response?.data) {
        // Normalizar posibles formatos de respuesta
        const payload: any = response.data;
        console.log('[Productos] payload:', payload);

        // Soportar shape Laravel paginator: { products: { data: [...], total, current_page, last_page } }
        const paginator = payload?.products && !Array.isArray(payload.products)
          ? payload.products
          : (payload?.data && !Array.isArray(payload.data) && payload.data.products && !Array.isArray(payload.data.products)
            ? payload.data.products
            : (payload?.data?.products_pagination ? payload.data.products_pagination : (payload && !Array.isArray(payload) && payload.total !== undefined ? payload : null)));

        const normalized: Product[] = paginator?.data && Array.isArray(paginator.data)
          ? paginator.data
          : Array.isArray(payload?.data?.products)
            ? payload.data.products
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.products)
                ? payload.products
                : Array.isArray(payload)
                  ? payload
                  : [];

        console.log('[Productos] normalized products length:', normalized.length);
        setProducts(normalized);

        // Intentar leer total y paginación desde múltiples formatos posibles
        const total = paginator?.total
          ?? payload?.data?.products_pagination?.total
          ?? payload?.total
          ?? payload?.meta?.total
          ?? payload?.meta?.pagination?.total
          ?? payload?.pagination?.total
          ?? payload?.data?.total
          ?? payload?.total_count
          ?? payload?.count
          ?? (Array.isArray(payload) ? payload.length : normalized.length)
          ?? 0;

        const safeTotal = Number.isFinite(Number(total)) ? Number(total) : normalized.length;
        setTotalItems(safeTotal);

        const lastPage = paginator?.last_page
          ?? payload?.data?.products_pagination?.last_page
          ?? payload?.last_page
          ?? payload?.meta?.last_page
          ?? payload?.meta?.pagination?.last_page
          ?? (safeTotal ? Math.max(1, Math.ceil(safeTotal / ITEMS_PER_PAGE)) : 1);

        const current = paginator?.current_page
          ?? payload?.data?.products_pagination?.current_page
          ?? payload?.current_page
          ?? payload?.meta?.current_page
          ?? payload?.meta?.pagination?.current_page
          ?? page
          ?? 1;

        setTotalPages(Number.isFinite(Number(lastPage)) ? Number(lastPage) : 1);
        setCurrentPage(Number.isFinite(Number(current)) ? Number(current) : 1);
        setError(null);
        setHasOrderChanges(false);
      } else {
        setProducts([]);
        setTotalItems(0);
        setError('Error al cargar los productos');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al conectar con el servidor');
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (token && companyId) {
      fetchProducts(currentPage, productType !== 'all' ? productType : 'all', debouncedSearch);
    } else {
      // Evitar spinner infinito cuando no hay companyId/token aún
      setLoading(false);
    }
  }, [token, companyId, currentPage, productType, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleTypeChange = (value: string) => {
    setProductType(value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    console.log('[Drag] START - index:', index, 'product:', products[index]?.name);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    console.log('[Drag] ENTER - from:', draggedIndex, 'to:', index);

    setProducts((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, moved);
      console.log('[Drag] Reordered products:', updated.map((p, i) => ({ pos: i + 1, id: p.id, name: p.name })));
      return updated;
    });
    setDraggedIndex(index);
    setHasOrderChanges(true);
    console.log('[Drag] hasOrderChanges set to true');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    console.log('[Drag] END - hasOrderChanges:', hasOrderChanges);
    setDraggedIndex(null);
    // Pequeño timeout para no disparar navegación por click inmediato después de un drag
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleSaveOrder = async () => {
    console.log('[Reorder] handleSaveOrder called');
    console.log('[Reorder] token:', token ? 'present' : 'missing');
    console.log('[Reorder] companyId:', companyId);
    console.log('[Reorder] products.length:', products.length);

    if (!token || !companyId || products.length === 0) {
      console.log('[Reorder] Aborted - missing data');
      return;
    }
    try {
      setSavingOrder(true);
      const items = products.map((product, index) => ({
        product_id: product.id as string | number,
        position: index + 1,
      }));

      console.log('[Reorder] Sending items to API:', JSON.stringify(items, null, 2));
      console.log('[Reorder] API URL will be: /api/companies/' + companyId + '/products/reorder');

      const response = await reorderProducts(companyId, token, items);

      console.log('[Reorder] API Response:', JSON.stringify(response, null, 2));

      if (response?.success) {
        console.log('[Reorder] SUCCESS');
        toast({
          title: 'Orden guardado',
          description: 'El orden de los productos se actualizó correctamente.',
        });
        setHasOrderChanges(false);
      } else {
        console.log('[Reorder] FAILED - response.success is false');
        console.log('[Reorder] Error message:', response?.message || response?.error);
        toast({
          title: 'No se pudo guardar el orden',
          description: response?.message || 'Intenta nuevamente en unos momentos.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[Reorder] EXCEPTION:', err);
      toast({
        title: 'Error al guardar el orden',
        description: 'Ocurrió un problema al conectar con el servidor.',
        variant: 'destructive',
      });
    } finally {
      setSavingOrder(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-600 mt-1">Administra los productos de tu catálogo</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={productType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="physical">Físicos</SelectItem>
              <SelectItem value="made_to_order">Bajo pedido</SelectItem>
              <SelectItem value="service">Servicios</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/dashboard/productos/nuevo" className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Lista de Productos</CardTitle>
            <div className="text-sm text-slate-500">
              Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} productos
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="grid grid-cols-12 items-center gap-2 p-3 font-medium text-slate-600 border-b bg-slate-50 text-sm">
              <div className="col-span-1 pl-2 text-center">Posición</div>
              <div className="col-span-3">Producto</div>
              <div className="col-span-1 text-center">Categoría</div>
              <div className="col-span-1 text-right pr-2">Precio</div>
              <div className="col-span-1 text-center">Puntos</div>
              <div className="col-span-1 text-center">Stock</div>
              <div className="col-span-1 text-center">Tipo</div>
              <div className="col-span-1">Ubicaciones</div>
              <div className="col-span-1 text-center">Estado</div>
              <div className="col-span-1"></div>
            </div>

            {error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fetchProducts(currentPage, productType)}
                >
                  Reintentar
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No hay productos registrados</p>
                <p className="text-sm mt-2">Comienza agregando tu primer producto</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/productos/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Producto
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {(Array.isArray(products) ? products : []).map((product, index) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 items-start gap-2 p-2 border-b hover:bg-slate-50 transition-colors text-sm h-16 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDragEnd}
                    onClick={() => {
                      if (!isDragging) {
                        router.push(`/dashboard/productos/${product.id}`);
                      }
                    }}
                  >
                    <div className="col-span-1 flex items-center justify-center text-xs text-slate-500">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-start h-full">
                      <div className="flex-shrink-0 mt-1">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-8 w-8 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-slate-200 flex items-center justify-center">
                            <div className="h-3.5 w-3.5 text-slate-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m7.5 4.27 9 5.15" />
                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                <path d="m3.3 7 8.7 5 8.7-5" />
                                <path d="M12 22V12" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 ml-2">
                        <p className="font-medium text-slate-900 truncate text-sm leading-tight">{product.name}</p>
                        {product.category && (
                          <p className="text-xs text-slate-500 truncate leading-tight">{product.category}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 text-center flex items-center h-full justify-center">
                      <span className="text-xs text-slate-700 truncate max-w-[120px]">
                        {product.category || '-'}
                      </span>
                    </div>
                    <div className="col-span-1 text-right pr-2 flex items-center h-full">
                      <span className="font-medium text-sm">{formatCurrency(Number(product.price))}</span>
                    </div>
                    <div className="col-span-1 text-center flex items-center h-full justify-center">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {product.points || 0}
                      </span>
                    </div>
                    <div className="col-span-1 text-center flex items-center h-full justify-center">
                      {product.track_stock ? (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">
                          {product.locations?.reduce((sum, loc) => sum + (Number(loc.stock) || 0), 0) || 0}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-center items-center h-full">
                      <div className="scale-90">
                        <ProductTypeBadge type={product.product_type} />
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center h-full">
                      <div className="max-h-12 overflow-y-auto py-1">
                        {product.locations?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 items-center">
                            {product.locations.slice(0, 2).map(loc => (
                              <Badge
                                key={loc.id}
                                variant="outline"
                                className="text-[11px] truncate max-w-[90px] h-5 flex items-center px-1.5"
                              >
                                {loc.name || 'Ubicación'}
                              </Badge>
                            ))}
                            {product.locations.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-[11px] h-5 flex items-center px-1.5"
                              >
                                +{product.locations.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center items-center h-full">
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={`${product.is_active ? 'bg-green-50 text-green-700 hover:bg-green-50' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'} text-[11px] h-5 px-1.5`}
                      >
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex items-center justify-end h-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/productos/${product.id}`);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      {hasOrderChanges && (
        <Button
          type="button"
          variant="default"
          disabled={savingOrder}
          onClick={() => {
            console.log('[Button] Guardar orden clicked! hasOrderChanges:', hasOrderChanges, 'savingOrder:', savingOrder);
            handleSaveOrder();
          }}
          className="fixed bottom-16 right-8 sm:bottom-20 sm:right-14 rounded-full shadow-xl shadow-primary/25 pl-6 pr-10 py-5 text-base z-40"
          style={{
            bottom: 'max(env(safe-area-inset-bottom, 3rem), 3rem)',
            right: 'max(env(safe-area-inset-right, 2.75rem), 2.75rem)',
          }}
        >
          {savingOrder ? 'Guardando...' : 'Guardar orden'}
        </Button>
      )}
    </div>
  );
}
