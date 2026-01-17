# ❓ FAQ y Troubleshooting - Sistema RAG con MCP

## 🤔 Preguntas Frecuentes

### 1. ¿Qué es RAG?

**RAG (Retrieval-Augmented Generation)** es una técnica que combina:
- **Retrieval**: Recuperar información relevante de una base de conocimiento
- **Augmented**: Enriquecer el prompt del modelo de IA
- **Generation**: Generar respuestas basadas en ese conocimiento

En nuestro caso, "recuperamos" documentación de APIs y "enriquecemos" el prompt para que el AI genere mejores respuestas.

### 2. ¿Qué es MCP?

**MCP (Model Context Protocol)** es un protocolo para exponer recursos y contexto a modelos de IA de manera estructurada. Piensa en él como una "API" que el modelo puede consultar para obtener información.

### 3. ¿Por qué usar RAG con MCP?

**Ventajas:**
- ✅ El AI no necesita ser reentrenado cuando cambian las APIs
- ✅ Conocimiento actualizable en tiempo real
- ✅ Menor contexto en el prompt base (más eficiente)
- ✅ Búsqueda semántica de información relevante
- ✅ Respuestas más precisas y actualizadas

### 4. ¿Cómo funciona en este proyecto?

1. Usuario envía mensaje → "Recomiéndame un producto"
2. Sistema RAG busca contexto relevante → Encuentra workflow "Análisis Completo"
3. MCP Server proporciona documentación → Endpoints, parámetros, mejores prácticas
4. AI recibe prompt enriquecido → Conoce exactamente qué hacer
5. AI ejecuta herramientas → getCompanyInfo → getAllProducts → getSalesStatistics
6. AI analiza datos → Combina catálogo + ventas
7. AI genera recomendación → Respuesta completa y precisa

### 5. ¿Dónde está la documentación de las APIs?

En `/lib/mcp/api-documentation.ts`. Este archivo contiene:
- Estructura de cada endpoint
- Parámetros requeridos/opcionales
- Ejemplos de respuestas
- Casos de uso
- Workflows recomendados
- Mejores prácticas

### 6. ¿Cómo agrego una nueva API?

```typescript
// 1. En api-documentation.ts, agregar al array endpoints:
{
    id: 'mi-nueva-api',
    name: 'Mi Nueva API',
    method: 'POST',
    path: '/api/mi-endpoint',
    authentication: true,
    description: 'Descripción clara de qué hace',
    parameters: [
        {
            name: 'param1',
            type: 'string',
            location: 'body',
            required: true,
            description: 'Qué es este parámetro'
        }
    ],
    response: { /* estructura */ },
    useCases: ['Caso 1', 'Caso 2']
}

// 2. En route.ts, agregar herramienta:
miNuevaAPI: tool({
    description: 'Descripción para el AI',
    inputSchema: z.object({
        param1: z.string().describe('Descripción'),
    }),
    execute: async ({ param1 }) => {
        const data = await fetchAPI('/api/mi-endpoint', token, {
            method: 'POST',
            body: JSON.stringify({ param1 })
        });
        return { success: true, data };
    },
})

// 3. Ejecutar pruebas
npx tsx lib/mcp/test-mcp.ts
```

### 7. ¿El sistema funciona sin autenticación?

Sí, pero con limitaciones:
- **Sin auth**: Solo herramienta `getDemoStats` (datos ficticios)
- **Con auth**: Todas las herramientas + RAG context completo

### 8. ¿Qué pasa si el AI no encuentra contexto relevante?

El sistema tiene un **fallback** que proporciona:
- Información general de workflows
- Lista de todos los endpoints disponibles
- Guía básica de uso

Ver líneas 201-214 en `mcp-server.ts`.

### 9. ¿Puedo usar el sistema fuera del chat?

¡Sí! El sistema es modular:

