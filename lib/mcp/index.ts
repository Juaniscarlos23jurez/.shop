/**
 * Sistema RAG (Retrieval-Augmented Generation) con MCP (Model Context Protocol)
 * 
 * Este módulo exporta todas las funcionalidades del sistema RAG/MCP para
 * proporcionar al asistente de IA conocimiento estructurado de las APIs.
 * 
 * @module lib/mcp
 */

// Exportar servidor MCP
export { mcpServer, useMCPContext, APIMCPServer } from './mcp-server';
export type { MCPResource, MCPResponse } from './mcp-server';

// Exportar documentación de APIs
export {
    API_DOCUMENTATION,
    searchEndpoint,
    searchEndpoints,
    getEndpointById,
    getAllEndpoints,
    getWorkflowByName,
    generateAPIContextForAI,
} from './api-documentation';

export type {
    APIEndpoint,
    APIParameter,
    APIWorkflow,
    WorkflowStep,
} from './api-documentation';

/**
 * Quick Start Guide:
 * 
 * 1. Para buscar endpoints:
 *    ```typescript
 *    import { searchEndpoints } from '@/lib/mcp';
 *    const results = searchEndpoints('products');
 *    ```
 * 
 * 2. Para obtener contexto con MCP:
 *    ```typescript
 *    import { mcpServer } from '@/lib/mcp';
 *    const context = mcpServer.getContextForQuery('ventas');
 *    ```
 * 
 * 3. Para usar en componentes React:
 *    ```typescript
 *    import { useMCPContext } from '@/lib/mcp';
 *    
 *    function MyComponent() {
 *        const context = useMCPContext('mi consulta');
 *        // usa el contexto...
 *    }
 *    ```
 * 
 * 4. Para generar prompt completo:
 *    ```typescript
 *    import { generateAPIContextForAI } from '@/lib/mcp';
 *    const fullContext = generateAPIContextForAI();
 *    ```
 */
