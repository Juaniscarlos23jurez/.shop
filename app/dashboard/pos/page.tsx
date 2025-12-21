"use client";

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { api, BASE_URL } from "@/lib/api/api";
import { ordersApi } from "@/lib/api/orders";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { useToast } from "@/hooks/use-toast";

// Tipo local de producto para POS (precio como string)
type PosProduct = {
  id: number;
  name: string;
  price: string; // API devuelve string
  sku?: string;
  image_url?: string;
  [key: string]: any;
};

interface CartItem extends PosProduct {
  id: number;
  name: string;
  price: string;
  quantity: number;
  sku?: string;
  images?: Array<{ url: string }>;
}

interface Order {
  id: string | number;
  items: Array<{
    id: number;
    name: string;
    price: string;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
  customerId?: string;
  pointsEarned?: number;
}

interface AcceptedOrder {
  id: number;
  status: string;
  total: string;
  created_at: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    product: {
      id: number;
      name: string;
      price: string;
    };
  }>;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function PuntoVentaPage() {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const authToken = token || ''; // Ensure token is always a string
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderDescription, setOrderDescription] = useState('');
  // Obtener el companyId real del usuario autenticado
  const companyId = user?.company_id;
  const [locationId, setLocationId] = useState<string | number | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState<AcceptedOrder[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<AcceptedOrder[]>([]);
  const [readyOrders, setReadyOrders] = useState<AcceptedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [activeOrderTab, setActiveOrderTab] = useState<'accepted' | 'preparing' | 'ready'>('accepted');
  const [activePosTab, setActivePosTab] = useState<'venta' | 'historial'>('venta');
  const [sales, setSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotal, setSalesTotal] = useState(0);
  const salesPerPage = 15;

  const getProductLocationPivot = (product: any) => {
    const loc = Array.isArray(product?.locations) ? product.locations[0] : null;
    return loc?.pivot || null;
  };

  const getAvailableStock = (product: any): number => {
    const pivot = getProductLocationPivot(product);
    return Number(pivot?.stock) || 0;
  };

  const isProductAvailableForSale = (product: any): boolean => {
    const trackStock = Boolean(product?.track_stock);
    if (!trackStock) return true;
    const pivot = getProductLocationPivot(product);
    const isAvailable = pivot?.is_available !== false;
    return isAvailable && getAvailableStock(product) > 0;
  };

  // Define fetchSalesHistory here
  const fetchSalesHistory = async () => {
    if (!token || !companyId || locationId === null) return;
    try {
      setSalesLoading(true);
      console.log(`[POS] Fetching sales history for company ${companyId}, location ${locationId}, page ${salesPage}`);
      const response = await api.sales.listSales(
        {
          location_id: locationId,
          page: salesPage,
          per_page: salesPerPage,
        },
        token
      );

      if (response.success && response.data) {
        setSales(response.data.data);
        setSalesTotal(response.data.total);
      } else {
        setSales([]);
        setSalesTotal(0);
        toast({
          title: 'Error',
          description: response.message || 'No se pudo cargar el historial de ventas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[POS] Error fetching sales history:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cargar el historial de ventas',
        variant: 'destructive',
      });
    } finally {
      setSalesLoading(false);
    }
  };

  // Cargar órdenes pendientes del localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      setPendingOrders(JSON.parse(savedOrders));
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!companyId || locationId === null) {
      // Evitar spinner infinito si aún no tenemos credenciales completas
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/public/locations/${locationId}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[POS] Error fetching products by location:', data);
        setProducts([]);
        return;
      }

      const root: any = data?.data ?? data;
      const normalized: PosProduct[] = Array.isArray(root)
        ? root
        : Array.isArray(root?.data)
          ? root.data
          : Array.isArray(root?.products)
            ? root.products
            : [];

      setProducts(normalized);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, locationId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cargar historial cuando el tab esté activo o cambie la página/ubicación
  useEffect(() => {
    if (activePosTab === 'historial') {
      fetchSalesHistory();
    }
  }, [activePosTab, salesPage, locationId, token]);

  // Cargar ubicación (location_id) por defecto
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (!token) return;
        const locResp = await api.userCompanies.getLocations(token);
        if (locResp.success) {
          const first = (locResp.data?.locations || [])[0];
          if (first?.id) {
            setLocationId(first.id);
          } else {
            // Fallback si no hay ubicaciones registradas
            setLocationId(1);
          }
        } else {
          setLocationId(1);
        }
      } catch (e) {
        console.error('Error fetching locations:', e);
        setLocationId(1);
      }
    };
    fetchLocations();
  }, [token]);

  // Cargar órdenes en progreso (accepted, preparing, ready)
  const fetchOrdersInProgress = async () => {
    if (!token || !companyId) return;
    try {
      setLoadingOrders(true);
      console.log('[POS] Fetching orders in progress');
      
      const statuses = ['accepted', 'preparing', 'ready'];
      
      for (const status of statuses) {
        try {
          const response = await ordersApi.getAllOrders(companyId, token, {
            status,
            per_page: 50
          });
          console.log(`[POS] ${status} orders response:`, response);
          
          if (response.success && response.data) {
            const ordersData = response.data.data || response.data;
            const orders = Array.isArray(ordersData) ? ordersData : [];
            
            if (status === 'accepted') setAcceptedOrders(orders);
            if (status === 'preparing') setPreparingOrders(orders);
            if (status === 'ready') setReadyOrders(orders);
          }
        } catch (error) {
          console.error(`[POS] Error fetching ${status} orders:`, error);
        }
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  // Cargar órdenes en progreso al montar
  useEffect(() => {
    if (token && companyId) {
      fetchOrdersInProgress();
      // Recargar cada 10 segundos
      const interval = setInterval(fetchOrdersInProgress, 10000);
      return () => clearInterval(interval);
    }
  }, [token, companyId]);

  const addToCart = (product: PosProduct) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);

      const trackStock = Boolean((product as any)?.track_stock);
      if (trackStock) {
        const availableStock = getAvailableStock(product);
        const currentQty = existingItem?.quantity || 0;
        if (!isProductAvailableForSale(product) || currentQty + 1 > availableStock) {
          toast({
            title: 'Stock insuficiente',
            description: `Disponible: ${availableStock} unidad(es)`,
            variant: 'destructive',
          });
          return prevCart;
        }
      }

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        (product.name || '')
          .toLowerCase()
          .includes((searchTerm || '').toLowerCase()) ||
        (product.sku || '')
          .toLowerCase()
          .includes((searchTerm || '').toLowerCase())
      )
    : [];

  const cartTotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  const handlePaymentComplete = async (paymentData: { 
    method: string;
    amount: number;
    change?: number;
    userId?: string;
    pointsEarned?: number;
    note?: string;
    couponCode?: string;
  }) => {
    try {
      setIsProcessing(true);
      
      // Validar token
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Validar que hay items en el carrito
      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Preparar datos para la API
      const mappedItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        notes: paymentData.note || undefined,
      }));
      const locId = locationId ?? 1;

      // Convertir user_id a número si existe
      const userId = paymentData.userId ? parseInt(paymentData.userId, 10) : undefined;

      console.log('Creando venta con datos:', {
        location_id: locId,
        user_id: userId,
        points_earned: paymentData.pointsEarned,
        payment_method: paymentData.method,
        coupon_code: paymentData.couponCode,
        notes: paymentData.note,
        items: mappedItems,
      });

      // Llamar API para crear la venta
      const saleResp = await api.sales.createSale(
        {
          location_id: locId,
          user_id: userId,
          ...(typeof paymentData.pointsEarned === 'number' ? { points_earned: paymentData.pointsEarned } : {}),
          ...(paymentData.couponCode ? { coupon_code: paymentData.couponCode } : {}),
          ...(paymentData.note ? { notes: paymentData.note } : {}),
          payment_method: paymentData.method as any,
          items: mappedItems,
        },
        token
      );

      console.log('Respuesta de la API:', saleResp);

      if (!saleResp.success) {
        throw new Error(saleResp.message || 'No se pudo crear la venta');
      }

      // Extraer información de la venta creada
      const saleData = saleResp.data?.sale || saleResp.data;
      const pointsEarnedFromAPI = saleData?.points_earned || paymentData.pointsEarned || 0;
      const discountApplied = saleData?.discount_amount ? parseFloat(saleData.discount_amount) : 0;

      // Si hay una orden pendiente actual, eliminarla
      if (currentOrderId) {
        const updatedOrders = pendingOrders.filter(order => order.id !== currentOrderId);
        setPendingOrders(updatedOrders);
        localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
        setCurrentOrderId(null);
      }

      // Limpiar el carrito y cerrar el modal
      setCart([]);
      setOrderDescription('');

      // Refrescar inventario para que los cards sean reactivos
      await fetchProducts();
      
      const discountMessage = discountApplied > 0 ? ` | Descuento: $${discountApplied.toFixed(2)}` : '';
      const pointsMessage = pointsEarnedFromAPI > 0 ? ` | +${pointsEarnedFromAPI} puntos` : '';
      
      toast({
        title: 'Venta completada',
        description: `Venta #${saleData?.id || 'N/A'} creada correctamente. Total: $${cartTotal.toFixed(2)}${discountMessage}${pointsMessage}`,
      });

    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast({
        title: 'Error al procesar la venta',
        description: error instanceof Error ? error.message : 'No se pudo procesar el pago. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const generateOrder = async () => {
    try {
      setIsProcessing(true);
      
      // Crear la orden pendiente
      const orderData: Order = {
        id: Date.now().toString(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal,
        status: 'pending' as const,
        description: orderDescription || `Orden #${Date.now().toString()}`,
        createdAt: new Date().toISOString(),
      };

      // Actualizar el estado y localStorage
      const updatedOrders = [...pendingOrders, orderData];
      setPendingOrders(updatedOrders);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));

      // Limpiar carrito después de generar la orden
      setCart([]);
      setOrderDescription('');

      toast({
        title: 'Orden Generada',
        description: 'La orden ha sido guardada y está pendiente de pago',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error al generar la orden:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al generar la orden',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!token || !companyId) return;
    try {
      setUpdatingOrderId(orderId);
      console.log('[POS] Updating order status:', { orderId, newStatus });
      await ordersApi.updateOrderStatus(companyId, orderId, newStatus, token);
      
      // Actualizar lista local
      setAcceptedOrders(acceptedOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Si se completó, remover de la lista
      if (newStatus === 'completed') {
        setAcceptedOrders(acceptedOrders.filter(order => order.id !== orderId));
      }
      
      toast({
        title: 'Éxito',
        description: `Orden #${orderId} actualizada a ${newStatus}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('[POS] Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la orden',
        variant: 'destructive'
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      accepted: 'Aceptada',
      preparing: 'Preparando',
      ready: 'Lista',
      completed: 'Completada',
    };
    return labels[status] || status;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Punto de Venta</h2>
        </div>
        <div className="mt-2 border-b flex gap-2">
          <button
            onClick={() => setActivePosTab('venta')}
            className={`px-4 py-2 font-medium transition-colors ${
              activePosTab === 'venta' ? 'text-primary border-b-2 border-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Venta
          </button>
          <button
            onClick={() => setActivePosTab('historial')}
            className={`px-4 py-2 font-medium transition-colors ${
              activePosTab === 'historial' ? 'text-primary border-b-2 border-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historial
          </button>
        </div>
        {activePosTab === 'venta' && (
        <>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Productos */}
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Productos</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p>No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    (() => {
                      const available = isProductAvailableForSale(product);
                      const trackStock = Boolean((product as any)?.track_stock);
                      const stock = trackStock ? getAvailableStock(product) : null;

                      return (
                    <div 
                      key={product.id} 
                      className={`border rounded-lg p-4 transition-shadow ${available ? 'hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                      onClick={() => {
                        if (!available) return;
                        addToCart(product);
                      }}
                    >
                      <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <p className="font-bold mt-1">${parseFloat(product.price).toFixed(2)}</p>
                      {trackStock && (
                        <p className={`mt-1 text-xs ${stock && stock > 0 ? 'text-slate-600' : 'text-red-600 font-semibold'}`}>
                          Stock: {stock}
                        </p>
                      )}
                    </div>
                      );
                    })()
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carrito */}
          <Card>
            <CardHeader>
              <CardTitle>Carrito ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">El carrito está vacío</p>
                  <p className="text-sm text-muted-foreground mt-1">Haz clic en un producto para agregarlo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">${parseFloat(item.price).toFixed(2)} c/u</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.id);
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              type="button"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-muted-foreground">
                            {item.sku}
                          </p>
                          <p className="font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex">
                        <Input
                          placeholder="Descripción de la orden (opcional)"
                          value={orderDescription}
                          onChange={(e) => setOrderDescription(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline"
                          className="flex-1"
                          type="button"
                          onClick={() => generateOrder()}
                          disabled={cart.length === 0 || isProcessing}
                        >
                          {isProcessing ? 'Generando...' : 'Generar Orden'}
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => cart.length > 0 && setIsPaymentModalOpen(true)}
                          disabled={cart.length === 0 || isProcessing}
                        >
                          {isProcessing ? 'Procesando...' : 'Finalizar Venta'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Órdenes en Progreso - Con Tabs */}
        {(acceptedOrders.length > 0 || preparingOrders.length > 0 || readyOrders.length > 0) && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Órdenes en Preparación</CardTitle>
            </CardHeader>
            
            {/* Tabs */}
            <div className="px-6 flex gap-2 border-b">
              <button
                onClick={() => setActiveOrderTab('accepted')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeOrderTab === 'accepted'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aceptadas ({acceptedOrders.length})
              </button>
              <button
                onClick={() => setActiveOrderTab('preparing')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeOrderTab === 'preparing'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Preparando ({preparingOrders.length})
              </button>
              <button
                onClick={() => setActiveOrderTab('ready')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeOrderTab === 'ready'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Listas ({readyOrders.length})
              </button>
            </div>

            <CardContent className="pt-6">
              {activeOrderTab === 'accepted' && acceptedOrders.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No hay órdenes aceptadas</p>
                </div>
              )}
              {activeOrderTab === 'preparing' && preparingOrders.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No hay órdenes en preparación</p>
                </div>
              )}
              {activeOrderTab === 'ready' && readyOrders.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No hay órdenes listas</p>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(activeOrderTab === 'accepted' ? acceptedOrders : activeOrderTab === 'preparing' ? preparingOrders : readyOrders).map((order) => {
                  const statusSteps = ['accepted', 'preparing', 'ready', 'completed'];
                  const currentStepIndex = statusSteps.indexOf(order.status);
                  const progressPercent = ((currentStepIndex + 1) / statusSteps.length) * 100;

                  return (
                    <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">Orden #{order.id}</h3>
                            <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Cliente: {order.user.name}</p>
                      </div>

                      {/* Items */}
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-xs text-slate-500 mb-2 font-semibold">PRODUCTOS:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-sm flex justify-between">
                              <span className="text-slate-700">{item.product.name}</span>
                              <span className="text-slate-600">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-700">Progreso</span>
                          <span className="text-xs text-slate-500">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-600">
                          <span>Aceptada</span>
                          <span>Preparando</span>
                          <span>Lista</span>
                          <span>Completada</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="mb-4 pb-4 border-b">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-slate-700">Total:</span>
                          <span className="text-sm font-bold text-emerald-600">${parseFloat(order.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="space-y-2">
                        {order.status !== 'completed' && (
                          <>
                            {order.status === 'accepted' && (
                              <Button
                                onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                disabled={updatingOrderId === order.id}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                                size="sm"
                              >
                                {updatingOrderId === order.id ? 'Actualizando...' : 'Comenzar a Preparar'}
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                disabled={updatingOrderId === order.id}
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                                size="sm"
                              >
                                {updatingOrderId === order.id ? 'Actualizando...' : 'Marcar como Lista'}
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                disabled={updatingOrderId === order.id}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                size="sm"
                              >
                                {updatingOrderId === order.id ? 'Completando...' : 'Completar Orden'}
                              </Button>
                            )}
                          </>
                        )}
                        {order.status === 'completed' && (
                          <div className="text-center py-2 bg-emerald-50 rounded text-emerald-700 text-sm font-semibold">
                            ✓ Orden Completada
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Órdenes Pendientes */}
        {pendingOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Pendientes ({pendingOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-muted/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Orden #{order.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {order.description && (
                          <p className="text-sm mt-1 text-primary font-medium italic">
                            {order.description}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            // Cargar la orden al carrito para procesar el pago
                            setCart(order.items.map(item => ({
                              ...products.find(p => p.id === item.id)!,
                              quantity: item.quantity
                            })));
                            // Guardar el ID de la orden actual para eliminarla después del pago
                            setCurrentOrderId(order.id);
                            // Abrir modal de pago
                            setIsPaymentModalOpen(true);
                          }}
                        >
                          Cobrar Ahora
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </>
        )}

        {activePosTab === 'historial' && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Cargando ventas...</p>
                </div>
              ) : sales.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p>No hay ventas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-600 border-b">
                          <th className="py-2 pr-4">#</th>
                          <th className="py-2 pr-4">Fecha</th>
                          <th className="py-2 pr-4">Cliente</th>
                          <th className="py-2 pr-4">Método</th>
                          <th className="py-2 pr-4">Estado</th>
                          <th className="py-2 pr-4">Total</th>
                          <th className="py-2 pr-4">Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((s: any) => (
                          <tr key={s.id} className="border-b hover:bg-slate-50">
                            <td className="py-2 pr-4 font-medium">{s.id}</td>
                            <td className="py-2 pr-4 text-slate-600">{new Date(s.created_at).toLocaleString()}</td>
                            <td className="py-2 pr-4">{s.user?.name || 'N/A'}</td>
                            <td className="py-2 pr-4">{s.payment_method}</td>
                            <td className="py-2 pr-4">
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                                {s.payment_status}
                              </span>
                            </td>
                            <td className="py-2 pr-4 font-bold text-emerald-600">{`$${parseFloat(s.total || '0').toFixed(2)}`}</td>
                            <td className="py-2 pr-4">{Array.isArray(s.items) ? s.items.length : 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm text-slate-600">Página {salesPage}</div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                        disabled={salesPage <= 1 || salesLoading}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSalesPage((p) => p + 1)}
                        disabled={salesLoading || (salesPage * salesPerPage >= salesTotal && sales.length < salesPerPage)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={cartTotal}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}