```typescript
// En cualquier componente o API route
import { mcpServer, searchEndpoints } from '@/lib/mcp';

// Buscar endpoints
const endpoints = searchEndpoints('products');

// Obtener contexto para una consulta
const context = mcpServer.getContextForQuery('análisis de ventas');

// Usar en componente React
import { useMCPContext } from '@/lib/mcp';

function MyComponent() {
    const context = useMCPContext('mi consulta');
    // usar context...
}
```

### 10. ¿Cómo puedo verificar que todo funciona?

```bash
# Ejecutar suite de tests
npx tsx lib/mcp/test-mcp.ts

# Deberías ver:
✅ Test 1: Endpoints disponibles
✅ Test 2: Búsqueda de endpoints
...
✅ Sistema RAG con MCP está funcionando correctamente
```

## 🔧 Troubleshooting

### Problema 1: "Property 'content' does not exist on type 'UIMessage'"

**Causa**: TypeScript no puede inferir el tipo correcto de `UIMessage`

**Solución**: Ya está corregido en el código con:
```typescript
const lastUserMessage: any = userMessages[userMessages.length - 1];
```

### Problema 2: El AI no usa las herramientas automáticamente

**Causas posibles:**
1. El prompt no es lo suficientemente directivo
2. El contexto RAG no está llegando
3. `maxSteps` es muy bajo

**Soluciones:**
```typescript
// 1. Verificar que el contexto se está generando:
console.log('RAG Context:', ragContext);

// 2. Aumentar maxSteps si es necesario:
maxSteps: 10, // En route.ts línea 124

// 3. Hacer el prompt más directivo:
**ATENCIÓN: El usuario está pidiendo análisis AHORA. 
Ejecuta getCompanyInfo → getAllProducts → getSalesStatistics AHORA MISMO.**
```

### Problema 3: Búsqueda semántica no encuentra resultados

**Causa**: Keywords no cubren el término buscado

**Solución**: Agregar más keywords en `mcp-server.ts`:
```typescript
const keywordMap: Record<string, string[]> = {
    'producto': ['product', 'catálogo', 'inventario', 'nuevo', 'item'],
    'venta': ['sales', 'estadística', 'rendimiento', 'transacción', 'orden'],
    // Agregar más según necesidad
    'cliente': ['customer', 'usuario', 'comprador'],
};
```

### Problema 4: El contexto RAG es muy largo

**Causa**: Se incluye toda la documentación en cada consulta

**Solución**: 
```typescript
// Opción 1: Limitar el contexto específico
if (context.length > 2000) {
    // Tomar solo los primeros N resultados más relevantes
}

// Opción 2: No incluir apiDocs completo siempre
// Solo incluirlo en el primer mensaje
if (messages.length === 1) {
    systemPrompt += apiDocs;
}
```

### Problema 5: Tests fallan con "Module not found"

**Causa**: Imports relativos incorrectos

**Solución**:
```bash
# Verificar que tsconfig.json tiene paths correctos
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# Ejecutar con tsx que resuelve paths automáticamente
npx tsx lib/mcp/test-mcp.ts
```

### Problema 6: El AI no usa queryAPIDocumentation

**Causa**: El AI solo usa esta herramienta si no está seguro de algo

**Solución**: Esta herramienta es opcional. El AI la usará:
- Cuando necesite verificar parámetros
- Si no está seguro de un endpoint
- Para entender un workflow específico

Normalmente el contexto base es suficiente.

### Problema 7: Errores de tipo en producción

**Causa**: TypeScript strict mode

**Solución**:
```typescript
// Usar type assertions cuando sea necesario
const lastUserMessage: any = userMessages[userMessages.length - 1];

// O definir tipos específicos
interface UIMessageWithContent extends UIMessage {
    content: string | ContentPart[];
}
```

### Problema 8: Performance lento

**Causas posibles:**
1. Contexto muy grande
2. Muchas búsquedas síncronas
3. Generación de contexto pesada

