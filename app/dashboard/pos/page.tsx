"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { Product } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface CartItem extends Product {
  id: number;
  name: string;
  price: string;
  quantity: number;
  sku?: string;
  images?: Array<{ url: string }>;
}

interface Order {
  id: string;
  items: Array<{
    id: number;
    name: string;
    price: string;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
  customerId?: string;
  pointsEarned?: number;
}

export default function PuntoVentaPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const authToken = token || ''; // Ensure token is always a string
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderDescription, setOrderDescription] = useState('');
  const companyId = '1'; // ID de la compañía como string
  const [locationId, setLocationId] = useState<string | number | null>(null);

  // Cargar órdenes pendientes del localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      setPendingOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.products.getProducts(companyId, token || '', 1, 100);
        if (response.data) {
          setProducts(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    }
  }, [token]);

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

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        items: mappedItems,
      });

      // Llamar API para crear la venta
      const saleResp = await api.sales.createSale(
        {
          location_id: locId,
          user_id: userId,
          ...(typeof paymentData.pointsEarned === 'number' ? { points_earned: paymentData.pointsEarned } : {}),
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
      
      toast({
        title: 'Venta completada',
        description: `Venta #${saleData?.id || 'N/A'} creada correctamente. Total: $${cartTotal.toFixed(2)}${pointsEarnedFromAPI > 0 ? ` | +${pointsEarnedFromAPI} puntos` : ''}`,
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Punto de Venta</h2>
        </div>
        
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
                    <div 
                      key={product.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
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
                    </div>
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