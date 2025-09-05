'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart } from 'lucide-react';
import { getProducts } from '@/lib/api/products';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
// Importing getProducts directly from products.ts
import { Product, ProductListResponse } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ITEMS_PER_PAGE = 10;

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
  const { token } = useAuth();
  // For now, we'll use a placeholder company ID
  // In a real app, this would come from the user's auth context
  const companyId = '1';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productType, setProductType] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (page: number = 1, type: string = 'all') => {
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
      
      const response = await getProducts(companyId, token, params);
      
      if (response.success && response.data) {
        setProducts(response.data.data);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      } else {
        setError('Error al cargar los productos');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && companyId) {
      fetchProducts(currentPage, productType !== 'all' ? productType : 'all');
    }
  }, [token, companyId, currentPage, productType]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleTypeChange = (value: string) => {
    setProductType(value);
    setCurrentPage(1); // Reset to first page when changing filters
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
              Mostrando {products.length} de {totalPages * ITEMS_PER_PAGE} productos
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="grid grid-cols-12 items-center gap-2 p-3 font-medium text-slate-600 border-b bg-slate-50 text-sm">
              <div className="col-span-4 pl-2">Producto</div>
              <div className="col-span-1 text-right pr-2">Precio</div>
              <div className="col-span-1 text-center">Puntos</div>
              <div className="col-span-1 text-center">Stock</div>
              <div className="col-span-1 text-center">Tipo</div>
              <div className="col-span-2">Ubicaciones</div>
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
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="grid grid-cols-12 items-start gap-2 p-2 border-b hover:bg-slate-50 transition-colors text-sm h-16"
                  >
                    <div className="col-span-4 flex items-start pl-2 h-full">
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
                              <path d="m7.5 4.27 9 5.15"/>
                              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                              <path d="m3.3 7 8.7 5 8.7-5"/>
                              <path d="M12 22V12"/>
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
                    <div className="col-span-2 flex items-center h-full">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/dashboard/productos/${product.id}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </Link>
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
    </div>
  );
}
