"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api/orders';
import { api } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed';

export default function PendingOrdersPage() {
  const { user, token } = useAuth();
  const [ordersByStatus, setOrdersByStatus] = useState<Record<OrderStatus, Order[]>>({
    pending: [],
    accepted: [],
    preparing: [],
    ready: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [proofOpen, setProofOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus>('pending');

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
  }, [companyId, token, resolvedCompanyId]);

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
      console.log('[PendingOrdersPage] Fetching orders by status', { companyId: idToUse });
      
      const statuses: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
      const newOrdersByStatus: Record<OrderStatus, Order[]> = {
        pending: [],
        accepted: [],
        preparing: [],
        ready: [],
        completed: []
      };

      // Fetch orders for each status
      for (const status of statuses) {
        try {
          const response = await ordersApi.getAllOrders(String(idToUse), token, {
            status,
            per_page: 50
          });
          console.log(`[PendingOrdersPage] Fetched ${status} orders:`, response);
          
          if (response.success && response.data) {
            const ordersData = response.data.data || response.data;
            newOrdersByStatus[status] = Array.isArray(ordersData) ? ordersData : [];
          }
        } catch (err) {
          console.error(`[PendingOrdersPage] Error fetching ${status} orders:`, err);
        }
      }

      setOrdersByStatus(newOrdersByStatus);
      console.log('[PendingOrdersPage] All orders loaded:', newOrdersByStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las órdenes';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
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
      const order = ordersByStatus.pending.find(o => o.id === orderId);
      console.log('[PendingOrdersPage] Approving order', { orderId, companyId, paymentMethod: order?.payment_method });
      
      // For SPEI payments, mark as paid (payment_status changes to paid, status stays pending for kitchen)
      if (order?.payment_method === 'spei') {
        await ordersApi.updatePaymentStatus(String(companyId), orderId, 'paid', undefined, token);
        console.log('[PendingOrdersPage] Order payment marked as paid', { orderId });
        // Update local state to change status to accepted
        setOrdersByStatus(prev => ({
          ...prev,
          pending: prev.pending.filter(o => o.id !== orderId),
          accepted: [...prev.accepted, { ...order!, status: 'accepted', payment_status: 'paid' }]
        }));
      } else {
        // For other payment methods, update status to accepted
        await ordersApi.updateOrderStatus(String(companyId), orderId, 'accepted', token);
        console.log('[PendingOrdersPage] Order status updated to accepted', { orderId });
        setOrdersByStatus(prev => ({
          ...prev,
          pending: prev.pending.filter(o => o.id !== orderId),
          accepted: [...prev.accepted, { ...order!, status: 'accepted' }]
        }));
      }
      
      setSuccessMessage(`Orden #${orderId} aprobada exitosamente`);
      
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
      console.log('[PendingOrdersPage] Order rejected/canceled', { orderId });
      setSuccessMessage(`Orden #${orderId} rechazada`);
      setOrdersByStatus(prev => ({
        ...prev,
        pending: prev.pending.filter(o => o.id !== orderId)
      }));
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar la orden';
      setError(errorMessage);
      console.error('Error rejecting order:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!companyId || !token) return;

    try {
      setStatusChanging(orderId);
      setError(null);
      console.log('[PendingOrdersPage] Changing order status', { orderId, newStatus });
      await ordersApi.updateOrderStatus(String(companyId), orderId, newStatus, token);
      console.log('[PendingOrdersPage] Order status changed', { orderId, newStatus });
      
      // Find the order in current tab
      const order = ordersByStatus[activeTab].find(o => o.id === orderId);
      if (!order) return;

      // Update local state - move from current status to new status
      setOrdersByStatus(prev => {
        const updated = { ...prev };
        updated[activeTab] = updated[activeTab].filter(o => o.id !== orderId);
        updated[newStatus as OrderStatus] = [...updated[newStatus as OrderStatus], { ...order, status: newStatus }];
        return updated;
      });
      
      setSuccessMessage(`Estado actualizado a ${getStatusLabel(newStatus)}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado';
      setError(errorMessage);
      console.error('Error changing order status:', err);
    } finally {
      setStatusChanging(null);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      preparing: 'Preparando',
      ready: 'Lista',
      completed: 'Completada',
      canceled: 'Cancelada',
      failed: 'Fallida'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      canceled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const statusTabs: Array<{ status: OrderStatus; label: string; color: string }> = [
    { status: 'pending', label: 'Pendientes', color: 'yellow' },
    { status: 'accepted', label: 'Aceptadas', color: 'blue' },
    { status: 'preparing', label: 'Preparando', color: 'purple' },
    { status: 'ready', label: 'Listas', color: 'green' },
    { status: 'completed', label: 'Completadas', color: 'emerald' }
  ];

  console.log('[PendingOrdersPage] Rendering main view', { ordersByStatus, hasError: Boolean(error) });
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-8 w-8 text-emerald-500" />
              Órdenes
            </h1>
            <p className="text-slate-600 mt-2">
              Revisa, aprueba y gestiona las órdenes por estado
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto pb-2">
        {statusTabs.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === status
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label} ({ordersByStatus[status].length})
          </button>
        ))}
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
      {ordersByStatus[activeTab].length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No hay órdenes {getStatusLabel(activeTab).toLowerCase()}
            </h3>
            <p className="text-slate-500">
              No hay órdenes en este estado por el momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersByStatus[activeTab].map((order: Order) => (
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
                {/* Order Status Badge */}
                <div className="flex items-center gap-2 pb-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {order.payment_status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Pago: {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                <div className="pb-4 border-b">
                  <p className="text-sm text-slate-500 mb-2">Cliente</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{order.user.name}</p>
                    <p className="text-sm text-slate-600">{order.user.email}</p>
                    <p className="text-sm text-slate-600">{order.user.phone}</p>
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

                {/* Location Info */}
                {order.location && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-slate-500 mb-2">Ubicación</p>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{order.location.name}</p>
                      <p className="text-sm text-slate-600">{order.location.address}</p>
                      <p className="text-sm text-slate-600">{order.location.phone}</p>
                    </div>
                  </div>
                )}

                {/* Delivery Address for delivery orders */}
                {order.delivery_method === 'delivery' && order.delivery_address && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-slate-500 mb-2">Dirección de Entrega</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded">{order.delivery_address}</p>
                  </div>
                )}

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
                      <button
                        type="button"
                        onClick={() => { setProofUrl(order.payment_proof_url!); setProofOpen(true); }}
                        className="focus:outline-none"
                        aria-label={`Ver comprobante orden #${order.id}`}
                      >
                        <img
                          src={order.payment_proof_url}
                          alt={`Comprobante orden #${order.id}`}
                          className="h-44 w-auto rounded border object-cover hover:opacity-80 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                      <div className="text-sm">
                        <Button
                          type="button"
                          className="bg-amber-500 hover:bg-amber-600 text-white rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                          onClick={() => { setProofUrl(order.payment_proof_url!); setProofOpen(true); }}
                        >
                          Ver imagen completa
                        </Button>
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

                {/* Status Change Select - for all tabs except pending */}
                {order.status !== 'pending' && order.status !== 'canceled' && order.status !== 'failed' && (
                  <div className="pb-4 border-b">
                    <label className="text-sm text-slate-500 mb-2 block">Cambiar estado de preparación</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={statusChanging === order.id}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="accepted">Aceptada</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Lista</option>
                      <option value="completed">Completada</option>
                      <option value="canceled">Cancelada</option>
                      <option value="failed">Fallida</option>
                    </select>
                    {statusChanging === order.id && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Actualizando estado...
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons - only for pending orders */}
                {order.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
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
                          Aprobar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRejectOrder(order.id)}
                      disabled={updatingOrderId === order.id}
                      variant="destructive"
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info boxes for different tabs */}
      {activeTab === 'pending' && ordersByStatus[activeTab].length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ Revisa y aprueba o rechaza las órdenes pendientes
          </p>
        </div>
      )}

      {activeTab !== 'pending' && activeTab !== 'completed' && ordersByStatus[activeTab].length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Usa el selector en cada orden para cambiar su estado de preparación
          </p>
        </div>
      )}

      {activeTab === 'completed' && ordersByStatus[activeTab].length > 0 && (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700">
            ✓ Órdenes completadas. Usa el selector para cambiar estado si es necesario
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={proofOpen} onOpenChange={(open) => { setProofOpen(open); if (!open) setProofUrl(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprobante de pago</DialogTitle>
          </DialogHeader>
          <div className="w-full flex items-center justify-center">
            {proofUrl ? (
              <img
                src={proofUrl}
                alt="Comprobante de pago"
                className="max-h-[80vh] w-auto rounded border object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-slate-500 text-sm">Sin imagen</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}