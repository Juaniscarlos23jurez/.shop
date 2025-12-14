import { useState, useCallback } from 'react';
import { BASE_URL } from '@/lib/api/api';

export function useWhatsAppSession() {
  const [sessionStatus, setSessionStatus] = useState<'disconnected' | 'connecting' | 'waiting_qr' | 'connected' | 'error'>('disconnected');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [hasFetchedStatus, setHasFetchedStatus] = useState(false);

  const startWhatsAppSession = useCallback(async (token: string, companyId: string) => {
    console.log('[WhatsApp] startWhatsAppSession clicked', { token, company_id: companyId });

    if (!companyId || !token) {
      console.warn('[WhatsApp] Falta company_id o token, no se puede iniciar sesión de WhatsApp');
      setSessionError('Debes iniciar sesión para conectar WhatsApp');
      setSessionStatus('error');
      return;
    }

    try {
      setSessionError(null);
      setSessionStatus('connecting');

      const res = await fetch(`${BASE_URL}/api/whatsapp/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_id: companyId,
        }),
      });

      console.log('[WhatsApp] POST /api/whatsapp/sessions status:', res.status);
      if (!res.ok) {
        throw new Error('No se pudo iniciar la sesión de WhatsApp');
      }

      const data = await res.json();
      console.log('[WhatsApp] Sesión iniciada respuesta completa:', data);
      console.log('[WhatsApp] Estado inicial devuelto por backend:', data?.status, 'QR incluido:', Boolean(data?.qrCodeUrl));
      
      setQrCodeUrl(data.qrCodeUrl || null);
      setSessionStatus(data.status === 'connected' ? 'connected' : 'waiting_qr');
    } catch (error: any) {
      console.error('Error iniciando sesión de WhatsApp:', error);
      setSessionError(error?.message || 'Error al iniciar sesión de WhatsApp');
      setSessionStatus('error');
    }
  }, []);

  const checkWhatsAppSessionStatus = useCallback(async (token: string, companyId: string) => {
    console.log('[WhatsApp] checkWhatsAppSessionStatus called', { token, company_id: companyId });
    if (!companyId || !token) {
      console.warn('[WhatsApp] No hay company_id o token, se omite verificación de sesión');
      setHasFetchedStatus(true);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/whatsapp/sessions/status?company_id=${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[WhatsApp] GET /api/whatsapp/sessions/status status:', res.status);
      if (!res.ok) {
        console.warn('[WhatsApp] Error al obtener estado de sesión, response not ok');
        return;
      }

      const data = await res.json();
      console.log('[WhatsApp] Estado de sesión recibido:', data);
      console.log('[WhatsApp] Estado actual:', data?.status, '¿QR presente?:', Boolean(data?.qrCodeUrl));
      
      setSessionStatus(data.status || 'disconnected');
      console.log('[WhatsApp] Estado actualizado a:', data.status);
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
      } else if (data.status === 'connected') {
        setQrCodeUrl(null);
        console.log('[WhatsApp] ✓ Sesión conectada, mostrando WhatsApp Business');
      }
    } catch (error) {
      console.error('Error verificando estado de sesión WhatsApp:', error);
    } finally {
      console.log('[WhatsApp] Marcando hasFetchedStatus como true');
      setHasFetchedStatus(true);
    }
  }, []);

  return {
    sessionStatus,
    qrCodeUrl,
    sessionError,
    startWhatsAppSession,
    checkWhatsAppSessionStatus,
    hasFetchedStatus,
  };
}
