'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { api } from '@/lib/api/api';
import { useAuth } from '@/contexts/AuthContext';

type UiNotification = {
  id: string | number;
  title: string;
  body: string;
  channel: 'push' | 'email' | 'both';
  status: 'queued' | 'scheduled' | 'sent' | 'failed' | string;
  created_at: string;
  recipients_count?: number;
};

export default function NotificacionesPage() {
  const { token, user } = useAuth();
  const companyId = user?.company_id ? String(user.company_id) : undefined;
  const [activeTab, setActiveTab] = useState<'all' | 'queued' | 'scheduled' | 'sent' | 'failed'>('all');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UiNotification[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!token || !companyId) return;
      setLoading(true);
      try {
        const status = activeTab === 'all' ? undefined : activeTab;
        const res = await api.companies.listNotifications(companyId, token, { per_page: 50, status });
        if (res.success && res.data) {
          // Try to support various shapes: either data is an array or paginated object
          const raw = (res.data as any).data ?? res.data;
          const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
          const mapped: UiNotification[] = arr.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.body ?? n.message ?? '',
            channel: (n.channel as any) ?? 'push',
            status: (n.status as any) ?? 'queued',
            created_at: n.created_at ?? n.date ?? new Date().toISOString(),
            recipients_count: n.recipients_count ?? n.total_recipients ?? 0,
          }));
          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error('load notifications error', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, token, companyId]);

  const filteredNotifications = useMemo(() => items, [items]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      queued: { text: 'En cola', color: 'bg-yellow-100 text-yellow-800' },
      scheduled: { text: 'Programado', color: 'bg-blue-100 text-blue-800' },
      sent: { text: 'Enviado', color: 'bg-green-100 text-green-800' },
      failed: { text: 'Fallido', color: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'both') return <span>📱✉️</span>;
    return type === 'push' ? <span>📱</span> : <span>✉️</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notificaciones</h1>
          <p className="text-slate-600 mt-1">Gestiona las notificaciones para tus usuarios</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/notificaciones/nueva">
            <span className="mr-2">＋</span>
            Nueva Notificación
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="queued">En cola</TabsTrigger>
            <TabsTrigger value="scheduled">Programadas</TabsTrigger>
            <TabsTrigger value="sent">Enviadas</TabsTrigger>
            <TabsTrigger value="failed">Fallidas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Notificaciones</CardTitle>
              <CardDescription>
                {loading ? 'Cargando…' : `${filteredNotifications.length} notificaciones encontradas`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-slate-300 text-3xl">🔔</div>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No hay notificaciones</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeTab === 'all' 
                      ? 'Aún no has creado ninguna notificación.' 
                      : `No hay notificaciones en la pestaña seleccionada.`}
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/dashboard/notificaciones/nueva">
                        <span className="-ml-1 mr-2">＋</span>
                        Nueva Notificación
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destinatarios
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNotifications.map((n) => (
                        <tr key={n.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{n.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{n.body}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTypeIcon(n.channel)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(n.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(n.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {n.recipients_count && n.recipients_count > 0 ? n.recipients_count.toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/dashboard/notificaciones/${n.id}`} className="text-emerald-600 hover:text-emerald-900">
                              Ver detalles
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
