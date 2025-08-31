'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, Smartphone, Plus } from 'lucide-react';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'push' | 'email' | 'both';
  status: 'scheduled' | 'sent' | 'draft';
  date: string;
  recipients: number;
};

export default function NotificacionesPage() {
  const [activeTab, setActiveTab] = useState('todas');

  // Sample notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      title: '¡Oferta Especial!',
      message: '20% de descuento en todos los productos este fin de semana',
      type: 'both',
      status: 'sent',
      date: '2023-11-15 10:30',
      recipients: 1250
    },
    {
      id: '2',
      title: 'Nuevo producto disponible',
      message: 'Hemos añadido nuevos productos a nuestro catálogo',
      type: 'push',
      status: 'scheduled',
      date: '2023-11-18 09:00',
      recipients: 0
    },
    {
      id: '3',
      title: 'Recordatorio de carrito',
      message: 'Tienes artículos en tu carrito que están a punto de expirar',
      type: 'email',
      status: 'draft',
      date: '2023-11-12 14:15',
      recipients: 0
    }
  ];

  const filteredNotifications = activeTab === 'todas' 
    ? notifications 
    : notifications.filter(n => n.status === activeTab);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      sent: { text: 'Enviado', color: 'bg-green-100 text-green-800' },
      scheduled: { text: 'Programado', color: 'bg-blue-100 text-blue-800' },
      draft: { text: 'Borrador', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'both') {
      return (
        <div className="flex space-x-1">
          <Smartphone className="h-4 w-4 text-blue-500" />
          <Mail className="h-4 w-4 text-orange-500" />
        </div>
      );
    }
    return type === 'push' ? (
      <Smartphone className="h-4 w-4 text-blue-500" />
    ) : (
      <Mail className="h-4 w-4 text-orange-500" />
    );
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
            <Plus className="h-4 w-4 mr-2" />
            Nueva Notificación
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="todas" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="scheduled">Programadas</TabsTrigger>
            <TabsTrigger value="sent">Enviadas</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Notificaciones</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notificaciones encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No hay notificaciones</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeTab === 'todas' 
                      ? 'Aún no has creado ninguna notificación.' 
                      : `No hay notificaciones ${activeTab === 'sent' ? 'enviadas' : activeTab === 'scheduled' ? 'programadas' : 'en borrador'}.`}
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/dashboard/notificaciones/nueva">
                        <Plus className="-ml-1 mr-2 h-4 w-4" />
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
                      {filteredNotifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{notification.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTypeIcon(notification.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(notification.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(notification.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notification.recipients > 0 ? notification.recipients.toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/dashboard/notificaciones/${notification.id}`} className="text-emerald-600 hover:text-emerald-900">
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
