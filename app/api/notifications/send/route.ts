import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from '@/lib/server/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const tokens: string[] = Array.isArray(body?.tokens) ? body.tokens.filter(Boolean) : [];
    const notification: { title: string; body: string } | undefined = body?.notification;
    const data: Record<string, string> | undefined = body?.data;

    if (!tokens.length) {
      return NextResponse.json({ success: false, message: 'No tokens provided' }, { status: 400 });
    }
    if (!notification?.title || !notification?.body) {
      return NextResponse.json({ success: false, message: 'Invalid notification payload' }, { status: 400 });
    }

    const messaging = getMessaging();

    const res = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    });

    const result = {
      success: true,
      sent: res.successCount,
      failure: res.failureCount,
      results: res.responses.map((r: { success: boolean; error?: { message?: string } }, i: number) => ({
        index: i,
        success: r.success,
        error: r.success ? undefined : r.error?.message,
      })),
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error('FCM send error', err);
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
