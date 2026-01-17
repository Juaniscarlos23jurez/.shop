/**
 * Sistema RAG (Retrieval-Augmented Generation) para documentación de APIs
 * Este archivo contiene la documentación estructurada de todas las APIs disponibles
 * para que el asistente de IA pueda entender y usar correctamente los endpoints
 */

export interface APIEndpoint {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    authentication: boolean;
    description: string;
    parameters: APIParameter[];
    response: any;
    useCases: string[];
}

export interface APIParameter {
    name: string;
    type: string;
    location: 'path' | 'query' | 'body' | 'header';
    required: boolean;
    default?: any;
    min?: number;
    max?: number;
    format?: string;
    description: string;
}

export interface APIWorkflow {
    name: string;
    description: string;
    steps: WorkflowStep[];
}

export interface WorkflowStep {
    step: number;
    endpoint?: string;
    action: string;
    input?: string;
    output?: string;
    description?: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

export const API_DOCUMENTATION = {
    apiBaseUrl: API_BASE_URL,
    authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer {token}',
        description: 'All authenticated endpoints require a valid JWT token'
    },
    endpoints: [
        {
            id: 'auth-profile-company',
            name: 'Get Company Information',
            method: 'GET' as const,
            path: '/api/auth/profile/company',
            authentication: true,
            description: 'Obtiene información de la compañía del usuario autenticado, incluyendo el company_id necesario para otras llamadas.',
            parameters: [],
            response: {
                success: true,
                data: {
                    id: 'string (company_id)',
                    name: 'string',
                    description: 'string',
                    created_at: 'timestamp',
                    updated_at: 'timestamp'
                }
            },
            useCases: [
                'Primer paso para obtener company_id',
                'Verificar información de la empresa',
                'Obtener contexto del negocio'
            ]
        },
        {
            id: 'get-all-products',
            name: 'Get All Products',
            method: 'GET' as const,
            path: '/api/companies/{companyId}/products',
            authentication: true,
            description: 'Obtiene el catálogo completo de productos de una compañía. Esencial para análisis de inventario y recomendaciones.',
            parameters: [
                {
                    name: 'companyId',
                    type: 'string',
                    location: 'path' as const,
                    required: true,
                    description: 'ID de la compañía (obtenido de /api/auth/profile/company)'
                },
                {
                    name: 'page',
                    type: 'number',
                    location: 'query' as const,
                    required: false,
                    default: 1,
                    description: 'Número de página para paginación'
                },
                {
                    name: 'per_page',
                    type: 'number',
                    location: 'query' as const,
                    required: false,
                    default: 50,
                    min: 1,
                    max: 100,
                    description: 'Productos por página - usa 50 o más para ver todo el catálogo'
                }
            ],
            response: {
                success: true,
                data: [
                    {
                        id: 'string',
                        company_id: 'string',
                        name: 'string',
                        description: 'string',
                        price: 'number',
                        stock: 'number',
                        category: 'string',
                        image_url: 'string',
                        created_at: 'timestamp',
                        updated_at: 'timestamp'
                    }
                ],
                meta: {
                    current_page: 'number',
                    per_page: 'number',
                    total: 'number',
                    last_page: 'number'
                }
            },
            useCases: [
                'Ver catálogo completo de productos',
                'Analizar inventario actual',
                'Identificar gaps en el catálogo',
                'Base para recomendaciones de nuevos productos'
            ]
        },
        {
            id: 'get-product-details',
            name: 'Get Product Details',
            method: 'GET' as const,
            path: '/api/companies/{companyId}/products/{productId}',
            authentication: true,
            description: 'Obtiene detalles específicos de un producto individual.',
            parameters: [
                {
                    name: 'companyId',
                    type: 'string',
                    location: 'path' as const,
                    required: true,
                    description: 'ID de la compañía'
                },
                {
                    name: 'productId',
                    type: 'string',
                    location: 'path' as const,
                    required: true,
                    description: 'ID del producto'
                }
            ],
            response: {
                success: true,
                data: {
                    id: 'string',
                    company_id: 'string',
                    name: 'string',
                    description: 'string',
                    price: 'number',
                    stock: 'number',
                    category: 'string',
                    image_url: 'string',
                    variants: 'array',
                    created_at: 'timestamp',
                    updated_at: 'timestamp'
                }
            },
            useCases: [
                'Información detallada de un producto específico',
                'Verificar stock y precio',
                'Análisis de producto individual'
            ]
        },
        {
            id: 'get-sales-statistics',
            name: 'Get Sales Statistics',
            method: 'GET' as const,
            path: '/api/sales/statistics',
            authentication: true,
            description: 'Obtiene estadísticas agregadas de ventas en un periodo específico. Esencial para análisis de rendimiento y recomendaciones.',
            parameters: [
                {
                    name: 'date_from',
                    type: 'string',
                    location: 'query' as const,
                    required: true,
                    format: 'YYYY-MM-DD',
                    description: 'Fecha de inicio del periodo (por defecto: 30 días atrás)'
                },
                {
                    name: 'date_to',
                    type: 'string',
                    location: 'query' as const,
                    required: true,
                    format: 'YYYY-MM-DD',
                    description: 'Fecha de fin del periodo (por defecto: hoy)'
                },
                {
                    name: 'location_id',
                    type: 'number',
                    location: 'query' as const,
                    required: false,
                    description: 'ID de ubicación específica (opcional)'
                }
            ],
            response: {
                success: true,
                data: {
                    total_sales: 'number',
                    total_revenue: 'number',
                    average_order_value: 'number',
                    total_orders: 'number',
                    top_products: [
                        {
                            product_id: 'string',
                            product_name: 'string',
                            quantity_sold: 'number',
                            revenue: 'number'
                        }
                    ],
                    sales_by_category: 'object',
                    sales_trend: 'array'
                },
                period: {
                    from: 'string',
                    to: 'string'
                }
            },
            useCases: [
                'Análisis de rendimiento de ventas',
                'Identificar productos más vendidos',
                'Base para recomendaciones estratégicas',
                'Comparar periodos de tiempo'
            ]
        },
        {
            id: 'get-recent-sales',
            name: 'Get Recent Sales',
            method: 'GET' as const,
            path: '/api/sales',
            authentication: true,
            description: 'Obtiene lista detallada de transacciones de venta individuales.',
            parameters: [
                {
                    name: 'date_from',
                    type: 'string',
                    location: 'query' as const,
                    required: false,
                    format: 'YYYY-MM-DD',
                    description: 'Fecha de inicio del periodo'
                },
                {
                    name: 'date_to',
                    type: 'string',
                    location: 'query' as const,
                    required: false,
                    format: 'YYYY-MM-DD',
                    description: 'Fecha de fin del periodo'
                },
                {
                    name: 'page',
                    type: 'number',
                    location: 'query' as const,
                    required: false,
                    default: 1,
                    description: 'Número de página'
                },
                {
                    name: 'per_page',
                    type: 'number',
                    location: 'query' as const,
                    required: false,
                    default: 20,
                    min: 1,
                    max: 50,
                    description: 'Resultados por página'
                }
            ],
            response: {
                success: true,
                data: [
                    {
                        id: 'string',
                        order_number: 'string',
                        customer_name: 'string',
                        products: 'array',
                        total_amount: 'number',
                        payment_method: 'string',
                        status: 'string',
                        created_at: 'timestamp'
                    }
                ],
                meta: {
                    current_page: 'number',
                    per_page: 'number',
                    total: 'number'
                }
            },
            useCases: [
                'Ver transacciones específicas',
                'Análisis detallado de ventas individuales',
                'Auditoría de ventas',
                'Identificar patrones de compra'
            ]
        }
    ] as APIEndpoint[],
    workflows: [
        {
            name: 'Análisis Completo de Negocio',
            description: 'Flujo para obtener información completa del negocio y generar recomendaciones',
            steps: [
                {
                    step: 1,
                    endpoint: 'auth-profile-company',
                    action: 'Obtener company_id',
                    output: 'company_id necesario para siguientes llamadas'
                },
                {
                    step: 2,
                    endpoint: 'get-all-products',
                    action: 'Obtener catálogo completo',
                    input: 'company_id del paso 1',
                    output: 'Lista de todos los productos actuales'
                },
                {
                    step: 3,
                    endpoint: 'get-sales-statistics',
                    action: 'Obtener estadísticas de ventas (últimos 30 días)',
                    output: 'Métricas de rendimiento, productos top, tendencias'
                },
                {
                    step: 4,
                    action: 'Generar análisis y recomendaciones',
                    description: 'Combinar datos de productos y ventas para identificar oportunidades'
                }
            ]
        },
        {
            name: 'Análisis de Producto Específico',
            description: 'Obtener información detallada y rendimiento de un producto',
            steps: [
                {
                    step: 1,
                    endpoint: 'auth-profile-company',
                    action: 'Obtener company_id'
                },
                {
                    step: 2,
                    endpoint: 'get-product-details',
                    action: 'Obtener detalles del producto',
                    input: 'company_id y product_id'
                },
                {
                    step: 3,
                    endpoint: 'get-sales-statistics',
                    action: 'Verificar rendimiento del producto en ventas'
                }
            ]
        }
    ] as APIWorkflow[],
    bestPractices: [
        {
            title: 'Siempre obtener company_id primero',
            description: 'La mayoría de endpoints requieren company_id. Llama a /api/auth/profile/company antes de otras operaciones.'
        },
        {
            title: 'Usar periodos de tiempo apropiados',
            description: 'Para análisis generales, usa 30-90 días. Para tendencias recientes, usa 7-14 días.'
        },
        {
            title: 'Paginación eficiente',
            description: 'Para ver catálogo completo, usa per_page=50 o mayor en getAllProducts'
        },
        {
            title: 'Combinar datos para mejor análisis',
            description: 'Combina datos de productos con estadísticas de ventas para recomendaciones más precisas'
        }
    ],
    commonErrors: [
        {
            code: 401,
            message: 'Unauthorized',
            solution: 'Verificar que el token de autenticación sea válido y esté incluido en headers'
        },
        {
            code: 404,
            message: 'Not Found',
            solution: 'Verificar que el company_id o product_id sean correctos'
        },
        {
            code: 422,
            message: 'Validation Error',
            solution: 'Revisar que los parámetros cumplan con los formatos requeridos (ej: fechas en YYYY-MM-DD)'
        }
    ]
};