**Soluciones:**
```typescript
// 1. Cachear contexto base
let cachedAPIContext: string | null = null;
const apiDocs = cachedAPIContext || (cachedAPIContext = generateAPIContextForAI());

// 2. Limitar búsquedas
const relevantEndpoints = API_DOCUMENTATION.endpoints
    .filter(isRelevant)
    .slice(0, 3); // Solo top 3

// 3. Usar lazy loading
if (hasAuth && needsAnalysis) {
    ragContext = mcpServer.getContextForQuery(messageText);
}
```

## 🐛 Debugging

### Activar logs detallados

```typescript
// En mcp-server.ts
getContextForQuery(query: string): string {
    console.log('[MCP] Query:', query);
    console.log('[MCP] Expanded terms:', expandedTerms);
    console.log('[MCP] Found workflows:', relevantWorkflows.length);
    console.log('[MCP] Found endpoints:', relevantEndpoints.length);
    // ... resto del código
}

// En route.ts
console.log('[Chat] Has auth:', hasAuth);
console.log('[Chat] RAG context length:', ragContext.length);
console.log('[Chat] System prompt length:', systemPrompt.length);
```

### Verificar recursos MCP

```typescript
// En browser console o Node
import { mcpServer } from '@/lib/mcp/mcp-server';

// Listar todos los recursos
console.log(mcpServer.listResources());

// Leer un recurso específico
console.log(mcpServer.readResource('api://documentation/full'));

// Buscar endpoints
console.log(mcpServer.searchEndpoints('sales'));

// Obtener contexto
console.log(mcpServer.getContextForQuery('recomiéndame productos'));
```

### Verificar que las herramientas se ejecutan

```typescript
// En route.ts, agregar logs en execute:
getAllProducts: tool({
    execute: async ({ companyId, perPage, page }) => {
        console.log('[Tool] getAllProducts called with:', { companyId, perPage, page });
        // ... resto del código
        console.log('[Tool] getAllProducts returned:', result);
        return result;
    },
}),
```

## 📚 Recursos Adicionales

### Archivos de documentación:
- `/lib/mcp/README.md` - Guía completa del sistema
- `/lib/mcp/RESUMEN.md` - Resumen ejecutivo
- `/lib/mcp/ARQUITECTURA.md` - Diagramas y visualización
- `/lib/mcp/examples.ts` - Ejemplos de código

### Para aprender más:
- [Documentación de Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Google Gemini AI Docs](https://ai.google.dev/docs)
- [RAG Concepts](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)

## 💡 Tips y Mejores Prácticas

### Tip 1: Mantén la documentación actualizada
Cada vez que agregues una API, documéntala inmediatamente en `api-documentation.ts`.

### Tip 2: Usa workflows para flujos complejos
Si un proceso requiere múltiples llamadas a APIs, créalo como un workflow documentado.

### Tip 3: Prueba regularmente
```bash
# Antes de cada commit
npx tsx lib/mcp/test-mcp.ts
```

### Tip 4: Keywords descriptivas
Agrega keywords que tus usuarios realmente usan, no solo términos técnicos.

### Tip 5: Monitorea el uso
```typescript
// Agregar analytics
getContextForQuery(query: string): string {
    analytics.track('mcp_query', { query, timestamp: Date.now() });
    // ... resto
}
```

## 🎯 Próximos Pasos Sugeridos

1. **Agregar más endpoints** conforme se desarrollen nuevas APIs
2. **Mejorar keywords** basado en consultas reales de usuarios
3. **Agregar analytics** para entender qué buscan los usuarios
4. **Crear workflows especializados** para casos de uso comunes
5. **Implementar caché** para mejorar performance
6. **Agregar tests E2E** para verificar el flujo completo

## 📞 ¿Necesitas ayuda?

Si encuentras un problema que no está listado aquí:

1. Revisa los logs en consola
2. Ejecuta los tests: `npx tsx lib/mcp/test-mcp.ts`
3. Verifica que las importaciones sean correctas
4. Revisa la documentación en `/lib/mcp/README.md`
5. Revisa ejemplos en `/lib/mcp/examples.ts`

¡El sistema está diseñado para ser robusto y fácil de debuguear!
