# Sistema RAG con MCP para Entender APIs

Este sistema implementa **Retrieval-Augmented Generation (RAG)** usando el **Model Context Protocol (MCP)** para proporcionar al asistente de IA un conocimiento profundo y estructurado de todas las APIs disponibles.

## 📋 Descripción General

El sistema RAG con MCP permite que el asistente de IA:

1. **Entienda las APIs disponibles**: Accede a documentación completa de endpoints, parámetros, respuestas y casos de uso
2. **Proporcione contexto relevante**: Busca y recupera información específica basada en las consultas del usuario
3. **Siga mejores prácticas**: Conoce workflows recomendados y patrones de uso óptimos
4. **Se adapte dinámicamente**: Recupera contexto específico para cada consulta del usuario

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                  Chat API (route.ts)                     │
│  - Recibe mensajes del usuario                          │
│  - Integra sistema RAG para enriquecer el contexto      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              MCP Server (mcp-server.ts)                  │
│  - Expone recursos de documentación                      │
│  - Proporciona búsqueda semántica                       │
│  - Genera contexto relevante                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│       API Documentation (api-documentation.ts)           │
│  - Documentación estructurada de todos los endpoints    │
│  - Workflows recomendados                               │
│  - Mejores prácticas                                    │
│  - Casos de uso                                         │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

### `/lib/mcp/api-documentation.ts`
Contiene la documentación completa y estructurada de todas las APIs:

- **Endpoints**: Información detallada de cada API (método, path, parámetros, respuestas)
- **Workflows**: Flujos de trabajo recomendados paso a paso
- **Best Practices**: Mejores prácticas para usar las APIs eficientemente
- **Common Errors**: Errores comunes y sus soluciones

**Funciones principales:**
- `searchEndpoint(query)`: Busca un endpoint específico
- `searchEndpoints(query)`: Busca múltiples endpoints relacionados
- `getEndpointById(id)`: Obtiene un endpoint por su ID
- `generateAPIContextForAI()`: Genera todo el contexto para el prompt del AI

### `/lib/mcp/mcp-server.ts`
Implementa el servidor MCP que expone la documentación como recursos consultables:

- **Recursos disponibles**:
  - `api://documentation/full`: Documentación completa
  - `api://documentation/workflows`: Workflows recomendados
  - `api://documentation/best-practices`: Mejores prácticas
  - `api://endpoint/{id}`: Información de endpoint específico

**Métodos principales:**
- `listResources()`: Lista todos los recursos disponibles
- `readResource(uri)`: Lee el contenido de un recurso específico
- `searchEndpoints(query)`: Busca endpoints por texto
- `getContextForQuery(query)`: Obtiene contexto relevante para una consulta

### `/app/api/chat/route.ts`
Integra el sistema RAG en el flujo del chat:

1. **Enriquecimiento del Prompt**: Incluye documentación completa de APIs
2. **Contexto Dinámico**: Extrae contexto específico basado en la consulta del usuario
3. **Herramienta de Consulta**: Proporciona `queryAPIDocumentation` para búsquedas en tiempo real

## 🚀 Cómo Funciona

### 1. Contexto General (Siempre Activo)

Cuando el usuario envía un mensaje, el sistema:

```typescript
// Genera documentación completa para el prompt base
const apiDocs = generateAPIContextForAI();

// El prompt del sistema incluye TODA la documentación
const systemPrompt = `
**CONOCIMIENTO DE APIs (RAG System):**
${apiDocs}
...
`;
```

Esto significa que el AI **siempre** tiene acceso a:
- Todos los endpoints disponibles
- Parámetros requeridos y opcionales
- Casos de uso de cada endpoint
- Workflows recomendados
- Mejores prácticas

### 2. Contexto Específico (Basado en la Consulta)

Para consultas del usuario autenticado, el sistema también:

```typescript
// Analiza el mensaje del usuario
const lastUserMessage = userMessages[userMessages.length - 1];
const messageText = lastUserMessage.content;

// Busca contexto específico relevante
const ragContext = mcpServer.getContextForQuery(messageText);

// Agrega al prompt
${ragContext ? `
**CONTEXTO ESPECÍFICO PARA ESTA CONSULTA:**
${ragContext}
` : ''}
```

Esto proporciona información **ultra-relevante** como:
- Endpoints relacionados con la consulta
- Workflows específicos para ese caso
- Mejores prácticas aplicables

### 3. Herramienta de Consulta en Tiempo Real

El AI puede usar la herramienta `queryAPIDocumentation`:

```typescript
queryAPIDocumentation: tool({
    description: 'Consulta la documentación de APIs...',
    inputSchema: z.object({
        query: z.string().describe('Consulta sobre APIs...'),
    }),
    execute: async ({ query }) => {
        const context = mcpServer.getContextForQuery(query);
        const relevantEndpoints = mcpServer.searchEndpoints(query);
        
        return {
            context,
            relevantEndpoints,
            message: `Encontré ${relevantEndpoints.length} endpoint(s)...`
        };
    },
})
```

**Cuándo la usa el AI:**
- Cuando necesita información específica sobre un endpoint
- Para verificar parámetros antes de hacer una llamada
- Para entender el flujo correcto de uso de APIs

## 📊 APIs Documentadas

El sistema actualmente documenta las siguientes APIs:

### 1. **Get Company Information** (`auth-profile-company`)
- **Path**: `/api/auth/profile/company`
- **Uso**: Primer paso para obtener `company_id`
- **Retorna**: Información de la compañía del usuario

### 2. **Get All Products** (`get-all-products`)
- **Path**: `/api/companies/{companyId}/products`
- **Uso**: Obtener catálogo completo de productos
- **Parámetros**: `companyId`, `page`, `per_page`

