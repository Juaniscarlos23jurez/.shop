import { NextRequest, NextResponse } from 'next/server';

function extractMeta(content: string, property: string): string | undefined {
  const ogRegex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]*>`, 'i');
  const match = content.match(ogRegex);
  if (!match) return undefined;

  const tag = match[0];
  const contentMatch = tag.match(/content=["']([^"']+)["']/i);
  return contentMatch ? contentMatch[1] : undefined;
}

function extractTitle(content: string): string | undefined {
  const match = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : undefined;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      // Evitar cache excesivo en desarrollo
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({
        url,
        title: undefined,
        description: undefined,
        imageUrl: undefined,
      });
    }

    const html = await response.text();

    const title =
      extractMeta(html, 'og:title') ||
      extractMeta(html, 'twitter:title') ||
      extractTitle(html);

    const description =
      extractMeta(html, 'og:description') ||
      extractMeta(html, 'twitter:description');

    const imageUrl =
      extractMeta(html, 'og:image') ||
      extractMeta(html, 'twitter:image');

    return NextResponse.json({
      url,
      title,
      description,
      imageUrl,
    });
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return NextResponse.json({
      url,
      title: undefined,
      description: undefined,
      imageUrl: undefined,
    });
  }
}