/**
 * Funciones de búsqueda para el sistema RAG
 */

export function searchEndpoint(query: string): APIEndpoint | undefined {
    const lowerQuery = query.toLowerCase();
    return API_DOCUMENTATION.endpoints.find(endpoint =>
        endpoint.id.toLowerCase().includes(lowerQuery) ||
        endpoint.name.toLowerCase().includes(lowerQuery) ||
        endpoint.description.toLowerCase().includes(lowerQuery) ||
        endpoint.path.toLowerCase().includes(lowerQuery)
    );
}

export function searchEndpoints(query: string): APIEndpoint[] {
    const lowerQuery = query.toLowerCase();
    return API_DOCUMENTATION.endpoints.filter(endpoint =>
        endpoint.id.toLowerCase().includes(lowerQuery) ||
        endpoint.name.toLowerCase().includes(lowerQuery) ||
        endpoint.description.toLowerCase().includes(lowerQuery) ||
        endpoint.path.toLowerCase().includes(lowerQuery) ||
        endpoint.useCases.some(useCase => useCase.toLowerCase().includes(lowerQuery))
    );
}

export function getWorkflowByName(name: string): APIWorkflow | undefined {
    return API_DOCUMENTATION.workflows.find(workflow =>
        workflow.name.toLowerCase().includes(name.toLowerCase())
    );
}

