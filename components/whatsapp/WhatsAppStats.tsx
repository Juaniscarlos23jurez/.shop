"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Lucide from 'lucide-react';
const { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  Bot, 
  CheckCheck,
  ArrowUp,
  ArrowDown
} = Lucide as any;

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  description?: string;
}

function StatsCard({ title, value, change, changeType, icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {changeType === 'increase' ? (
              <ArrowUp className="w-3 h-3 text-green-500" />
            ) : (
              <ArrowDown className="w-3 h-3 text-red-500" />
            )}
            <span className={changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}%
            </span>
            <span>vs mes anterior</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function WhatsAppStats() {
  const [stats, setStats] = useState({
    totalContacts: 1247,
    activeConversations: 23,
    messagesReceived24h: 156,
    messagesSent24h: 203,
    responseTime: 2.3,
    flowsActive: 5,
    flowCompletionRate: 78.5,
  });

  // Datos de ejemplo para el gráfico de actividad
  const activityData = [
    { time: '00:00', messages: 2 },
    { time: '04:00', messages: 1 },
    { time: '08:00', messages: 15 },
    { time: '12:00', messages: 28 },
    { time: '16:00', messages: 35 },
    { time: '20:00', messages: 22 },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Contactos"
          value={stats.totalContacts.toLocaleString()}
          change={12}
          changeType="increase"
          icon={<Users className="w-4 h-4 text-blue-600" />}
          description="Contactos únicos registrados"
        />
        
        <StatsCard
          title="Conversaciones Activas"
          value={stats.activeConversations}
          change={8}
          changeType="increase"
          icon={<MessageSquare className="w-4 h-4 text-green-600" />}
          description="Chats con actividad reciente"
        />
        
        <StatsCard
          title="Tiempo de Respuesta"
          value={`${stats.responseTime} min`}
          change={15}
          changeType="decrease"
          icon={<Clock className="w-4 h-4 text-orange-600" />}
          description="Promedio de respuesta"
        />
        
        <StatsCard
          title="Tasa de Flujos"
          value={`${stats.flowCompletionRate}%`}
          change={5}
          changeType="increase"
          icon={<Bot className="w-4 h-4 text-purple-600" />}
          description="Flujos completados exitosamente"
        />
      </div>

      {/* Actividad de mensajes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mensajes Últimas 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Enviados</span>
                </div>
                <span className="font-medium">{stats.messagesSent24h}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Recibidos</span>
                </div>
                <span className="font-medium">{stats.messagesReceived24h}</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Tasa de respuesta</span>
                  <span className="flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-green-500" />
                    95%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Flujos Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Flujos activos</span>
                <Badge variant="default">{stats.flowsActive}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Ejecuciones hoy</span>
                <span className="font-medium">42</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasa de éxito</span>
                <span className="font-medium text-green-600">{stats.flowCompletionRate}%</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Flujo más usado: "Bienvenida nuevos clientes"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad por hora */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad por Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {activityData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="bg-green-500 rounded-t w-full min-h-[4px] transition-all"
                  style={{ 
                    height: `${(data.messages / Math.max(...activityData.map(d => d.messages))) * 100}%` 
                  }}
                ></div>
                <div className="text-xs text-muted-foreground">{data.time}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Pico de actividad entre 16:00 - 20:00
          </div>
        </CardContent>
      </Card>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Satisfacción del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">4.8/5</div>
            <div className="text-xs text-muted-foreground">Basado en 127 calificaciones</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">23%</div>
            <div className="text-xs text-muted-foreground">Chats que generaron ventas</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8.5 min</div>
            <div className="text-xs text-muted-foreground">Duración de conversación</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
