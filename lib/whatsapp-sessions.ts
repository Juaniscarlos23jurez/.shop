import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';

export type WhatsAppSessionStatus =
  | 'disconnected'
  | 'connecting'
  | 'waiting_qr'
  | 'connected'
  | 'error';

export interface WhatsAppSessionInfo {
  client: Client;
  status: WhatsAppSessionStatus;
  qrCodeUrl: string | null;
  lastError?: string | null;
}

// Mapa en memoria de sesiones por company_id
const sessions = new Map<string, WhatsAppSessionInfo>();

export function getSessionInfo(companyId: string): WhatsAppSessionInfo | undefined {
  return sessions.get(companyId);
}

export function getOrCreateClient(companyId: string): WhatsAppSessionInfo {
  const key = String(companyId);
  let session = sessions.get(key);
  if (session) return session;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: `company_${key}` }),
  });

  session = {
    client,
    status: 'connecting',
    qrCodeUrl: null,
    lastError: null,
  };

  sessions.set(key, session);

  client.on('qr', async (qr) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(qr);
      session!.qrCodeUrl = qrCodeUrl;
      session!.status = 'waiting_qr';
    } catch (err: any) {
      session!.status = 'error';
      session!.lastError = err?.message ?? 'Error generando QR';
    }
  });

  client.on('ready', () => {
    session!.status = 'connected';
    session!.qrCodeUrl = null;
  });

  client.on('disconnected', () => {
    session!.status = 'disconnected';
    session!.qrCodeUrl = null;
  });

  client.on('auth_failure', (msg) => {
    session!.status = 'error';
    session!.lastError = msg;
  });

  client.initialize();

  return session;
}
