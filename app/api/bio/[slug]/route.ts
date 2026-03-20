import { NextResponse } from "next/server";

const BASE_URL = "https://laravel-pkpass-backend-master-6nwaa7.laravel.cloud";

/**
 * Public API route: GET /api/bio/[slug]
 * Fetches the social bio settings for a company by its slug.
 * No authentication required — this is the publicly accessible Bio Link endpoint.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    // Call the new dedicated backend endpoint
    const response = await fetch(
      `${BASE_URL}/api/public/bio/${encodeURIComponent(slug)}`,
      {
        headers: { 
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        next: { revalidate: 30 }, // cache for 30 seconds
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Bio Link not found", slug },
        { status: 404 }
      );
    }

    const result = await response.json();
    
    // The backend already returns { success: true, data: { company, settings } }
    // with camelCase conversion and fallbacks.
    return NextResponse.json({
      success: true,
      companyName: result.data.company.name,
      companyLogo: result.data.company.logo_url || result.data.company.image_url,
      settings: result.data.settings,
      // The backend result.data.settings already includes fallbacks if social_bio_settings is missing
    });
  } catch (err) {
    console.error("[BIO API] Error fetching from backend:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
