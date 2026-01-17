/**
 * Ejemplos de uso del sistema RAG con MCP
 * Este archivo muestra cómo usar las diferentes funcionalidades del sistema
 */

import { mcpServer } from './mcp-server';
import {
    searchEndpoint,
    searchEndpoints,
    getEndpointById,
    generateAPIContextForAI,
    getWorkflowByName,
    API_DOCUMENTATION
} from './api-documentation';

// ============================================
// EJEMPLO 1: Buscar un endpoint específico
// ============================================

console.log('=== EJEMPLO 1: Buscar endpoint de productos ===');

const productEndpoint = searchEndpoint('products');
console.log('Endpoint encontrado:', productEndpoint?.name);
console.log('Path:', productEndpoint?.path);
console.log('Casos de uso:', productEndpoint?.useCases);

// ============================================
// EJEMPLO 2: Buscar múltiples endpoints
// ============================================

console.log('\n=== EJEMPLO 2: Buscar todos los endpoints relacionados con "sales" ===');

const salesEndpoints = searchEndpoints('sales');
console.log(`Encontrados ${salesEndpoints.length} endpoints:`);
salesEndpoints.forEach(endpoint => {
    console.log(`  - ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
});

// ============================================
// EJEMPLO 3: Obtener endpoint por ID
// ============================================

console.log('\n=== EJEMPLO 3: Obtener endpoint por ID ===');

const companyInfoEndpoint = getEndpointById('auth-profile-company');
if (companyInfoEndpoint) {
    console.log('Endpoint:', companyInfoEndpoint.name);
    console.log('Descripción:', companyInfoEndpoint.description);
    console.log('Requiere autenticación:', companyInfoEndpoint.authentication);
}

// ============================================
// EJEMPLO 4: Usar el servidor MCP
// ============================================

console.log('\n=== EJEMPLO 4: Obtener contexto para una consulta ===');

const context = mcpServer.getContextForQuery('recomienda un producto nuevo');
console.log('Contexto generado:');
console.log(context.substring(0, 500) + '...');

// ============================================
// EJEMPLO 5: Listar todos los recursos MCP
// ============================================

console.log('\n=== EJEMPLO 5: Recursos MCP disponibles ===');

const resources = mcpServer.listResources();
console.log(`Total de recursos: ${resources.length}`);
resources.slice(0, 5).forEach(resource => {
    console.log(`  - ${resource.name}`);
    console.log(`    URI: ${resource.uri}`);
    console.log(`    Descripción: ${resource.description}`);
});

// ============================================
// EJEMPLO 6: Leer un recurso MCP
// ============================================

console.log('\n=== EJEMPLO 6: Leer recurso de workflows ===');

const workflowResource = mcpServer.readResource('api://documentation/workflows');
console.log('Contenido del recurso workflows:');
console.log(workflowResource.contents[0].text.substring(0, 300) + '...');

// ============================================
// EJEMPLO 7: Obtener workflow específico
// ============================================

console.log('\n=== EJEMPLO 7: Obtener workflow de análisis completo ===');

const analysisWorkflow = getWorkflowByName('Análisis Completo');
if (analysisWorkflow) {
    console.log('Workflow:', analysisWorkflow.name);
    console.log('Descripción:', analysisWorkflow.description);
    console.log('Pasos:');
    analysisWorkflow.steps.forEach(step => {
        console.log(`  ${step.step}. ${step.action}`);
    });
}

// ============================================
// EJEMPLO 8: Generar contexto completo para AI
// ============================================

console.log('\n=== EJEMPLO 8: Generar contexto completo para AI ===');

const fullContext = generateAPIContextForAI();
console.log(`Tamaño del contexto: ${fullContext.length} caracteres`);
console.log('Preview:');
console.log(fullContext.substring(0, 500) + '...');

// ============================================
// EJEMPLO 9: Búsqueda semántica con MCP
// ============================================

console.log('\n=== EJEMPLO 9: Búsqueda semántica de endpoints ===');

const queries = [
    'catálogo de productos',
    'estadísticas de ventas',
    'información de la empresa',
    'transacciones recientes'
];

queries.forEach(query => {
    const results = mcpServer.searchEndpoints(query);
    console.log(`\nQuery: "${query}"`);
    console.log(`Resultados: ${results.length}`);
    if (results.length > 0) {
        console.log(`  → ${results[0].name} (${results[0].path})`);
    }
});

// ============================================
// EJEMPLO 10: Obtener mejores prácticas
// ============================================

console.log('\n=== EJEMPLO 10: Mejores prácticas ===');

API_DOCUMENTATION.bestPractices.forEach((practice, index) => {
    console.log(`\n${index + 1}. ${practice.title}`);
    console.log(`   ${practice.description}`);
});

// ============================================
// EJEMPLO 11: Errores comunes y soluciones
// ============================================

console.log('\n=== EJEMPLO 11: Errores comunes ===');

API_DOCUMENTATION.commonErrors.forEach(error => {
    console.log(`\nError ${error.code}: ${error.message}`);
    console.log(`  Solución: ${error.solution}`);
});

// ============================================
// EJEMPLO 12: Uso en un componente React
// ============================================

console.log('\n=== EJEMPLO 12: Hook para componentes React ===');

// Ejemplo de cómo usarlo en un componente:
/*
import { useMCPContext } from '@/lib/mcp/mcp-server';

function MyComponent() {
    const userQuery = "quiero analizar mis ventas";
    const context = useMCPContext(userQuery);
    
    console.log('Contexto relevante:', context);
    
    return <div>...</div>;
}
*/

export {
    mcpServer,
    searchEndpoint,
    searchEndpoints,
    getEndpointById,
    generateAPIContextForAI,
    getWorkflowByName,
    API_DOCUMENTATION
};
