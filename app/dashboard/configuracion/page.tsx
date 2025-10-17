"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";

export default function ConfiguracionInvoicePage() {
  // Billing configuration state
  const plans = [
    {
      id: "starter",
      name: "Starter",
      monthly: 299,
      yearly: 2990,
      features: [
        "Hasta 1,000 notificaciones/mes",
        "Centro de notificaciones",
        "Soporte por email",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      monthly: 799,
      yearly: 7990,
      features: [
        "Hasta 10,000 notificaciones/mes",
        "Segmentación avanzada",
        "Reportes y analíticas",
        "Soporte prioritario",
      ],
    },
    {
      id: "business",
      name: "Business",
      monthly: 1999,
      yearly: 19990,
      features: [
        "Hasta 50,000 notificaciones/mes",
        "Roles y permisos",
        "SLA y soporte dedicado",
      ],
    },
  ] as const;

  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number]["id"]>(
    "starter"
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [notificationsCount, setNotificationsCount] = useState<number>(1500);
  const [adsImpressions, setAdsImpressions] = useState<number>(25000);

  // Metered pricing (example values)
  const pricePerNotification = 0.10; // MXN por notificación extra
  const includedNotifications = useMemo(() => {
    const plan = plans.find((p) => p.id === selectedPlan)!;
    if (plan.id === "starter") return 1000;
    if (plan.id === "pro") return 10000;
    return 50000;
  }, [selectedPlan, plans]);
  const cpmAds = 50; // MXN por cada 1,000 impresiones

  const planPrice = useMemo(() => {
    const plan = plans.find((p) => p.id === selectedPlan)!;
    return billingCycle === "monthly" ? plan.monthly : plan.yearly;
  }, [selectedPlan, billingCycle, plans]);

  const extraNotifications = Math.max(0, notificationsCount - includedNotifications);
  const notificationsCost = extraNotifications * pricePerNotification;
  const adsCost = (adsImpressions / 1000) * cpmAds;

  const billingSubtotal = planPrice + notificationsCost + adsCost;
  const billingIva = billingSubtotal * 0.16;
  const billingTotal = billingSubtotal + billingIva;

  const invoice = {
    number: "INV-2025-001",
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: "Mi Compañía S.A. de C.V.",
      address: "Av. Principal 123, Col. Centro, CDMX",
      rfc: "XAXX010101000",
      email: "facturacion@mi-compania.com",
      phone: "+52 55 5555 5555",
    },
    customer: {
      name: "Cliente de Ejemplo",
      address: "Calle Secundaria 456, Col. Norte, CDMX",
      rfc: "CACX7605101P8",
      email: "cliente@correo.com",
      phone: "+52 55 1234 5678",
    },
    items: [
      { description: "Producto A", qty: 2, unitPrice: 450.0 },
      { description: "Servicio B", qty: 1, unitPrice: 1299.99 },
      { description: "Producto C", qty: 3, unitPrice: 199.5 },
    ],
    currency: "MXN",
  };

  const subtotal = invoice.items.reduce(
    (acc, it) => acc + it.qty * it.unitPrice,
    0
  );
  const iva = subtotal * 0.16; // 16% IVA
  const total = subtotal + iva;

  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: invoice.currency,
  });

  function onPrint() {
    window.print();
  }

  function onDownload() {
    // Placeholder: you can later replace with server-side PDF or client lib (e.g., html2pdf)
    alert("Generación de PDF pendiente de implementar.");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factura</h1>
          <p className="text-sm text-muted-foreground">
            Administra y genera facturas para tus clientes.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={onDownload}>Descargar PDF</Button>
          <Button onClick={onPrint}>Imprimir</Button>
        </div>
      </div>

      {/* Billing configuration */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Configuración de facturación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select
              value={selectedPlan}
              onValueChange={(v) => setSelectedPlan(v as typeof selectedPlan)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {formatCurrency(p.monthly)}/mes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="pt-1 space-y-1">
              {plans
                .find((p) => p.id === selectedPlan)!
                .features.map((f) => (
                  <div key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {f}
                  </div>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ciclo de cobro</Label>
            <Select
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as typeof billingCycle)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual (ahorra 2 meses)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Precio del plan: {formatCurrency(planPrice)} {billingCycle === "monthly" ? "/ mes" : "/ año"}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Activo</Badge>
              <span className="text-sm text-muted-foreground">Renovación automática</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metered usage */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Cargos por uso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notificaciones enviadas</Label>
              <span className="text-xs text-muted-foreground">
                Incluidas en plan: {includedNotifications.toLocaleString()}
              </span>
            </div>
            <Input
              id="notifications"
              type="number"
              min={0}
              value={notificationsCount}
              onChange={(e) => setNotificationsCount(Number(e.target.value))}
            />
            <div className="text-sm text-muted-foreground">
              Extras: {extraNotifications.toLocaleString()} × {formatCurrency(pricePerNotification)} = {formatCurrency(notificationsCost)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ads">Publicidad (impresiones)</Label>
              <span className="text-xs text-muted-foreground">Tarifa: {formatCurrency(cpmAds)} CPM</span>
            </div>
            <Input
              id="ads"
              type="number"
              min={0}
              step={1000}
              value={adsImpressions}
              onChange={(e) => setAdsImpressions(Number(e.target.value))}
            />
            <div className="text-sm text-muted-foreground">
              {adsImpressions.toLocaleString()} impresiones ≈ {(adsImpressions / 1000).toFixed(1)}K × {formatCurrency(cpmAds)} = {formatCurrency(adsCost)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">{invoice.number}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Fecha:</span>{" "}
              {invoice.date}
            </p>
            <p>
              <span className="font-medium text-foreground">Vencimiento:</span>{" "}
              {invoice.dueDate}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Emisor</h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="text-foreground font-medium">{invoice.company.name}</p>
                <p>{invoice.company.address}</p>
                <p>RFC: {invoice.company.rfc}</p>
                <p>{invoice.company.email}</p>
                <p>{invoice.company.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Receptor</h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="text-foreground font-medium">{invoice.customer.name}</p>
                <p>{invoice.customer.address}</p>
                <p>RFC: {invoice.customer.rfc}</p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[100px] text-right">Cantidad</TableHead>
                  <TableHead className="w-[160px] text-right">Precio</TableHead>
                  <TableHead className="w-[160px] text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((it, idx) => {
                  const lineTotal = it.qty * it.unitPrice;
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{it.description}</TableCell>
                      <TableCell className="text-right">{it.qty}</TableCell>
                      <TableCell className="text-right">
                        {formatter.format(it.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatter.format(lineTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Dynamic billing lines */}
                <TableRow>
                  <TableCell className="font-medium">
                    Plan {plans.find((p) => p.id === selectedPlan)!.name} ({billingCycle === "monthly" ? "Mensual" : "Anual"})
                  </TableCell>
                  <TableCell className="text-right">1</TableCell>
                  <TableCell className="text-right">{formatCurrency(planPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(planPrice)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Notificaciones extra ({extraNotifications.toLocaleString()} × {formatCurrency(pricePerNotification)})
                  </TableCell>
                  <TableCell className="text-right">{extraNotifications}</TableCell>
                  <TableCell className="text-right">{formatCurrency(pricePerNotification)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(notificationsCost)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Publicidad en app ({(adsImpressions / 1000).toFixed(1)}K × {formatCurrency(cpmAds)} CPM)
                  </TableCell>
                  <TableCell className="text-right">{(adsImpressions / 1000).toFixed(1)}K</TableCell>
                  <TableCell className="text-right">{formatCurrency(cpmAds)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(adsCost)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-sm text-muted-foreground max-w-md">
              <p>
                Nota: Esta es una vista previa de la factura. Puedes adaptar este
                módulo para integrarlo con tu servicio de facturación o timbrado.
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(billingSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <span className="font-medium">{formatCurrency(billingIva)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatCurrency(billingTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
