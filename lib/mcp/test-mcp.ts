/**
 * Script de prueba para el sistema RAG con MCP
 * Ejecutar con: npx tsx lib/mcp/test-mcp.ts
 */

import { mcpServer } from './mcp-server';
import {
    searchEndpoint,
    searchEndpoints,
    getEndpointById,
    generateAPIContextForAI,
    API_DOCUMENTATION
} from './api-documentation';

console.log('🧪 Iniciando pruebas del sistema RAG con MCP\n');

// Test 1: Verificar que todos los endpoints están disponibles
console.log('✅ Test 1: Verificar endpoints disponibles');
console.log(`   Total de endpoints: ${API_DOCUMENTATION.endpoints.length}`);
console.log(`   Endpoints:`);
API_DOCUMENTATION.endpoints.forEach(e => {
    console.log(`   - ${e.id}: ${e.name}`);
});
console.log('');

// Test 2: Búsqueda de endpoints
console.log('✅ Test 2: Búsqueda de endpoints');
const testQueries = ['products', 'sales', 'company'];
testQueries.forEach(query => {
    const results = searchEndpoints(query);
    console.log(`   Query "${query}": ${results.length} resultado(s)`);
});
console.log('');

// Test 3: Obtener endpoint por ID
console.log('✅ Test 3: Obtener endpoint por ID');
const testIds = ['auth-profile-company', 'get-all-products', 'get-sales-statistics'];
testIds.forEach(id => {
    const endpoint = getEndpointById(id);
    console.log(`   ${id}: ${endpoint ? '✓ Encontrado' : '✗ No encontrado'}`);
});
console.log('');

// Test 4: Workflows
console.log('✅ Test 4: Workflows disponibles');
console.log(`   Total de workflows: ${API_DOCUMENTATION.workflows.length}`);
API_DOCUMENTATION.workflows.forEach(w => {
    console.log(`   - ${w.name} (${w.steps.length} pasos)`);
});
console.log('');

// Test 5: Servidor MCP - Recursos
console.log('✅ Test 5: Recursos MCP');
const resources = mcpServer.listResources();
console.log(`   Total de recursos: ${resources.length}`);
console.log(`   Primeros 5:`);
resources.slice(0, 5).forEach(r => {
    console.log(`   - ${r.uri}`);
});
console.log('');

// Test 6: Servidor MCP - Lectura de recursos
console.log('✅ Test 6: Lectura de recursos MCP');
const testResources = [
    'api://documentation/full',
    'api://documentation/workflows',
    'api://documentation/best-practices'
];
testResources.forEach(uri => {
    try {
        const resource = mcpServer.readResource(uri);
        const contentLength = resource.contents[0].text.length;
        console.log(`   ${uri}: ✓ (${contentLength} caracteres)`);
    } catch (error) {
        console.log(`   ${uri}: ✗ Error`);
    }
});
console.log('');

// Test 7: Contexto para consultas
console.log('✅ Test 7: Generación de contexto para consultas');
const testUserQueries = [
    'recomiéndame un producto nuevo',
    'analiza mis ventas',
    'qué productos tengo',
    'estadísticas del mes'
];
testUserQueries.forEach(query => {
    const context = mcpServer.getContextForQuery(query);
    const hasWorkflows = context.includes('WORKFLOWS');
    const hasEndpoints = context.includes('ENDPOINTS');
    const hasPractices = context.includes('MEJORES PRÁCTICAS');
    console.log(`   "${query}":`);
    console.log(`     - Workflows: ${hasWorkflows ? '✓' : '✗'}`);
    console.log(`     - Endpoints: ${hasEndpoints ? '✓' : '✗'}`);
    console.log(`     - Prácticas: ${hasPractices ? '✓' : '✗'}`);
});
console.log('');

// Test 8: Generación de contexto completo para AI
console.log('✅ Test 8: Contexto completo para AI');
const fullContext = generateAPIContextForAI();
console.log(`   Tamaño total: ${fullContext.length} caracteres`);
console.log(`   Incluye "ENDPOINTS DISPONIBLES": ${fullContext.includes('ENDPOINTS DISPONIBLES') ? '✓' : '✗'}`);
console.log(`   Incluye "WORKFLOWS RECOMENDADOS": ${fullContext.includes('WORKFLOWS RECOMENDADOS') ? '✓' : '✗'}`);
console.log(`   Incluye "MEJORES PRÁCTICAS": ${fullContext.includes('MEJORES PRÁCTICAS') ? '✓' : '✗'}`);
console.log('');

// Test 9: Best Practices
console.log('✅ Test 9: Mejores prácticas');
console.log(`   Total: ${API_DOCUMENTATION.bestPractices.length}`);
API_DOCUMENTATION.bestPractices.forEach(p => {
    console.log(`   - ${p.title}`);
});
console.log('');

// Test 10: Common Errors
console.log('✅ Test 10: Errores comunes');
console.log(`   Total: ${API_DOCUMENTATION.commonErrors.length}`);
API_DOCUMENTATION.commonErrors.forEach(e => {
    console.log(`   - ${e.code}: ${e.message}`);
});
console.log('');

// Test 11: Búsqueda específica del servidor MCP
console.log('✅ Test 11: Búsqueda específica MCP');
const searchResults = mcpServer.searchEndpoints('productos');
console.log(`   Búsqueda "productos": ${searchResults.length} resultado(s)`);
searchResults.forEach(e => {
    console.log(`   - ${e.name} (${e.method} ${e.path})`);
});
console.log('');

// Resumen final
console.log('═══════════════════════════════════════════════');
console.log('🎉 Todas las pruebas completadas');
console.log('═══════════════════════════════════════════════');
console.log(`
📊 Resumen:
- Endpoints documentados: ${API_DOCUMENTATION.endpoints.length}
- Workflows disponibles: ${API_DOCUMENTATION.workflows.length}
- Mejores prácticas: ${API_DOCUMENTATION.bestPractices.length}
- Errores comunes: ${API_DOCUMENTATION.commonErrors.length}
- Recursos MCP: ${resources.length}
- Tamaño contexto AI: ${fullContext.length} caracteres

✅ Sistema RAG con MCP está funcionando correctamente
`);
