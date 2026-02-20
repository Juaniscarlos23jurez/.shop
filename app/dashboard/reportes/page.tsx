"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ShoppingCart,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { Sale, SalesStatistics } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useThermalPrinter } from "@/hooks/use-thermal-printer";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompany } from "@/contexts/CompanyContext";

export default function ReportesPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [statistics, setStatistics] = useState<SalesStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { isConnected: isPrinterConnected, connect: connectPrinter, disconnect: disconnectPrinter, printTicket } = useThermalPrinter();
  const { company } = useCompany();

  const handleTogglePrinterConnection = async () => {
    try {
      if (isPrinterConnected) {
        disconnectPrinter();
        toast({
          title: 'Impresora desconectada',
          description: 'Se desconectó la sesión con QZ Tray.',
        });
        return;
      }

      await connectPrinter();
      toast({
        title: 'Impresora conectada',
        description: 'Conectado a QZ Tray. Ya puedes imprimir.',
      });
    } catch (error) {
      console.error('[REPORTES] Error connecting to QZ Tray:', error);
      toast({
        title: 'No se pudo conectar',
        description: 'Abre QZ Tray en esta misma computadora y activa Allow unsigned requests. Si estás en Vercel (HTTPS), habilita conexiones seguras en QZ Tray.',
        variant: 'destructive',
      });
    }
  };

  // Filters
  const [locationId, setLocationId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locations, setLocations] = useState<Array<{ id: number; name: string }>>([]);

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (!token) return;
        const response = await api.userCompanies.getLocations(token);
        if (response.success && response.data?.locations) {
          setLocations(response.data.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, [token]);

  // Load sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      if (!token) return;

      const params: any = {
        page: currentPage,
        per_page: 15,
      };

      if (locationId) params.location_id = locationId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.sales.listSales(params, token);

      if (response.success && response.data) {
        setSales(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las ventas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      if (!token) return;

      const params: any = {};
      if (locationId) params.location_id = locationId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.sales.getStatistics(params, token);

      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSales();
      fetchStatistics();
    }
  }, [token, currentPage, locationId, dateFrom, dateTo]);

  const handleViewDetails = async (sale: Sale) => {
    try {
      if (!token) return;

      // If we already have the full details in the row (which we might not), use it.
      // But typically listSales returns summary, getSale returns full details including items.
      const response = await api.sales.getSale(sale.id, token);
      if (response.success && response.data) {
        setSelectedSale(response.data.sale || response.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles de la venta',
        variant: 'destructive',
      });
    }
  };

  const handlePrintTicket = (sale: Sale) => {
    if (!sale) return;

    // Ensure we have items to print
    const itemsToPrint = sale.items?.map(item => ({
      name: item.product?.name || `Product #${item.product_id}`,
      quantity: item.quantity,
      price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : Number(item.unit_price || 0)
    })) || [];

    const totalToPrint = sale.total ?? sale.total_amount ?? 0;

    printTicket({
      companyName: company?.name || "Ticket de Venta",
      items: itemsToPrint,
      total: typeof totalToPrint === 'string' ? parseFloat(totalToPrint) : Number(totalToPrint),
      date: new Date(sale.created_at).toLocaleString('es-MX'),
      saleId: sale.id,
      paymentMethod: getPaymentMethodLabel(sale.payment_method)
    });
  };

  const handleClearFilters = () => {
    setLocationId('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      points: 'Puntos',
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      completed: 'Completada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
      failed: 'Fallida',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      sale.id.toString().includes(search) ||
      sale.location?.name?.toLowerCase().includes(search) ||
      sale.user?.name?.toLowerCase().includes(search) ||
      sale.employee?.name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes de Ventas</h2>
          <p className="text-muted-foreground">Historial y estadísticas de ventas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isPrinterConnected ? "outline" : "default"}
            onClick={handleTogglePrinterConnection}
            className={isPrinterConnected ? "border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50" : ""}
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinterConnected ? 'Impresora Conectada' : 'Conectar Impresora'}
            {isPrinterConnected && <CheckCircle2 className="ml-2 h-3 w-3" />}
          </Button>
          <Button variant="outline" className="gap-2">
            Exportar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.total_sales || 0}</div>
                <p className="text-xs text-muted-foreground">ventas registradas</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(Number(statistics?.total_revenue ?? 0))}
                </div>
                <p className="text-xs text-muted-foreground">en el período</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venta Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(Number(statistics?.average_sale ?? 0))}
                </div>
                <p className="text-xs text-muted-foreground">por venta</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Vendidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.total_items_sold || 0}</div>
                <p className="text-xs text-muted-foreground">productos</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sucursal</label>
              <Select value={locationId || 'all'} onValueChange={(v) => setLocationId(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las sucursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Desde</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Hasta</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ID, cliente, empleado..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Acciones</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-muted-foreground">No se encontraron ventas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Intenta ajustar los filtros o el rango de fechas
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">ID</th>
                      <th className="text-left p-4 font-medium">Fecha</th>
                      <th className="text-left p-4 font-medium">Sucursal</th>
                      <th className="text-left p-4 font-medium">Cliente</th>
                      <th className="text-left p-4 font-medium">Total</th>
                      <th className="text-left p-4 font-medium">Método Pago</th>
                      <th className="text-left p-4 font-medium">Estado</th>
                      <th className="text-left p-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">#{sale.id}</td>
                        <td className="p-4">
                          {new Date(sale.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4">{sale.location?.name || 'N/A'}</td>
                        <td className="p-4">
                          {sale.user?.name || sale.client?.name || 'Sin cliente'}
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrency(Number((sale.total ?? sale.total_amount) ?? 0))}
                        </td>
                        <td className="p-4">
                          {getPaymentMethodLabel(sale.payment_method)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(sale.sale_status)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(sale)}
                            className="gap-2"
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sale Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Venta #{selectedSale?.id}</DialogTitle>
            <DialogDescription>
              {selectedSale && new Date(selectedSale.created_at).toLocaleString('es-MX')}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sucursal</p>
                  <p className="text-sm">{selectedSale.location?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empleado</p>
                  <p className="text-sm">{selectedSale.employee?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="text-sm">
                    {selectedSale.user?.name || selectedSale.client?.name || 'Sin cliente'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Método de Pago</p>
                  <p className="text-sm">{getPaymentMethodLabel(selectedSale.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado de Pago</p>
                  <p className="text-sm">{getStatusBadge(selectedSale.payment_status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado de Venta</p>
                  <p className="text-sm">{getStatusBadge(selectedSale.sale_status)}</p>
                </div>
                {selectedSale.points_earned && selectedSale.points_earned > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Puntos Ganados</p>
                    <p className="text-sm font-medium text-emerald-600">
                      +{selectedSale.points_earned} puntos
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Productos</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Producto</th>
                        <th className="text-right p-3 text-sm font-medium">Cantidad</th>
                        <th className="text-right p-3 text-sm font-medium">Precio Unit.</th>
                        <th className="text-right p-3 text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3 text-sm">
                            {item.product?.name || `Producto #${item.product_id}`}
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                            )}
                          </td>
                          <td className="p-3 text-sm text-right">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">
                            {formatCurrency(Number(item.unit_price ?? 0))}
                          </td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(Number(item.subtotal ?? 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan={3} className="p-3 text-sm font-medium text-right">
                          Total:
                        </td>
                        <td className="p-3 text-sm font-bold text-right">
                          {formatCurrency(Number((selectedSale.total ?? selectedSale.total_amount) ?? 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        {selectedSale && (
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Cerrar
            </Button>
            {isPrinterConnected && (
              <Button
                onClick={() => handlePrintTicket(selectedSale)}
                className="gap-2 bg-slate-800 text-white hover:bg-slate-700"
              >
                <Printer className="h-4 w-4" />
                Reimprimir Ticket
              </Button>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
