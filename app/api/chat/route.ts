import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool, UIMessage, convertToModelMessages } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Helper function to make authenticated API calls
async function fetchAPI(endpoint: string, token: string, options: RequestInit = {}) {
    console.log('[AI - fetchAPI] 📡 Llamando:', { endpoint, tokenLength: token?.length });

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    console.log('[AI - fetchAPI] 📥 Respuesta:', { endpoint, status: response.status, ok: response.ok });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI - fetchAPI] ❌ Error:', { endpoint, status: response.status, errorText });
        throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[AI - fetchAPI] ✅ Datos:', { endpoint, hasData: !!data.data, keys: Object.keys(data) });
    return data;
}

export async function POST(req: Request) {
    const body = await req.json();
    const { messages, token } = body as { messages: UIMessage[]; token?: string };

    console.log('\n' + '='.repeat(80));
    console.log('[AI Chat] 🚀 NUEVA PETICIÓN');
    console.log('[AI Chat] Token presente:', !!token);
    console.log('[AI Chat] Token length:', token?.length || 0);
    console.log('[AI Chat] Token preview:', token?.substring(0, 20) + '...');
    console.log('[AI Chat] Mensajes:', messages.length);
    console.log('[AI Chat] Último mensaje:', JSON.stringify(messages[messages.length - 1]));
    console.log('='.repeat(80) + '\n');

    // If no token provided, use demo data
    const hasAuth = !!token;

    if (!hasAuth) {
        console.warn('[AI Chat] ⚠️  NO HAY TOKEN - usando datos demo');
    }

    const result = streamText({
        model: google('gemini-2.0-flash-lite-preview-02-05'),
        messages: await convertToModelMessages(messages),
        system: `Eres un asistente de IA especializado en análisis de negocios y comercio electrónico. 
Tu trabajo es ayudar a los dueños de negocios a tomar decisiones informadas basadas en datos reales de su empresa.

CONTEXTO TEMPORAL:
- Fecha actual: ${new Date().toISOString().split('T')[0]} (2026)
- Para análisis de ventas, USA SIEMPRE los últimos 90 días por defecto
- Rango por defecto: desde ${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} hasta hoy

REGLAS CRÍTICAS PARA CONVERSACIÓN FLUIDA:
1. NUNCA pidas al usuario información que puedes obtener con las herramientas
2. NO preguntes sobre períodos de tiempo - USA 90 días por defecto SIEMPRE
3. NO pidas confirmaciones - SÉ DECISIVO y toma la iniciativa
4. OBTÉN toda la información EN UNA SOLA RONDA de llamadas
5. DA respuestas COMPLETAS, no fragmentadas

FLUJO OBLIGATORIO (TODO DE UNA VEZ):
Para preguntas sobre productos/ventas/recomendaciones:
1. getCompanyInfo → obtén company_id
2. getAllProducts → ve el catálogo
3. getSalesStatistics (90 días) → analiza ventas
4. Respuesta COMPLETA con análisis y recomendaciones

FORMATO DE RESPUESTA:
📊 **Situación Actual:**
[Resumen de datos encontrados]

💡 **Recomendaciones:**
1. [Acción específica con datos]
2. [Acción específica con datos]
3. [Acción específica con datos]

✅ **Próximos Pasos:**
[Acciones concretas]

NO dividas respuestas. NO pidas aclaraciones innecesarias. SÉ DIRECTO.

Herramientas disponibles:
- getCompanyInfo (úsala primero SIEMPRE)
- getAllProducts (úsala automáticamente)
- getSalesStatistics (90 días por defecto)
- getRecentSales (solo si necesitas detalles)
- getProductDetails (solo para productos específicos)

Sé profesional, decisivo y completo.`,
        tools: {
            // Real business data tools
            getCompanyInfo: tool({
                description: 'Obtener información detallada de la compañía del usuario, incluyendo el company_id necesario para otras consultas',
                inputSchema: z.object({}),
                execute: async () => {
                    console.log('[AI - Tool] 🏢 getCompanyInfo ejecutándose...', { hasAuth, tokenLength: token?.length });
                    if (!hasAuth || !token) {
                        console.warn('[AI - Tool] ⚠️ getCompanyInfo: Sin token');
                        return { error: 'No hay token de autenticación disponible' };
                    }
                    try {
                        const data = await fetchAPI('/api/auth/profile/company', token);
                        console.log('[AI - Tool] ✅ getCompanyInfo exitoso:', {
                            hasCompany: !!data.data,
                            companyId: data.data?.id
                        });
                        return {
                            success: true,
                            company: data.data || data,
                        };
                    } catch (error) {
                        console.error('[AI - Tool] ❌ getCompanyInfo error:', error);
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener información de la compañía'
                        };
                    }
                },
            }),

            getAllProducts: tool({
                description: 'Obtener lista completa de productos de la compañía. Esencial para hacer recomendaciones o analizar el catálogo actual.',
                inputSchema: z.object({
                    companyId: z.string().describe('ID de la compañía (obtenlo primero con getCompanyInfo)'),
                    perPage: z.number().optional().describe('Productos por página, default 50'),
                    page: z.number().optional().describe('Número de página para paginación'),
                }),
                execute: async ({ companyId, perPage, page }: { companyId: string; perPage?: number; page?: number }) => {
                    console.log('[AI - Tool] 📦 getAllProducts ejecutándose...', { companyId, perPage, page, hasAuth });
                    if (!hasAuth || !token) {
                        console.warn('[AI - Tool] ⚠️ getAllProducts: Sin token');
                        return { error: 'No hay token de autenticación disponible' };
                    }
                    try {
                        console.log('[AI Chat] Obteniendo productos', { companyId, perPage, page });
                        const params = new URLSearchParams({
                            page: String(page || 1),
                            per_page: String(Math.min(perPage || 50, 100)),
                        });

                        const endpoint = `/api/companies/${companyId}/products?${params.toString()}`;
                        const data = await fetchAPI(endpoint, token);

                        console.log('[AI Chat] Productos obtenidos:', data);
                        return {
                            success: true,
                            products: data.data || data,
                        };
                    } catch (error) {
                        console.error('[AI Chat] Error obteniendo productos:', error);
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener productos'
                        };
                    }
                },
            }),

            getSalesStatistics: tool({
                description: 'Obtener estadísticas de ventas para un período específico. Útil para análisis de rendimiento.',
                inputSchema: z.object({
                    dateFrom: z.string().optional().describe('Fecha de inicio en formato YYYY-MM-DD'),
                    dateTo: z.string().optional().describe('Fecha de fin en formato YYYY-MM-DD'),
                    locationId: z.number().optional().describe('ID de la ubicación específica'),
                }),
                execute: async ({ dateFrom, dateTo, locationId }: { dateFrom?: string; dateTo?: string; locationId?: number }) => {
                    if (!hasAuth || !token) {
                        return { error: 'No hay token de autenticación disponible' };
                    }
                    try {
                        const params = new URLSearchParams();
                        if (dateFrom) params.set('date_from', dateFrom);
                        if (dateTo) params.set('date_to', dateTo);
                        if (locationId) params.set('location_id', String(locationId));

                        const endpoint = `/api/sales/statistics${params.toString() ? `?${params.toString()}` : ''}`;
                        const data = await fetchAPI(endpoint, token);

                        return {
                            success: true,
                            statistics: data.data || data,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener estadísticas de ventas'
                        };
                    }
                },
            }),

            getRecentSales: tool({
                description: 'Obtener lista de ventas recientes. Útil para ver tendencias y patrones de compra.',
                inputSchema: z.object({
                    dateFrom: z.string().optional().describe('Fecha de inicio en formato YYYY-MM-DD'),
                    dateTo: z.string().optional().describe('Fecha de fin en formato YYYY-MM-DD'),
                    perPage: z.number().optional().describe('Número de resultados por página (máximo 50)'),
                    page: z.number().optional().describe('Número de página'),
                }),
                execute: async ({ dateFrom, dateTo, perPage, page }: { dateFrom?: string; dateTo?: string; perPage?: number; page?: number }) => {
                    if (!hasAuth || !token) {
                        return { error: 'No hay token de autenticación disponible' };
                    }
                    try {
                        const params = new URLSearchParams();
                        if (dateFrom) params.set('date_from', dateFrom);
                        if (dateTo) params.set('date_to', dateTo);
                        if (perPage) params.set('per_page', String(Math.min(perPage, 50)));
                        if (page) params.set('page', String(page));

                        const endpoint = `/api/sales${params.toString() ? `?${params.toString()}` : ''}`;
                        const data = await fetchAPI(endpoint, token);

                        return {
                            success: true,
                            sales: data.data || data,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener ventas recientes'
                        };
                    }
                },
            }),

            getProductDetails: tool({
                description: 'Obtener detalles de un producto específico por su ID',
                inputSchema: z.object({
                    companyId: z.string().describe('ID de la compañía'),
                    productId: z.string().describe('ID del producto a consultar'),
                }),
                execute: async ({ companyId, productId }: { companyId: string; productId: string }) => {
                    if (!hasAuth || !token) {
                        return { error: 'No hay token de autenticación disponible' };
                    }
                    try {
                        const endpoint = `/api/companies/${companyId}/products/${productId}`;
                        const data = await fetchAPI(endpoint, token);

                        return {
                            success: true,
                            product: data.data || data,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener detalles del producto'
                        };
                    }
                },
            }),

            // Demo/example tools (kept for when no auth is available)
            getStats: tool({
                description: 'Obtener estadísticas de ejemplo del negocio (demo)',
                inputSchema: z.object({
                    period: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
                }),
                execute: async ({ period }: { period: 'daily' | 'weekly' | 'monthly' }) => {
                    return {
                        totalSales: '$12,345',
                        newCustomers: 150,
                        topProduct: 'Camiseta Premium',
                        period,
                        note: 'Estos son datos de demostración. Inicia sesión para ver datos reales.'
                    };
                },
            }),

            recommendProducts: tool({
                description: 'Obtener recomendaciones de productos para una campaña (demo)',
                inputSchema: z.object({
                    category: z.string().optional(),
                    targetAudience: z.string().optional(),
                }),
                execute: async ({ category, targetAudience }: { category?: string; targetAudience?: string }) => {
                    return [
                        { id: 1, name: 'Sudadera Vintage', price: 45.00, matchScore: 95 },
                        { id: 2, name: 'Gorra Urbana', price: 25.00, matchScore: 88 },
                        { id: 3, name: 'Calcetines Pack', price: 15.00, matchScore: 82 },
                    ];
                },
            }),

            generateCoupon: tool({
                description: 'Generar un código de cupón de descuento',
                inputSchema: z.object({
                    discountPercentage: z.number().min(1).max(100),
                    codePrefix: z.string().optional(),
                }),
                execute: async ({ discountPercentage, codePrefix }: { discountPercentage: number; codePrefix?: string }) => {
                    const code = `${codePrefix || 'SALE'}${discountPercentage}${Math.floor(Math.random() * 1000)}`;
                    return {
                        code,
                        discount: `${discountPercentage}%`,
                        validUntil: '2024-12-31',
                    };
                },
            }),

            generateImage: tool({
                description: 'Generar una imagen basada en un prompt',
                inputSchema: z.object({
                    prompt: z.string(),
                }),
                execute: async ({ prompt }: { prompt: string }) => {
                    return {
                        imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(prompt)}`,
                        prompt
                    };
                },
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}

