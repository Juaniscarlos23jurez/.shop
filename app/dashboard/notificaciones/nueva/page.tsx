'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Mail, Smartphone, Calendar, Clock, Users, Tag } from 'lucide-react';
import Link from 'next/link';

const userSegments = [
  { id: 'all', name: 'Todos los usuarios' },
  { id: 'active', name: 'Usuarios activos (últimos 30 días)' },
  { id: 'inactive', name: 'Usuarios inactivos' },
  { id: 'with_orders', name: 'Clientes con compras' },
  { id: 'no_orders', name: 'Usuarios sin compras' },
  { id: 'custom', name: 'Segmento personalizado' },
];

export default function NuevaNotificacionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('both');
  const [scheduleType, setScheduleType] = useState('now');
  const [segment, setSegment] = useState('all');
  const [customSegment, setCustomSegment] = useState('');
  const [useCustomSegment, setUseCustomSegment] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    router.push('/dashboard/notificaciones');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/notificaciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nueva Notificación</h1>
          <p className="text-slate-600 mt-1">Crea una nueva notificación push o por correo electrónico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column - Notification content */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contenido de la Notificación</CardTitle>
                <CardDescription>Escribe el mensaje que recibirán los usuarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej: ¡Oferta Especial!" 
                    required 
                    maxLength={65}
                  />
                  <p className="text-xs text-slate-500">Máximo 65 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Escribe aquí el mensaje completo de la notificación" 
                    rows={4} 
                    required
                    maxLength={240}
                  />
                  <p className="text-xs text-slate-500">Máximo 240 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label>Destino al hacer clic</Label>
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar destino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Página de inicio</SelectItem>
                        <SelectItem value="catalog">Catálogo de productos</SelectItem>
                        <SelectItem value="offers">Ofertas</SelectItem>
                        <SelectItem value="custom">URL personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="https://ejemplo.com/ruta" 
                      className="flex-1"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagen (opcional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-2 text-slate-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="text-sm text-slate-500">
                          <span className="font-semibold">Haz clic para subir</span> o arrastra una imagen
                        </p>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">Tamaño recomendado: 1200x628px. Formatos: JPG, PNG, GIF</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipos de notificación</Label>
                  <RadioGroup 
                    value={notificationType} 
                    onValueChange={setNotificationType}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="push" id="push" />
                      <Label htmlFor="push" className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2 text-blue-500" />
                        Solo notificación push
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-orange-500" />
                        Solo correo electrónico
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="flex items-center">
                        <div className="flex items-center mr-2">
                          <Smartphone className="h-4 w-4 text-blue-500 -mr-1" />
                          <Mail className="h-4 w-4 text-orange-500" />
                        </div>
                        Ambos
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Programar envío</Label>
                  <RadioGroup 
                    value={scheduleType} 
                    onValueChange={setScheduleType}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="now" id="now" />
                      <Label htmlFor="now" className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-slate-500" />
                        Enviar ahora
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="schedule" id="schedule" />
                      <Label htmlFor="schedule" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        Programar para más tarde
                      </Label>
                    </div>
                  </RadioGroup>

                  {scheduleType === 'schedule' && (
                    <div className="mt-2">
                      <Input 
                        type="datetime-local" 
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Segmento de usuarios</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="custom-segment" 
                        checked={useCustomSegment}
                        onCheckedChange={setUseCustomSegment}
                      />
                      <Label htmlFor="custom-segment" className="text-sm font-normal">
                        Personalizado
                      </Label>
                    </div>
                  </div>
                  
                  {useCustomSegment ? (
                    <Input 
                      placeholder="Escribe una consulta SQL o selecciona un segmento"
                      value={customSegment}
                      onChange={(e) => setCustomSegment(e.target.value)}
                    />
                  ) : (
                    <Select value={segment} onValueChange={setSegment}>
                      <SelectTrigger>
                        <Users className="h-4 w-4 text-slate-500 mr-2" />
                        <SelectValue placeholder="Seleccionar segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {userSegments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <div className="flex items-center text-sm text-slate-500">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>Usuarios alcanzados: <strong>1,250</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Etiqueta (opcional)</Label>
                  <Input placeholder="Ej: Campaña de verano" />
                  <p className="text-xs text-slate-500">Ayuda a organizar tus notificaciones</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/notificaciones')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? 'Guardando...' : 'Guardar como borrador'}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Enviando...' : scheduleType === 'now' ? 'Enviar ahora' : 'Programar envío'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
