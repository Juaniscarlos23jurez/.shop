"use client";

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, pointRulesApi } from "@/lib/api/api";
import { ordersApi } from "@/lib/api/orders";
import { Customer } from "@/types/customer";
import { CustomerSearch } from "@/components/pos/CustomerSearch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, History, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AsignarPuntosPage() {
  const { toast } = useToast();
  const { token, user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [pointRules, setPointRules] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch point rules
  useEffect(() => {
    const fetchRules = async () => {
      if (!token) return;
      let resolvedCompanyId: string | number | undefined = user?.company_id as any;

      if (!resolvedCompanyId) {
        try {
          const companyResp = await api.userCompanies.get(token);
          if (companyResp.success) {
            const d: any = companyResp.data;
            resolvedCompanyId = d?.company?.id ?? d?.id ?? d?.data?.company?.id ?? d?.data?.id;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (resolvedCompanyId) {
        setCompanyId(resolvedCompanyId);
        try {
          const response = await pointRulesApi.getPointRules(resolvedCompanyId, token);
          if (response.success && response.data) {
            setPointRules(response.data);
          }
        } catch (error) {
          console.error('Error fetching point rules:', error);
        }
      }
    };
    fetchRules();
  }, [token, user?.company_id]);

  // Calculate points when amount changes
  useEffect(() => {
    const total = parseFloat(amount) || 0;
    if (pointRules.length === 0 || total <= 0) {
      setPointsEarned(0);
      return;
    }

    const activeRule = pointRules.find(rule => {
      const now = new Date();
      const startsAt = new Date(rule.starts_at);
      const endsAt = new Date(rule.ends_at);
      return now >= startsAt && now <= endsAt;
    });

    if (activeRule) {
      const spendAmount = parseFloat(activeRule.spend_amount);
      const pointsPerRule = parseFloat(activeRule.points);
      
      // Match backend logic: floor(total / spend_amount) * points
      const earned = Math.floor(total / spendAmount) * pointsPerRule;
      setPointsEarned(earned);
    } else {
      setPointsEarned(0);
    }
  }, [amount, pointRules]);

  // Fetch points history for company
  const fetchHistory = async (page = 1) => {
    if (!token || !companyId) {
      setHistory([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/proxy/api/companies/${companyId}/points/history?page=${page}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.data) {
        setHistory(data.data.data || []);
        setCurrentPage(data.data.current_page || 1);
        setTotalPages(data.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching points history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [companyId, token, currentPage]);

  const handleSubmit = async () => {
    const total = parseFloat(amount);
    if (!customer) {
      toast({ title: 'Error', description: 'Selecciona un cliente.', variant: 'destructive' });
      return;
    }
    if (isNaN(total) || total <= 0) {
      toast({ title: 'Error', description: 'Ingresa un monto válido mayor a 0.', variant: 'destructive' });
      return;
    }
    if (pointsEarned < 1) {
      toast({ title: 'Atención', description: 'El monto ingresado no genera puntos según las reglas actuales.', variant: 'destructive' });
      return;
    }
    if (!companyId || !token) return;

    setIsSubmitting(true);
    try {
      // Direct call to the backend point assignment endpoint
      const response = await fetch(`/api/proxy/api/companies/${companyId}/clients/${customer.id}/points/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          points: pointsEarned,
          reason: `Compra registrada manualmente: $${total.toFixed(2)}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al asignar puntos');
      }

      toast({ title: 'Éxito', description: `Se han otorgado ${pointsEarned} puntos a ${customer.name}.` });
      
      // Refresh history
      fetchHistory();

      // Reset
      setAmount('');
      setPointsEarned(0);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'No se pudo registrar la asignación.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Otorgar Puntos</h1>
          <p className="text-muted-foreground mt-1">
            Ingresa el total de la compra del cliente para otorgarle puntos usando las reglas activas de tu negocio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-fit sticky top-6">
            <CardHeader>
              <CardTitle>Registro Rápido</CardTitle>
              <CardDescription>
                Busca al cliente y registra la venta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <CustomerSearch
                  onSelect={(c) => setCustomer(c)}
                  onClear={() => setCustomer(null)}
                  selectedCustomer={customer}
                />
              </div>

              <div className="space-y-2">
                <Label>Monto Gastado (MXN)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 text-lg font-semibold h-12"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 rounded-lg flex items-center justify-between font-medium">
                <div className="text-purple-900 dark:text-purple-100 italic">
                  Puntos a otorgar:
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  +{pointsEarned}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 py-4 bg-muted/20 border-t">
              <Button 
                onClick={handleSubmit} 
                className="w-full h-12 text-lg shadow-md"
                disabled={isSubmitting || !customer || pointsEarned < 1}
              >
                {isSubmitting ? 'Registrando...' : 'Asignar Puntos'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setAmount('');
                  setCustomer(null);
                }} 
                disabled={isSubmitting}
              >
                Limpiar Formulario
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {/* History Section */}
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-xl">Historial Reciente</CardTitle>
                    <CardDescription>
                      Todos los movimientos de puntos de la compañía.
                    </CardDescription>
                  </div>
                </div>
                {isLoadingHistory && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingHistory && history.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p>Obteniendo transacciones...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="p-20 text-center text-muted-foreground">
                  No hay movimientos de puntos registrados recientemente.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                          <TableHead className="w-[140px] pl-6 font-semibold">Fecha</TableHead>
                          <TableHead className="font-semibold">Cliente</TableHead>
                          <TableHead className="font-semibold">Concepto / Motivo</TableHead>
                          <TableHead className="text-right font-semibold">Puntos</TableHead>
                          <TableHead className="w-[100px] pr-6 font-semibold">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((record) => (
                          <TableRow key={record.id} className="hover:bg-muted/10">
                            <TableCell className="pl-6 text-xs font-mono text-muted-foreground">
                              <div className="flex flex-col">
                                <span>{new Date(record.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="opacity-70">{new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-sm">{record.client_name}</div>
                              <div className="text-[11px] text-muted-foreground leading-none mt-0.5">{record.client_email}</div>
                            </TableCell>
                            <TableCell className="max-w-[180px]">
                              <div className="text-xs leading-tight text-muted-foreground truncate" title={record.source_type}>
                                {record.source_type}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "font-bold text-base",
                                record.points > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              )}>
                                {record.points > 0 ? `+${record.points}` : record.points}
                              </span>
                            </TableCell>
                            <TableCell className="pr-6">
                              <Badge 
                                variant={record.status === 'approved' ? 'default' : 'outline'} 
                                className={cn(
                                  "capitalize text-[10px] px-2 py-0 h-5",
                                  record.status === 'approved' && "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                                )}
                              >
                                {record.status || 'Completado'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="py-4 border-t px-6 bg-muted/5">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1 || isLoadingHistory}
                              className="gap-1"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Anterior
                            </Button>
                          </PaginationItem>
                          <PaginationItem>
                            <span className="text-sm text-muted-foreground px-4">
                              Página {currentPage} de {totalPages}
                            </span>
                          </PaginationItem>
                          <PaginationItem>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages || isLoadingHistory}
                              className="gap-1"
                            >
                              Siguiente
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