export function getAllEndpoints(): APIEndpoint[] {
    return API_DOCUMENTATION.endpoints;
}

export function getEndpointById(id: string): APIEndpoint | undefined {
    return API_DOCUMENTATION.endpoints.find(endpoint => endpoint.id === id);
}

/**
 * Genera documentación en formato string para incluir en el prompt del AI
 */
export function generateAPIContextForAI(): string {
    const context: string[] = [
        '=== DOCUMENTACIÓN DE APIs DISPONIBLES ===\n',
        `Base URL: ${API_DOCUMENTATION.apiBaseUrl}\n`,
        `Autenticación: ${API_DOCUMENTATION.authentication.description}\n`,
        '\n=== ENDPOINTS DISPONIBLES ===\n'
    ];

    API_DOCUMENTATION.endpoints.forEach(endpoint => {
        context.push(`\n${endpoint.name} (${endpoint.id})`);
        context.push(`${endpoint.method} ${endpoint.path}`);
        context.push(`Descripción: ${endpoint.description}`);

        if (endpoint.parameters.length > 0) {
            context.push('Parámetros:');
            endpoint.parameters.forEach(param => {
                const required = param.required ? '(requerido)' : '(opcional)';
                context.push(`  - ${param.name} ${required}: ${param.description}`);
            });
        }

        context.push('Casos de uso:');
        endpoint.useCases.forEach(useCase => {
            context.push(`  - ${useCase}`);
        });
        context.push('---');
    });

    context.push('\n=== WORKFLOWS RECOMENDADOS ===\n');
    API_DOCUMENTATION.workflows.forEach(workflow => {
        context.push(`\n${workflow.name}`);
        context.push(workflow.description);
        context.push('Pasos:');
        workflow.steps.forEach(step => {
            context.push(`${step.step}. ${step.action}`);
            if (step.description) context.push(`   ${step.description}`);
        });
        context.push('---');
    });

    context.push('\n=== MEJORES PRÁCTICAS ===\n');
    API_DOCUMENTATION.bestPractices.forEach(practice => {
        context.push(`${practice.title}: ${practice.description}`);
    });

    return context.join('\n');
}
