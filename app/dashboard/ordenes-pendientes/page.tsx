"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api/orders';
import { api } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Package, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    price: string;
    image_url: string;
  };
}

interface Order {
  id: number;
  custom_user_id: number;
  company_id: number;
  location_id: number;
  coupon_id: null | number;
  status: string;
  delivery_method: string;
  payment_method: string;
  payment_status: string;
  subtotal: string;
  discount_amount: string;
  discount_type: null | string;
  tax: string;
  total: string;
  currency: string;
  payment_reference: null | string;
  payment_proof_url: null | string;
  points_earned: number;
  points_spent: number;
  delivery_address: null | string;
  notes: null | string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  location: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  coupon: null | any;
}

interface PendingOrdersResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Order[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: null | string;
    path: string;
    per_page: number;
    prev_page_url: null | string;
    to: number;
    total: number;
  };
}

export default function PendingOrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);

  const companyId = user?.company_id;

  // Resolve companyId locally if context does not provide it
  useEffect(() => {
    const resolveCompany = async () => {
      try {
        if (companyId) {
          setResolvedCompanyId(companyId);
          console.log('[PendingOrdersPage] Using companyId from context', { companyId });
          return;
        }
        if (token && !resolvedCompanyId) {
          console.log('[PendingOrdersPage] Resolving companyId via /auth/profile/company');
          const res = await api.userCompanies.get(token);
          const cData: any = res?.data;
          const derived = cData?.id ?? cData?.company?.id ?? cData?.data?.id;
          if (derived) {
            setResolvedCompanyId(String(derived));
            console.log('[PendingOrdersPage] Resolved companyId from API', { derived: String(derived) });
          } else {
            console.warn('[PendingOrdersPage] Could not resolve companyId from API response', { cData });
          }
        }
      } catch (e) {
        console.error('[PendingOrdersPage] Error resolving companyId:', e);
      }
    };
    resolveCompany();
  }, [companyId, token]);

  useEffect(() => {
    console.log('[PendingOrdersPage] mounted/useEffect', {
      user,
      companyId,
      resolvedCompanyId,
      hasToken: Boolean(token),
    });
    const idToUse = companyId || resolvedCompanyId;
    if (idToUse && token) {
      console.log('[PendingOrdersPage] Trigger fetchPendingOrders');
      fetchPendingOrders();
    } else {
      console.warn('[PendingOrdersPage] Skipping fetchPendingOrders: missing companyId or token', {
        companyId: idToUse,
        tokenPresent: Boolean(token),
      });
    }
  }, [companyId, resolvedCompanyId, token]);

  const fetchPendingOrders = async () => {
    const idToUse = companyId || resolvedCompanyId;
    if (!idToUse || !token) return;

    try {
      setLoading(true);
      setError(null);
      console.log('[PendingOrdersPage] Calling ordersApi.getPendingOrders', {
        companyId: idToUse,
        tokenPresent: Boolean(token),
        params: { per_page: 50 },
      });
      const response = await ordersApi.getPendingOrders(String(idToUse), token, {
        per_page: 50
      });
      console.log('[PendingOrdersPage] getPendingOrders response', response);
      if (response.success && response.data) {
        const ordersData = response.data.data || response.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        console.log('[PendingOrdersPage] Orders set', {
          count: Array.isArray(ordersData) ? ordersData.length : 0,
        });
      } else {
        setError('No se pudieron cargar las órdenes');
        console.error('[PendingOrdersPage] Unexpected response shape from getPendingOrders');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las órdenes';
      setError(errorMessage);
      console.error('Error fetching pending orders:', err);
    } finally {
      setLoading(false);
      console.log('[PendingOrdersPage] fetchPendingOrders finished');
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    if (!companyId || !token) return;

    try {
      setUpdatingOrderId(orderId);
      setError(null);
      console.log('[PendingOrdersPage] Approving order', { orderId, companyId });
      await ordersApi.updateOrderStatus(String(companyId), orderId, 'approved', token);
      console.log('[PendingOrdersPage] Order approved', { orderId });
      setSuccessMessage(`Orden #${orderId} aprobada exitosamente`);
      setOrders(orders.filter(order => order.id !== orderId));
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar la orden';
      setError(errorMessage);
      console.error('Error approving order:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    if (!companyId || !token) return;

    try {
      setUpdatingOrderId(orderId);
      setError(null);
      console.log('[PendingOrdersPage] Rejecting order', { orderId, companyId });
      await ordersApi.updateOrderStatus(String(companyId), orderId, 'canceled', token);
      
      setSuccessMessage(`Orden #${orderId} rechazada`);
      setOrders(orders.filter(order => order.id !== orderId));
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar la orden';
      setError(errorMessage);
      console.error('Error rejecting order:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Efectivo',
      spei: 'SPEI',
      points: 'Puntos',
      card: 'Tarjeta'
    };
    return methods[method] || method;
  };

  const getDeliveryMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pickup: 'Recoger en tienda',
      delivery: 'Entrega a domicilio'
    };
    return methods[method] || method;
  };

  if (loading) {
    console.log('[PendingOrdersPage] Rendering loading state');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600">Cargando órdenes pendientes...</p>
        </div>
      </div>
    );
  }

  console.log('[PendingOrdersPage] Rendering main view', { ordersCount: orders.length, hasError: Boolean(error) });
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-8 w-8 text-emerald-500" />
              Órdenes Pendientes
            </h1>
            <p className="text-slate-600 mt-2">
              Revisa y aprueba las órdenes que requieren tu aprobación
            </p>
          </div>
          <Button
            onClick={fetchPendingOrders}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No hay órdenes pendientes
            </h3>
            <p className="text-slate-500">
              Todas las órdenes han sido procesadas. ¡Buen trabajo!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Orden #{order.id}</CardTitle>
                    <CardDescription>
                      {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      ${parseFloat(order.total).toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-500">{order.currency}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-slate-500">Cliente</p>
                    <p className="font-semibold text-slate-900">{order.user.name}</p>
                    <p className="text-sm text-slate-600">{order.user.email}</p>
                    <p className="text-sm text-slate-600">{order.user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Sucursal</p>
                    <p className="font-semibold text-slate-900">{order.location.name}</p>
                    <p className="text-sm text-slate-600">{order.location.address}</p>
                    <p className="text-sm text-slate-600">{order.location.phone}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-slate-500">Método de Pago</p>
                    <p className="font-semibold text-slate-900">
                      {getPaymentMethodLabel(order.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Método de Entrega</p>
                    <p className="font-semibold text-slate-900">
                      {getDeliveryMethodLabel(order.delivery_method)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="pb-4 border-b">
                  <p className="text-sm text-slate-500 mb-3">Productos</p>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.product?.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-12 w-12 rounded object-cover border"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-slate-100 border flex items-center justify-center text-slate-400">IMG</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                            <p className="text-slate-600">
                              Cantidad: {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-900 whitespace-nowrap">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold">${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  {parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento:</span>
                      <span className="font-semibold">-${parseFloat(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impuesto:</span>
                    <span className="font-semibold">${parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total:</span>
                    <span className="text-emerald-600">${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Proof */}
                {order.payment_proof_url && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-slate-500 mb-2">Comprobante de pago</p>
                    <div className="flex items-start gap-4">
                      <img
                        src={order.payment_proof_url}
                        alt={`Comprobante orden #${order.id}`}
                        className="h-44 w-auto rounded border object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-sm text-slate-600">
                        <a
                          href={order.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          Ver imagen completa
                        </a>
                       </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-slate-500 mb-2">Notas</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded">{order.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleApproveOrder(order.id)}
                    disabled={updatingOrderId === order.id}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                  >
                    {updatingOrderId === order.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Aprobar Orden
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRejectOrder(order.id)}
                    disabled={updatingOrderId === order.id}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    {updatingOrderId === order.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rechazando...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Rechazar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