### 3. **Get Sales Statistics** (`get-sales-statistics`)
- **Path**: `/api/sales/statistics`
- **Uso**: Estadísticas agregadas de ventas
- **Parámetros**: `date_from`, `date_to`, `location_id`

### 4. **Get Recent Sales** (`get-recent-sales`)
- **Path**: `/api/sales`
- **Uso**: Lista detallada de transacciones
- **Parámetros**: `date_from`, `date_to`, `page`, `per_page`

### 5. **Get Product Details** (`get-product-details`)
- **Path**: `/api/companies/{companyId}/products/{productId}`
- **Uso**: Información detallada de un producto específico
- **Parámetros**: `companyId`, `productId`

## 🔄 Workflows Documentados

### Workflow 1: Análisis Completo de Negocio

```
1. getCompanyInfo → Obtener company_id
2. getAllProducts → Obtener catálogo completo (con company_id)
3. getSalesStatistics → Obtener estadísticas de ventas (últimos 30 días)
4. Generar análisis y recomendaciones
```

### Workflow 2: Análisis de Producto Específico

```
1. getCompanyInfo → Obtener company_id
2. getProductDetails → Obtener detalles del producto
3. getSalesStatistics → Verificar rendimiento en ventas
```

## ✅ Mejores Prácticas Documentadas

1. **Siempre obtener company_id primero**: La mayoría de endpoints lo requieren
2. **Usar periodos de tiempo apropiados**: 30-90 días para análisis generales
3. **Paginación eficiente**: Usar `per_page=50` o mayor para catálogos completos
4. **Combinar datos**: Juntar productos + ventas para mejores recomendaciones

## 🎯 Beneficios del Sistema RAG

### Para el AI:
- ✅ **Conocimiento completo**: Siempre sabe qué APIs están disponibles
- ✅ **Contexto preciso**: Puede encontrar información específica rápidamente
- ✅ **Menos errores**: Conoce parámetros requeridos y formatos correctos
- ✅ **Mejor razonamiento**: Puede seguir workflows documentados

### Para el Usuario:
- ✅ **Respuestas más precisas**: El AI entiende mejor cómo obtener datos
- ✅ **Menos interacciones**: El AI puede ejecutar flujos completos sin preguntar
- ✅ **Recomendaciones informadas**: Basadas en conocimiento estructurado de APIs
- ✅ **Experiencia fluida**: El AI sabe exactamente qué hacer y cuándo

## 🔍 Ejemplo de Uso

**Usuario pregunta:** "Recomiéndame un producto nuevo para mi catálogo"

**El sistema RAG hace lo siguiente:**

1. **Contexto General**: El AI ya tiene toda la documentación en su prompt
2. **Contexto Específico**: `mcpServer.getContextForQuery("producto nuevo catálogo")` retorna:
   - Endpoints relacionados: `get-all-products`, `get-sales-statistics`
   - Workflow: "Análisis Completo de Negocio"
   - Best Practice: "Combinar datos de productos + ventas"

3. **Ejecución**:
   ```
   AI llama automáticamente:
   1. getCompanyInfo()
   2. getAllProducts(companyId, perPage=50)
   3. getSalesStatistics(date_from, date_to)
   4. Analiza datos y genera recomendación
   ```

4. **Respuesta**:
   ```
   📊 Análisis de Datos
   - Catálogo actual: 25 productos
   - Productos más vendidos: X, Y, Z
   - Gaps identificados: Categoría A tiene pocas opciones

   💡 Recomendaciones Específicas
   - Agregar productos en Categoría A
   - Considerar variantes de producto X (alto rendimiento)

   ✅ Próximos Pasos
   1. Investigar proveedores de Categoría A
   2. Analizar margen de ganancia potencial
   ```

## 🛠️ Extensión del Sistema

Para agregar nuevas APIs al sistema RAG:

### 1. Actualizar `api-documentation.ts`

```typescript
{
    id: 'mi-nuevo-endpoint',
    name: 'Mi Nueva API',
    method: 'GET',
    path: '/api/mi-nuevo-endpoint',
    authentication: true,
    description: 'Descripción clara de qué hace',
    parameters: [
        {
            name: 'param1',
            type: 'string',
            location: 'query',
            required: true,
            description: 'Descripción del parámetro'
        }
    ],
    response: { /* estructura de respuesta */ },
    useCases: [
        'Caso de uso 1',
        'Caso de uso 2'
    ]
}
```

### 2. Agregar Tool en `route.ts`

```typescript
getNuevoEndpoint: tool({
    description: 'Descripción para el AI',
    inputSchema: z.object({
        param1: z.string().describe('Descripción'),
    }),
    execute: async ({ param1 }) => {
        // Implementación
    },
}),
```

### 3. (Opcional) Agregar Workflow

```typescript
{
    name: 'Nuevo Workflow',
    description: 'Descripción del flujo',
    steps: [
        {
            step: 1,
            endpoint: 'mi-nuevo-endpoint',
            action: 'Qué hace este paso',
            output: 'Qué retorna'
        }
    ]
}
```

## 🎓 Conclusión

El sistema RAG con MCP proporciona al asistente de IA un "cerebro externo" con conocimiento estructurado de todas las APIs disponibles. Esto resulta en:

- **Interacciones más inteligentes**: El AI sabe qué puede hacer y cómo hacerlo
- **Menos errores**: Conoce formatos, parámetros y restricciones
- **Mejor experiencia**: Respuestas más rápidas, precisas y completas
- **Escalabilidad**: Fácil agregar nuevas APIs sin reentrenar el modelo

El sistema está **siempre activo** y se actualiza automáticamente cuando se modifica la documentación.
