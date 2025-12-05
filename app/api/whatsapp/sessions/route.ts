import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateClient } from '@/lib/whatsapp-sessions';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null as any);
  const company_id = body?.company_id;

  if (!company_id) {
    return NextResponse.json(
      { success: false, message: 'company_id requerido' },
      { status: 400 }
    );
  }

  const session = getOrCreateClient(String(company_id));

  return NextResponse.json({
    success: true,
    status: session.status,
    qrCodeUrl: session.qrCodeUrl,
    error: session.lastError ?? null,
  });
}
