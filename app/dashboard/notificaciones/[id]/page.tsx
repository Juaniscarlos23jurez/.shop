"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api/api";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificacionDetallePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { token, user } = useAuth();

  const initialCompanyId = user?.company_id ? String(user.company_id) : undefined;
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | undefined>(initialCompanyId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<any | null>(null);

  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : params?.id), [params]);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) return;

      // Resolve companyId if not available
      let cid = resolvedCompanyId;
      if (!cid) {
        try {
          const companyResponse = await api.userCompanies.get(token);
          if (companyResponse.success && companyResponse.data) {
            const data = companyResponse.data as any;
            cid = String(
              data.id ||
                data.company_id ||
                data.company?.id ||
                data.company?.company_id ||
                data.data?.id ||
                data.data?.company_id ||
                data.data?.company?.id ||
                ""
            );
            if (cid && cid !== "undefined") setResolvedCompanyId(cid);
          }
        } catch (e) {
          console.error("Error resolving companyId:", e);
        }
      }
      if (!cid) return;

      setLoading(true);
      setError(null);
      try {
        const res = await api.companies.getNotification(cid, id, token);
        if (!res.success) throw new Error(res.message || "Error cargando notificación");
        // Normalize data
        const d: any = res.data?.data ?? res.data ?? null;
        setItem(d);
      } catch (e) {
        console.error("load notification detail error", e);
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, id, resolvedCompanyId]);

  const statusInfo = useMemo(() => {
    const s = (item?.status || "").toString();
    const map: Record<string, { text: string; color: string }> = {
      queued: { text: "En cola", color: "bg-yellow-100 text-yellow-800" },
      scheduled: { text: "Programado", color: "bg-blue-100 text-blue-800" },
      sent: { text: "Enviado", color: "bg-green-100 text-green-800" },
      failed: { text: "Fallido", color: "bg-red-100 text-red-800" },
      sending: { text: "Enviando", color: "bg-indigo-100 text-indigo-800" },
      cancelled: { text: "Cancelado", color: "bg-gray-100 text-gray-800" },
      draft: { text: "Borrador", color: "bg-slate-100 text-slate-800" },
    };
    return map[s] || { text: s || "—", color: "bg-gray-100 text-gray-800" };
  }, [item]);

  const channelIcon = useMemo(() => {
    const c = (item?.channel || "push").toString();
    if (c === "both") return "📱✉️";
    return c === "email" ? "✉️" : "📱";
  }, [item]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/notificaciones">←</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Detalle de notificación</h1>
          <p className="text-slate-600 mt-1">Revisa el estado y los destinatarios</p>
        </div>
      </div>

      {loading && (
        <div className="p-4 border rounded-md bg-white">Cargando…</div>
      )}

      {error && (
        <div className="p-4 border rounded-md bg-red-50 text-red-700">{error}</div>
      )}

      {!loading && !error && item && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{channelIcon}</span>
                  <span>{item.title || "(Sin título)"}</span>
                </CardTitle>
                <CardDescription>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(item.created_at || Date.now()).toLocaleString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-slate-500">Mensaje</div>
                  <div className="text-slate-900 whitespace-pre-wrap">
                    {item.body || item.message || "—"}
                  </div>
                </div>
                {item?.data && (
                  <div>
                    <div className="text-sm text-slate-500">Payload</div>
                    <pre className="text-xs bg-slate-50 border rounded-md p-3 overflow-auto">
{JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de envío</CardTitle>
                <CardDescription>Conteos calculados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
                    <div className="text-xs text-yellow-700">En cola</div>
                    <div className="text-xl font-bold text-yellow-800">{item.queued_count ?? item.queued ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-md bg-green-50 border border-green-200">
                    <div className="text-xs text-green-700">Enviados</div>
                    <div className="text-xl font-bold text-green-800">{item.sent_count_calc ?? item.sent_count ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-md bg-red-50 border border-red-200">
                    <div className="text-xs text-red-700">Fallidos</div>
                    <div className="text-xl font-bold text-red-800">{item.failed_count_calc ?? item.failed_count ?? 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/dashboard/notificaciones")}>Volver</Button>
              {/* Futuras acciones: reenviar, cancelar, etc. */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
