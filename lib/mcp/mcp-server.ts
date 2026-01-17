/**
 * Servidor MCP (Model Context Protocol) para exponer documentación de APIs
 * Este servidor permite que el modelo de IA consulte información estructurada
 * sobre las APIs disponibles en tiempo real
 */

import { API_DOCUMENTATION, generateAPIContextForAI, searchEndpoints, getEndpointById } from './api-documentation';

export interface MCPResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}

export interface MCPResponse {
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}

/**
 * Servidor MCP que expone recursos de documentación de APIs
 */
export class APIMCPServer {
    private resources: Map<string, MCPResource>;

    constructor() {
        this.resources = new Map();
        this.initializeResources();
    }

    /**
     * Inicializa todos los recursos disponibles
     */
    private initializeResources() {
        // Recurso: Documentación completa
        this.resources.set('api://documentation/full', {
            uri: 'api://documentation/full',
            name: 'API Documentation - Complete',
            description: 'Documentación completa de todas las APIs disponibles',
            mimeType: 'text/plain'
        });

        // Recurso: Workflows
        this.resources.set('api://documentation/workflows', {
            uri: 'api://documentation/workflows',
            name: 'API Workflows',
            description: 'Flujos de trabajo recomendados para usar las APIs',
            mimeType: 'text/plain'
        });

        // Recurso: Best Practices
        this.resources.set('api://documentation/best-practices', {
            uri: 'api://documentation/best-practices',
            name: 'API Best Practices',
            description: 'Mejores prácticas para usar las APIs',
            mimeType: 'text/plain'
        });

        // Recursos individuales para cada endpoint
        API_DOCUMENTATION.endpoints.forEach(endpoint => {
            this.resources.set(`api://endpoint/${endpoint.id}`, {
                uri: `api://endpoint/${endpoint.id}`,
                name: endpoint.name,
                description: endpoint.description,
                mimeType: 'application/json'
            });
        });
    }

    /**
     * Lista todos los recursos disponibles
     */
    listResources(): MCPResource[] {
        return Array.from(this.resources.values());
    }

    /**
     * Lee el contenido de un recurso específico
     */
    readResource(uri: string): MCPResponse {
        if (uri === 'api://documentation/full') {
            return {
                contents: [{
                    uri,
                    mimeType: 'text/plain',
                    text: generateAPIContextForAI()
                }]
            };
        }

        if (uri === 'api://documentation/workflows') {
            const workflowText = API_DOCUMENTATION.workflows.map(workflow => {
                const steps = workflow.steps.map(s =>
                    `  ${s.step}. ${s.action}${s.description ? `\n     ${s.description}` : ''}`
                ).join('\n');
                return `${workflow.name}\n${workflow.description}\n${steps}`;
            }).join('\n\n');

            return {
                contents: [{
                    uri,
                    mimeType: 'text/plain',
                    text: workflowText
                }]
            };
        }

        if (uri === 'api://documentation/best-practices') {
            const practicesText = API_DOCUMENTATION.bestPractices.map(practice =>
                `${practice.title}\n${practice.description}`
            ).join('\n\n');

            return {
                contents: [{
                    uri,
                    mimeType: 'text/plain',
                    text: practicesText
                }]
            };
        }

        if (uri.startsWith('api://endpoint/')) {
            const endpointId = uri.replace('api://endpoint/', '');
            const endpoint = getEndpointById(endpointId);

            if (!endpoint) {
                throw new Error(`Endpoint not found: ${endpointId}`);
            }

            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(endpoint, null, 2)
                }]
            };
        }

        throw new Error(`Resource not found: ${uri}`);
    }

    /**
     * Busca endpoints por query
     */
    searchEndpoints(query: string) {
        return searchEndpoints(query);
    }

    /**
     * Obtiene contexto relevante para una consulta específica
     */
    getContextForQuery(query: string): string {
        const lowerQuery = query.toLowerCase();
        const context: string[] = [];

        // Palabras clave para mapear consultas a conceptos
        const keywordMap: Record<string, string[]> = {
            'producto': ['product', 'catálogo', 'inventario', 'nuevo'],
            'venta': ['sales', 'estadística', 'rendimiento', 'transacción'],
            'company': ['empresa', 'compañía', 'negocio', 'información'],
            'analisis': ['análisis', 'analiza', 'recomienda', 'recomendación'],
        };

        // Expandir la consulta con sinónimos
        const expandedTerms = [lowerQuery];
        Object.entries(keywordMap).forEach(([key, synonyms]) => {
            if (synonyms.some(syn => lowerQuery.includes(syn)) || lowerQuery.includes(key)) {
                expandedTerms.push(key, ...synonyms);
            }
        });

        // Función helper para verificar relevancia
        const isRelevant = (text: string): boolean => {
            const lowerText = text.toLowerCase();
            return expandedTerms.some(term => lowerText.includes(term));
        };

        // Buscar workflows relevantes
        const relevantWorkflows = API_DOCUMENTATION.workflows.filter(w =>
            isRelevant(w.name) ||
            isRelevant(w.description) ||
            w.steps.some(s => isRelevant(s.action) || isRelevant(s.description || ''))
        );

        if (relevantWorkflows.length > 0) {
            context.push('=== WORKFLOWS RELEVANTES ===');
            relevantWorkflows.forEach(workflow => {
                const steps = workflow.steps.map(s =>
                    `${s.step}. ${s.action}${s.description ? ` - ${s.description}` : ''}`
                ).join('\n');
                context.push(`\n${workflow.name}\n${workflow.description}\n${steps}`);
            });
        }

        // Buscar endpoints relevantes con búsqueda mejorada
        const relevantEndpoints = API_DOCUMENTATION.endpoints.filter(endpoint =>
            isRelevant(endpoint.id) ||
            isRelevant(endpoint.name) ||
            isRelevant(endpoint.description) ||
            isRelevant(endpoint.path) ||
            endpoint.useCases.some(useCase => isRelevant(useCase))
        );

        if (relevantEndpoints.length > 0) {
            context.push('\n=== ENDPOINTS RELEVANTES ===');
            relevantEndpoints.forEach(endpoint => {
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
            });
        }

        // Agregar best practices si es relevante
        const relevantPractices = API_DOCUMENTATION.bestPractices.filter(p =>
            isRelevant(p.title) || isRelevant(p.description)
        );

        if (relevantPractices.length > 0) {
            context.push('\n=== MEJORES PRÁCTICAS RELEVANTES ===');
            relevantPractices.forEach(practice => {
                context.push(`${practice.title}: ${practice.description}`);
            });
        }

        // Si no se encontró contenido específico, proporcionar información general
        if (context.length === 0) {
            context.push('=== INFORMACIÓN GENERAL ===');
            context.push('Para análisis completo de negocio, sigue estos pasos:');
            context.push('1. Obtén company_id con getCompanyInfo');
            context.push('2. Consulta productos con getAllProducts');
            context.push('3. Revisa estadísticas con getSalesStatistics');
            context.push('\nEndpoints principales disponibles:');
            API_DOCUMENTATION.endpoints.forEach(e => {
                context.push(`- ${e.name}: ${e.description}`);
            });
        }

        return context.join('\n');
    }
}

/**
 * Instancia singleton del servidor MCP
 */
export const mcpServer = new APIMCPServer();

/**
 * Hook para usar el servidor MCP en componentes React
 */
export function useMCPContext(query: string): string {
    return mcpServer.getContextForQuery(query);
}
