import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool, UIMessage, convertToModelMessages } from 'ai';
import { z } from 'zod';
// MCP imports - kept for future use but simplified prompt
// import { mcpServer } from '@/lib/mcp/mcp-server';
// import { generateAPIContextForAI } from '@/lib/mcp/api-documentation';

export const maxDuration = 30;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Helper para hacer llamadas autenticadas a la API
async function fetchAPI(endpoint: string, token: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[API Error]', { endpoint, status: response.status, error: errorText });
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
}

// Helper para calcular fecha de hace N días
function getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

export async function POST(req: Request) {
    const body = await req.json();
    const { messages, token } = body as { messages: UIMessage[]; token?: string };

    const hasAuth = !!token;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = getDaysAgo(30);

    // Detectar si es el primer mensaje del usuario
    const userMessages = messages.filter(msg => msg.role === 'user');
    const isFirstMessage = userMessages.length === 1;

    // Analizar si el primer mensaje necesita análisis
    let needsAnalysis = false;
    if (isFirstMessage && hasAuth) {
        // Convertir el mensaje a string para analizar su contenido
        const messageStr = JSON.stringify(userMessages[0]).toLowerCase();
        needsAnalysis = messageStr.includes('producto nuevo') ||
            messageStr.includes('recomienda') ||
            messageStr.includes('analiza') ||
            messageStr.includes('ventas') ||
            messageStr.includes('catálogo');
    }

    // Obtener contexto RAG simplificado - solo palabras clave para guiar la búsqueda
    let ragHints = '';
    if (hasAuth && userMessages.length > 0) {
        const lastUserMessage: any = userMessages[userMessages.length - 1];
        const messageText = typeof lastUserMessage.content === 'string'
            ? lastUserMessage.content
            : JSON.stringify(lastUserMessage.content || lastUserMessage);

        // Solo agregar hints si la consulta mencionas análisis o recomendaciones
        const lowerMsg = messageText.toLowerCase();
        if (lowerMsg.includes('producto') || lowerMsg.includes('recomienda') ||
            lowerMsg.includes('analiz') || lowerMsg.includes('ventas') ||
            lowerMsg.includes('catálogo') || lowerMsg.includes('nuevo')) {
            ragHints = `
WORKFLOW OBLIGATORIO:
1. getCompanyInfo() → obtener company_id (guardarlo)
2. getAllProducts(company_id) → ver catálogo actual  
3. getSalesStatistics() → obtener datos de ventas REALES
4. Analizar datos REALES y generar recomendaciones

⚠️ IMPORTANTE: getSalesStatistics SIEMPRE retorna datos. Si dice "sin datos", EL ERROR ESTÁ EN TU ANÁLISIS, no en la API.`;
        }
    }

    // Sistema prompt CORTO y DIRECTO - sin documentación extensa
    const systemPrompt = `Eres un asistente de análisis de negocios. Fecha: ${today}.

${hasAuth ? `
**EJECUTA HERRAMIENTAS AUTOMÁTICAMENTE:**
Cuando el usuario pida análisis o recomendaciones:
1. getCompanyInfo() → guarda company_id
2. getAllProducts(company_id, perPage=50) → lista productos
3. getSalesStatistics(dateFrom="${thirtyDaysAgo}", dateTo="${today}") → OBTÉN VENTAS REALES
4. Analiza los datos REALES que obtuviste y responde

${ragHints}

**REGLAS ESTRICTAS:**
- NUNCA digas "si los datos estuvieran disponibles"
- SIEMPRE incluye números REALES de las respuestas de las herramientas
- Si una herramienta falla, di exactamente qué error retornó
- Menciona total_revenue, total_orders, productos más vendidos de los DATOS REALES

**FORMATO:**
📊 Análisis de Datos (con números REALES de las herramientas)
💡 Recomendaciones Específicas (basadas en datos REALES)
✅ Próximos Pasos
` : `
Usuario NO autenticado. Usa getDemoStats para datos demo.
`}`;

    const result = streamText({
        model: google('gemini-2.0-flash-lite-preview-02-05'),
        messages: await convertToModelMessages(messages),
        system: systemPrompt,
        maxSteps: 10, // Permite múltiples llamadas a herramientas
        tools: {
            // ====== REAL BUSINESS TOOLS ======

            getCompanyInfo: tool({
                description: 'ÚSALA PRIMERO: Obtiene información de la compañía del usuario, incluyendo el company_id necesario para otras llamadas.',
                inputSchema: z.object({}),
                execute: async () => {
                    if (!hasAuth || !token) {
                        throw new Error('Usuario no autenticado');
                    }

                    try {
                        const data = await fetchAPI('/api/auth/profile/company', token);
                        return {
                            success: true,
                            company: data.data,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener información de la compañía'
                        };
                    }
                },
            }),

            getAllProducts: tool({
                description: 'Obtiene el catálogo COMPLETO de productos. Úsala para ver qué vende el negocio actualmente. Requiere company_id de getCompanyInfo.',
                inputSchema: z.object({
                    companyId: z.string().describe('ID de la compañía (de getCompanyInfo)'),
                    perPage: z.number().min(1).max(100).default(50).describe('Productos por página - usa 50 o más para ver todo el catálogo'),
                    page: z.number().min(1).default(1).describe('Página actual'),
                }),
                execute: async ({ companyId, perPage = 50, page = 1 }) => {
                    if (!hasAuth || !token) {
                        throw new Error('Usuario no autenticado');
                    }

                    try {
                        const params = new URLSearchParams({
                            page: String(page),
                            per_page: String(perPage),
                        });

                        const endpoint = `/api/companies/${companyId}/products?${params}`;
                        const data = await fetchAPI(endpoint, token);

                        return {
                            success: true,
                            products: data.data,
                            pagination: {
                                currentPage: page,
                                perPage,
                                total: data.meta?.total || data.data?.length || 0,
                            }
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener productos'
                        };
                    }
                },
            }),

            getSalesStatistics: tool({
                description: `CRÍTICO: Obtiene estadísticas de ventas REALES. SIEMPRE ÚSALA para análisis. Retorna total_revenue, total_orders, top_products. Periodo por defecto: ${thirtyDaysAgo} a ${today}`,
                inputSchema: z.object({
                    dateFrom: z.string().optional().describe(`Fecha inicio (YYYY-MM-DD). Por defecto: ${thirtyDaysAgo}`),
                    dateTo: z.string().optional().describe(`Fecha fin (YYYY-MM-DD). Por defecto: ${today}`),
                    locationId: z.number().optional().describe('ID de ubicación específica (opcional)'),
                }),
                execute: async ({ dateFrom, dateTo, locationId }) => {
                    console.log('[getSalesStatistics] Called with:', { dateFrom, dateTo, locationId });

                    if (!hasAuth || !token) {
                        console.log('[getSalesStatistics] ERROR: No auth');
                        throw new Error('Usuario no autenticado');
                    }

                    try {
                        const params = new URLSearchParams();

                        const from = dateFrom || thirtyDaysAgo;
                        const to = dateTo || today;

                        params.set('date_from', from);
                        params.set('date_to', to);
                        if (locationId) params.set('location_id', String(locationId));

                        const endpoint = `/api/sales/statistics?${params}`;
                        console.log('[getSalesStatistics] Calling endpoint:', endpoint);

                        const data = await fetchAPI(endpoint, token);
                        console.log('[getSalesStatistics] Response:', JSON.stringify(data).substring(0, 500));

                        return {
                            success: true,
                            statistics: data.data,
                            period: { from, to },
                            _debug: 'Estos son datos REALES del backend'
                        };
                    } catch (error) {
                        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
                        console.log('[getSalesStatistics] ERROR:', errorMsg);
                        return {
                            success: false,
                            error: errorMsg,
                            _debug: 'La herramienta falló - reporta este error al usuario'
                        };
                    }
                },
            }),

            getRecentSales: tool({
                description: 'Obtiene lista detallada de ventas recientes. Úsala solo si necesitas ver transacciones individuales específicas.',
                inputSchema: z.object({
                    dateFrom: z.string().optional().describe('Fecha inicio (YYYY-MM-DD)'),
                    dateTo: z.string().optional().describe('Fecha fin (YYYY-MM-DD)'),
                    perPage: z.number().min(1).max(50).default(20).describe('Resultados por página'),
                    page: z.number().min(1).default(1).describe('Número de página'),
                }),
                execute: async ({ dateFrom, dateTo, perPage = 20, page = 1 }) => {
                    if (!hasAuth || !token) {
                        throw new Error('Usuario no autenticado');
                    }

                    try {
                        const params = new URLSearchParams({
                            page: String(page),
                            per_page: String(perPage),
                        });

                        if (dateFrom) params.set('date_from', dateFrom);
                        if (dateTo) params.set('date_to', dateTo);

                        const endpoint = `/api/sales?${params}`;
                        const data = await fetchAPI(endpoint, token);

                        return {
                            success: true,
                            sales: data.data,
                            pagination: {
                                currentPage: page,
                                perPage,
                                total: data.meta?.total || data.data?.length || 0,
                            }
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener ventas'
                        };
                    }
                },
            }),

            getProductDetails: tool({
                description: 'Obtiene detalles de un producto específico. Úsala solo si necesitas información detallada de UN producto en particular.',
                inputSchema: z.object({
                    companyId: z.string().describe('ID de la compañía'),
                    productId: z.string().describe('ID del producto'),
                }),
                execute: async ({ companyId, productId }) => {
                    if (!hasAuth || !token) {
                        throw new Error('Usuario no autenticado');
                    }

                    try {
                        const endpoint = `/api/companies/${companyId}/products/${productId}`;
                        const data = await fetchAPI(endpoint, token);

                        return {
                            success: true,
                            product: data.data,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'Error al obtener producto'
                        };
                    }
                },
            }),

            // ====== DEMO TOOLS (solo si no hay auth) ======

            ...(hasAuth ? {} : {
                getDemoStats: tool({
                    description: 'Obtiene estadísticas de demostración (datos ficticios)',
                    inputSchema: z.object({
                        period: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
                    }),
                    execute: async ({ period }) => {
                        return {
                            totalSales: 12345,
                            salesGrowth: 15.3,
                            newCustomers: 150,
                            topProduct: 'Camiseta Premium',
                            period,
                            isDemo: true,
                            message: 'Estos son datos de demostración. Inicia sesión para ver datos reales.'
                        };
                    },
                }),
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}