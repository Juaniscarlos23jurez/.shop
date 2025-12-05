import { NextRequest, NextResponse } from 'next/server';
import { getSessionInfo } from '@/lib/whatsapp-sessions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company_id = searchParams.get('company_id');

  if (!company_id) {
    return NextResponse.json(
      { success: false, message: 'company_id requerido' },
      { status: 400 }
    );
  }

  const session = getSessionInfo(String(company_id));

  if (!session) {
    return NextResponse.json({
      success: true,
      status: 'disconnected',
      qrCodeUrl: null,
      error: null,
    });
  }

  return NextResponse.json({
    success: true,
    status: session.status,
    qrCodeUrl: session.qrCodeUrl,
    error: session.lastError ?? null,
  });
}
