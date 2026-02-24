'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Icons removed to avoid missing exports in lucide-react version
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Simplified: we start with push-only and manual recipient selection

export default function NuevaNotificacionPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const initialCompanyId = user?.company_id ? String(user.company_id) : undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | undefined>(initialCompanyId);
  // push-only flow
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [channelMode, setChannelMode] = useState<'push' | 'email' | 'both'>('push');
  const [followers, setFollowers] = useState<Array<{
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_fcm_token?: string | null;
    has_active_membership?: number;
    total_cart_products_count?: number;
  }>>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'both' | 'fcm_only' | 'email_only' | 'none' | 'in_cart'>('all');
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

  const totalReach = useMemo(() => {
    // We only count selected recipients now
    return selectedRecipients.length;
  }, [selectedRecipients]);

  useEffect(() => {
    const loadFollowers = async () => {
      if (!token) {
        console.log('No token available');
        return;
      }
      try {
        setFollowersLoading(true);
        setFollowersError(null);

        // Step 1: Get companyId from /api/auth/profile/company
        let cid = resolvedCompanyId;
        if (!cid) {
          const companyResponse = await api.userCompanies.get(token);

          if (companyResponse.success && companyResponse.data) {
            const data = companyResponse.data;

            // Try multiple extraction paths
            cid = String(
              data.id ||
              data.company_id ||
              data.company?.id ||
              data.company?.company_id ||
              data.data?.id ||
              data.data?.company_id ||
              data.data?.company?.id ||
              ''
            );

            if (cid && cid !== 'undefined') {
              setResolvedCompanyId(cid);
            }
          }
        }

        if (!cid) {
          setFollowersError('No se pudo obtener el ID de la compañía');
          setFollowers([]);
          setFollowersLoading(false);
          return;
        }

        // Build params based on filter mode
        const params: any = { per_page: 100 };

        // Try using 'mode' parameter first (as documented)
        if (filterMode === 'both') {
          params.mode = 'both';
        } else if (filterMode === 'fcm_only') {
          params.mode = 'fcm_only';
        } else if (filterMode === 'email_only') {
          params.mode = 'email_only';
        } else if (filterMode === 'none') {
          params.mode = 'none';
        }
        // 'all' mode doesn't need any filter parameter

        console.log('[DEBUG] Fetching followers with filter:', filterMode, 'Params:', params);

        // Note: For in_cart, we use userCompanies.getFollowers because it guarantees the cart count fields
        let res: any;
        let d: any;
        let raw: any[] = [];

        if (filterMode === 'in_cart') {
          res = await api.userCompanies.getFollowers(token);
          d = res.data?.data;
          if (d?.followers && Array.isArray(d.followers)) {
            raw = d.followers;
          }
        } else {
          res = await api.companies.listFollowers(cid, token, params);
          d = res.data;
          if (d?.followers && Array.isArray(d.followers)) {
            raw = d.followers;
          } else if (d?.data?.data && Array.isArray(d.data.data)) {
            raw = d.data.data;
          } else if (d?.data && Array.isArray(d.data)) {
            raw = d.data;
          } else if (Array.isArray(d)) {
            raw = d;
          }
        }

        console.log('[DEBUG] API Response:', {
          success: res?.success,
          followersCount: raw.length
        });

        const mapped = raw.map((f: any) => ({
          customer_id: f.customer_id ?? f.id,
          customer_name: f.customer_name ?? f.name ?? '',
          customer_email: f.customer_email ?? f.email ?? '',
          customer_fcm_token: f.customer_fcm_token ?? f.fcm_token ?? null,
          has_active_membership: Number(f.has_active_membership ?? 0),
          total_cart_products_count: Number(f.total_cart_products_count ?? 0),
        }));

        console.log('[DEBUG] Mapped followers:', mapped.length);
        console.log('[DEBUG] FCM tokens:', mapped.map(f => ({ name: f.customer_name, hasFCM: !!f.customer_fcm_token })));

        // If backend doesn't filter correctly, apply client-side filtering as fallback
        let filtered = mapped;
        if (filterMode !== 'all' && mapped.length > 0) {
          // Check if backend already filtered (if we got fewer results than expected)
          // If not, filter on client side
          filtered = mapped.filter(f => {
            const hasFCM = !!f.customer_fcm_token;
            const hasEmail = !!f.customer_email;
            const inCart = (f.total_cart_products_count || 0) > 0;

            switch (filterMode) {
              case 'both':
                return hasFCM && hasEmail;
              case 'fcm_only':
                return hasFCM;
              case 'email_only':
                return hasEmail;
              case 'none':
                return !hasFCM && !hasEmail;
              case 'in_cart':
                return inCart;
              default:
                return true;
            }
          });
          console.log('[DEBUG] Client-side filtered:', filtered.length, 'followers');
        }

        setFollowers(filtered);
        setFollowersLoading(false);
      } catch (e) {
        console.error('Error loading followers', e);
        setFollowersError(e instanceof Error ? e.message : 'Error desconocido');
        setFollowersLoading(false);
      }
    };
    loadFollowers();
  }, [token, resolvedCompanyId, filterMode]);

  // Scheduling removed in simplified flow

  const toggleRecipient = (id: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecipients.length === followers.length) {
      // Deselect all
      setSelectedRecipients([]);
    } else {
      // Select all
      setSelectedRecipients(followers.map(f => f.customer_id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Ensure we have a companyId
    let cid = resolvedCompanyId;
    if (!cid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo obtener el ID de la compañía",
      });
      return;
    }
    if (selectedRecipients.length === 0) {
      toast({
        variant: "destructive",
        title: "Faltan datos",
        description: "Selecciona al menos un destinatario",
      });
      return;
    }
    setIsLoading(true);
    try {
      const wantsPush = channelMode === 'push' || channelMode === 'both';
      const wantsEmail = channelMode === 'email' || channelMode === 'both';

      // 1) Registrar notificaciones en el backend según canal seleccionado
      if (wantsEmail) {
        const emailPayload = {
          channel: 'email' as const,
          title,
          body: message,
          data: deepLink ? { deepLink } : null,
          segment_type: 'custom' as const,
          recipient_ids: selectedRecipients,
          scheduled_at: null,
        };

        const emailRes = await api.companies.createNotification(cid, emailPayload, token);
        if (!emailRes.success) throw new Error(emailRes.message || 'Error creando notificación por correo');

        // 2) Enviar correos inmediatamente (Paso 2)
        const notificationId = emailRes.data?.data?.notification?.id;
        if (notificationId) {
          const sendEmailRes = await api.companies.sendNotificationEmails(cid, notificationId, token);
          if (!sendEmailRes.success) {
            console.error('Error enviando correos:', sendEmailRes.message);
            toast({
              variant: "destructive",
              title: "Error parcial",
              description: `Notificación creada, pero error al enviar correos: ${sendEmailRes.message}`,
            });
          } else {
            const { sent_count, failed_count } = sendEmailRes.data?.data || {};
            console.log(`Correos enviados: ${sent_count || 0} exitosos, ${failed_count || 0} fallidos`);
          }
        }
      }

      if (wantsPush) {
        const pushPayload = {
          channel: 'push' as const,
          title,
          body: message,
          data: deepLink ? { deepLink } : null,
          segment_type: 'custom' as const,
          recipient_ids: selectedRecipients,
          scheduled_at: null,
        };

        const pushRes = await api.companies.createNotification(cid, pushPayload, token);
        if (!pushRes.success) throw new Error(pushRes.message || 'Error creando notificación push');

        // 2) Enviar push a dispositivos móviles desde el frontend vía API route segura
        const selected = followers.filter(f => selectedRecipients.includes(f.customer_id));
        const tokens = selected
          .map(f => f.customer_fcm_token)
          .filter((t): t is string => typeof t === 'string' && t.length > 0);

        if (tokens.length === 0) {
          toast({
            title: "Sin tokens",
            description: "No hay tokens FCM válidos. Se registró la notificación, pero no se enviaron pushes.",
          });
          router.push('/dashboard/notificaciones');
          return;
        }

        const sendBody = {
          tokens,
          notification: { title, body: message },
          data: deepLink ? { deepLink: String(deepLink) } : undefined,
        };

        const sendRes = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(sendBody),
        });

        const sendJson = await sendRes.json();
        if (!sendRes.ok || !sendJson?.success) {
          console.error('Error enviando FCM', sendJson);
          toast({
            variant: "destructive",
            title: "Error parcial",
            description: `Notificación creada, pero error al enviar push: ${sendJson?.message || sendRes.statusText}`,
          });
        } else {
          console.log(`Notificación enviada: ${sendJson.sent} entregadas, ${sendJson.failure} fallidas`);
        }
      }

      // Mostrar mensaje final según el resultado
      let successMessage = '';
      if (wantsEmail && wantsPush) {
        successMessage = 'Notificación enviada por correo y push exitosamente.';
      } else if (wantsEmail && !wantsPush) {
        successMessage = 'Correos enviados exitosamente.';
      } else if (!wantsEmail && wantsPush) {
        successMessage = 'Notificaciones push enviadas exitosamente.';
      }

      if (successMessage) {
        toast({
          title: "Éxito",
          description: successMessage,
        });
      }

      router.push('/dashboard/notificaciones');
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/notificaciones">
            ←
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nueva Notificación</h1>
          <p className="text-slate-600 mt-1">Crea y envía notificaciones push o por correo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contenido</CardTitle>
                <CardDescription>Mensaje que recibirán tus usuarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: ¡Oferta Especial!" required maxLength={65} />
                  <p className="text-xs text-slate-500">Máximo 65 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe el mensaje" rows={4} required maxLength={240} />
                  <p className="text-xs text-slate-500">Máximo 240 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deepLink">Deep link / URL (opcional)</Label>
                  <Input id="deepLink" value={deepLink} onChange={(e) => setDeepLink(e.target.value)} placeholder="myapp://promo/123 o https://tuweb.com/oferta" />
                  <p className="text-xs text-slate-500">Se enviará como payload en "data.deepLink"</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canal de envío</CardTitle>
                <CardDescription>Elige cómo quieres comunicarte con tus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setChannelMode('email')}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition shadow-sm ${channelMode === 'email'
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${channelMode === 'email' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">Solo correo</span>
                        {channelMode === 'email' && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Envía una campaña por correo electrónico a los contactos seleccionados que tengan email registrado.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelMode('push')}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition shadow-sm ${channelMode === 'push'
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${channelMode === 'push' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">Solo notificación</span>
                        {channelMode === 'push' && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Envía una notificación push a los dispositivos con token FCM válido entre los destinatarios seleccionados.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelMode('both')}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition shadow-sm ${channelMode === 'both'
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${channelMode === 'both' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">Ambos canales</span>
                        {channelMode === 'both' && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Combina correo y notificación push para maximizar el alcance con los clientes seleccionados.
                      </p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Destinatarios</CardTitle>
                <CardDescription>Selecciona los usuarios para enviar la notificación push</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">Destinatarios</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{totalReach}</span>
                  </div>
                  {totalReach > 0 && (
                    <p className="text-xs text-slate-600 mt-2">
                      Se enviará la notificación a {totalReach} {totalReach === 1 ? 'usuario' : 'usuarios'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Filtro de contacto</Label>
                  <Select
                    value={filterMode}
                    onValueChange={(v) => {
                      setFilterMode(v as any);
                      // Clear selections when filter changes to avoid stale picks
                      setSelectedRecipients([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="both">Con FCM y Email</SelectItem>
                      <SelectItem value="fcm_only">Solo FCM</SelectItem>
                      <SelectItem value="email_only">Solo Email</SelectItem>
                      <SelectItem value="none">Sin FCM ni Email</SelectItem>
                      <SelectItem value="in_cart">Con productos en carrito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {followersLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-slate-500">Cargando seguidores…</div>
                  </div>
                )}
                {followersError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{followersError}</p>
                  </div>
                )}
                {!followersLoading && !followersError && followers.length > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500">
                      {followers.length} {followers.length === 1 ? 'seguidor' : 'seguidores'} disponibles
                    </span>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {selectedRecipients.length === followers.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>
                )}
                {!followersLoading && !followersError && (
                  <div className="max-h-80 overflow-auto border rounded-lg bg-white">
                    {followers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="text-slate-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-500">No hay seguidores disponibles</p>
                        <p className="text-xs text-slate-400 mt-1">Ajusta los filtros para ver más resultados</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {followers.map((f) => (
                          <label
                            key={f.customer_id}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedRecipients.includes(f.customer_id)}
                              onChange={() => toggleRecipient(f.customer_id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 truncate">
                                  {f.customer_name || `Usuario ${f.customer_id}`}
                                </span>
                                {f.has_active_membership === 1 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    Miembro
                                  </span>
                                )}
                                {(f.total_cart_products_count || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {f.total_cart_products_count} en carrito
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{f.customer_email}</p>
                            </div>
                            <div className="flex-shrink-0">
                              {f.customer_fcm_token ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Push
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500">
                                  Sin Push
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/notificaciones')} disabled={isLoading}>Cancelar</Button>
              <Button type="submit" disabled={isLoading || selectedRecipients.length === 0} className="bg-blue-600 hover:bg-blue-700">
                {isLoading
                  ? 'Enviando…'
                  : channelMode === 'email'
                    ? 'Enviar correo'
                    : channelMode === 'push'
                      ? 'Enviar notificación push'
                      : 'Enviar por ambos canales'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}