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

// Simplified: we start with push-only and manual recipient selection

export default function NuevaNotificacionPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const companyId = user?.company_id ? String(user.company_id) : undefined;

  const [isLoading, setIsLoading] = useState(false);
  // push-only flow
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [followers, setFollowers] = useState<Array<{
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_fcm_token?: string | null;
    has_active_membership?: number;
  }>>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  

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
        console.log('Fetching followers...');
        const res = await api.userCompanies.getFollowers(token);
        console.log('Followers response:', res);
        if (res.success && res.data?.followers) {
          const mapped = res.data.followers.map((f: any) => ({
            customer_id: f.customer_id,
            customer_name: f.customer_name,
            customer_email: f.customer_email,
            customer_fcm_token: f.customer_fcm_token ?? null,
            has_active_membership: Number(f.has_active_membership ?? 0),
          }));
          console.log('Mapped followers:', mapped);
          setFollowers(mapped);
        } else {
          console.log('No followers data in response');
        }
      } catch (e) {
        console.error('Error loading followers', e);
      }
    };
    loadFollowers();
  }, [token]);

  // Scheduling removed in simplified flow

  const toggleRecipient = (id: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !companyId) return;
    if (selectedRecipients.length === 0) {
      alert('Selecciona al menos un destinatario');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        channel: 'push' as const,
        title,
        body: message,
        data: deepLink ? { deepLink } : null,
        segment_type: 'custom' as const,
        recipient_ids: selectedRecipients,
        scheduled_at: null as const,
      };

      const r = await api.companies.createNotification(companyId, payload, token);
      if (!r.success) throw new Error(r.message || 'Error creando notificación');

      router.push('/dashboard/notificaciones');
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Destinatarios</CardTitle>
                <CardDescription>Selecciona los usuarios para enviar la notificación push</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Seleccionados: <strong>{totalReach}</strong></div>
                </div>
                <div className="max-h-80 overflow-auto border rounded-md p-2 space-y-1">
                  {followers.length === 0 && (
                    <div className="text-sm text-slate-500">No hay seguidores disponibles</div>
                  )}
                  {followers.map((f) => (
                    <label key={f.customer_id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedRecipients.includes(f.customer_id)}
                        onChange={() => toggleRecipient(f.customer_id)}
                      />
                      <span className="font-medium">{f.customer_name || `ID ${f.customer_id}`}</span>
                      <span className="text-slate-500">({f.customer_email})</span>
                      {f.customer_fcm_token ? (
                        <span className="ml-auto text-xs text-emerald-600">Push OK</span>
                      ) : (
                        <span className="ml-auto text-xs text-slate-400">Sin FCM</span>
                      )}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/notificaciones')} disabled={isLoading}>Cancelar</Button>
              <Button type="submit" disabled={isLoading || selectedRecipients.length === 0} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? 'Enviando…' : 'Enviar notificación push'}
              </Button>
            </div>
          </div>
        </div>
      </form>
  );
}
