"use client";

import { useMemo, useState } from 'react';
import * as Lucide from 'lucide-react';
const { Bot, ArrowLeft, Plus, TrendingUp, MoreVertical, Edit, Pause, Play, Trash2, Search, Filter } = Lucide as any;

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FlowTemplate } from "@/types/whatsapp";
import { mockFlowTemplates } from "@/app/dashboard/whatsapp/flows/mock-data";

export default function WhatsAppFlowsPage() {
  const router = useRouter();
  const [flowTemplates] = useState<FlowTemplate[]>(mockFlowTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const getTriggerLabel = (trigger: FlowTemplate["trigger"]) => {
    switch (trigger) {
      case "first_message":
        return "Primer mensaje";
      case "post_purchase":
        return "Post-compra";
      case "keyword":
        return "Palabra clave";
      case "abandoned_cart":
        return "Carrito abandonado";
      default:
        return "Manual";
    }
  };

  const filteredFlows = useMemo(() => {
    return flowTemplates
      .filter((flow) => {
        if (statusFilter === "active" && !flow.isActive) return false;
        if (statusFilter === "paused" && flow.isActive) return false;
        if (!searchTerm) return true;
        const normalized = searchTerm.toLowerCase();
        return (
          flow.name.toLowerCase().includes(normalized) ||
          flow.description.toLowerCase().includes(normalized) ||
          flow.trigger.toLowerCase().includes(normalized)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      );
  }, [flowTemplates, searchTerm, statusFilter]);

  const totalActive = flowTemplates.filter((flow) => flow.isActive).length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/whatsapp")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-600" />
              Flujos Automáticos de WhatsApp
            </h1>
            <p className="text-sm text-gray-600">
              Consulta los flujos existentes o crea uno nuevo para automatizar tus conversaciones.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/whatsapp/flows/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo flujo
          </Button>
          <Button variant="ghost" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver estadísticas
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-white flex flex-col">
          <div className="px-6 py-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-sm text-gray-800">Flujos configurados</h2>
                <p className="text-xs text-gray-500">Administra y consulta los flujos existentes.</p>
              </div>
              <Badge variant="secondary" className="text-[11px]">
                {totalActive} activos
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre, trigger o descripción"
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="space-y-1">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    {statusFilter === "all" ? "• " : ""}
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    {statusFilter === "active" ? "• " : ""}
                    Activos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("paused")}>
                    {statusFilter === "paused" ? "• " : ""}
                    Pausados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <div className="flex-1 rounded-md border border-gray-200 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Triggers totales</p>
                <p className="text-base font-semibold text-gray-900">
                  {flowTemplates.reduce((acc, flow) => acc + (flow.stats?.totalTriggers || 0), 0)}
                </p>
              </div>
              <div className="flex-1 rounded-md border border-gray-200 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Tasa promedio</p>
                <p className="text-base font-semibold text-gray-900">
                  {Math.round(
                    flowTemplates.reduce((acc, flow) => acc + (flow.stats?.completionRate || 0), 0) /
                      (flowTemplates.length || 1),
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              {filteredFlows.length === 0 ? (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-sm">Sin resultados</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-500">
                    Ajusta la búsqueda o crea un nuevo flujo.
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flujo</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Métricas</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlows.map((flow) => (
                      <TableRow
                        key={flow.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/whatsapp/flows/${flow.id}`)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{flow.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{flow.description}</p>
                            <p className="text-[11px] text-gray-400">
                              Última actualización:{" "}
                              {flow.updatedAt ? new Date(flow.updatedAt).toLocaleString() : "Sin definir"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTriggerLabel(flow.trigger)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={flow.isActive ? "default" : "secondary"}
                            className="text-[11px]"
                          >
                            {flow.isActive ? "Activo" : "Pausado"}
                          </Badge>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {flow.steps.length} pasos
                          </p>
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-500">
                          <p>
                            🧠 Triggers:{" "}
                            <span className="font-semibold text-gray-900">
                              {flow.stats?.totalTriggers ?? 0}
                            </span>
                          </p>
                          <p>
                            ✅ Completion:{" "}
                            <span className="font-semibold text-gray-900">
                              {flow.stats?.completionRate ?? 0}%
                            </span>
                          </p>
                          <p>
                            ⏱ Promedio:{" "}
                            <span className="font-semibold text-gray-900">
                              {flow.stats?.averageTime ?? 0} s
                            </span>
                          </p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => router.push(`/dashboard/whatsapp/flows/${flow.id}`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {flow.isActive ? (
                                  <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption className="text-xs">
                    Datos basados en la documentación de flujos de WhatsApp.
                  </TableCaption>
                </Table>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
