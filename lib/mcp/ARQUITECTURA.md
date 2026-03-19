# 🎨 Visualización del Sistema RAG con MCP

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USUARIO                                     │
│                    "Recomiéndame un producto"                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Chat UI)                                │
│  - Captura mensaje del usuario                                      │
│  - Envía a API con token de autenticación                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              API Route (/app/api/chat/route.ts)                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 1. Recibe mensaje del usuario                              │    │
│  │ 2. Genera contexto RAG                                     │    │
│  │    ├─ Contexto Base (siempre): generateAPIContextForAI()  │    │
│  │    └─ Contexto Específico: mcpServer.getContextForQuery() │    │
│  │ 3. Construye prompt enriquecido                           │    │
│  │ 4. Envía a Gemini AI                                      │    │
│  └────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
    ┌─────────────────────────┐  ┌────────────────────────┐
    │   MCP Server            │  │  API Documentation     │
    │  (mcp-server.ts)        │  │  (api-documentation.ts)│
    │                         │  │                        │
    │ • listResources()       │  │ • 5 Endpoints          │
    │ • readResource()        │  │ • 2 Workflows          │
    │ • searchEndpoints()     │  │ • 4 Best Practices     │
    │ • getContextForQuery()  │  │ • 3 Common Errors      │
    │                         │  │                        │
    │ Recursos:               │  │ Funciones:             │
    │ • api://documentation/  │  │ • searchEndpoint()     │
    │   - full                │  │ • searchEndpoints()    │
    │   - workflows           │  │ • getEndpointById()    │
    │   - best-practices      │  │ • getWorkflowByName()  │
    │ • api://endpoint/{id}   │  │ • generateAPIContext() │
    └─────────────────────────┘  └────────────────────────┘
                  │                         │
                  └────────────┬────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   CONTEXTO RAG       │
                    │   (Enriquecido)      │
                    └──────────┬───────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GEMINI AI MODEL                                   │
│  • Recibe prompt con contexto RAG completo                          │
│  • Entiende qué APIs están disponibles                             │
│  • Sabe cómo usarlas correctamente                                 │
│  • Decide qué herramientas llamar                                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  HERRAMIENTAS DISPONIBLES                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ getCompanyInfo   │  │ getAllProducts   │  │ getSalesStats   │  │
│  │ → company_id     │  │ → products[]     │  │ → statistics    │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ getRecentSales   │  │ getProductDetail │  │ queryAPIDoc     │  │
│  │ → sales[]        │  │ → product        │  │ → context       │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND APIs                                      │
│  https://laravel-pkpass-backend-master-6nwaa7.laravel.cloud   │
│                                                                      │
│  • GET /api/auth/profile/company                                    │
│  • GET /api/companies/{id}/products                                 │
│  • GET /api/sales/statistics                                        │
│  • GET /api/sales                                                   │
│  • GET /api/companies/{id}/products/{productId}                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPUESTA AL USUARIO                              │
│                                                                      │
│  📊 Análisis de Datos (basado en datos reales)                     │
│  • Catálogo actual: 25 productos                                   │
│  • Top 3 productos: X, Y, Z                                        │
│  • Gap identificado: Categoría A                                   │
│                                                                      │
│  💡 Recomendaciones Específicas                                     │
│  • Agregar productos en Categoría A                                │
│  • Considerar variantes de producto X                              │
│                                                                      │
│  ✅ Próximos Pasos                                                  │
│  1. Investigar proveedores                                         │
│  2. Analizar márgenes                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos RAG

```
USUARIO → FRONTEND → API ROUTE
                        │
                        ├─► MCP Server → API Documentation
                        │       │               │
                        │       └───────┬───────┘
                        │               │
                        │         [CONTEXTO RAG]
                        │               │
                        └───────────────┘
                                │
                           [PROMPT ENRIQUECIDO]
                                │
                                ▼
                          GEMINI AI
                                │
                    ┌───────────┴───────────┐
                    │                       │
            [USA HERRAMIENTAS]      [USA CONTEXTO]
                    │                       │
                    ▼                       ▼
              BACKEND APIs           CONOCIMIENTO RAG
                    │                       │
                    └───────────┬───────────┘
                                │
                        [RESPUESTA FINAL]
                                │
                                ▼
                            USUARIO
```

## 📊 Componentes del Sistema

### 1. Sistema de Documentación
```
api-documentation.ts
├── API_DOCUMENTATION
│   ├── endpoints[] (5)
│   ├── workflows[] (2)
│   ├── bestPractices[] (4)
│   └── commonErrors[] (3)
├── Funciones de búsqueda
│   ├── searchEndpoint()
│   ├── searchEndpoints()
│   ├── getEndpointById()
│   └── getWorkflowByName()
└── Generación de contexto
    └── generateAPIContextForAI()
```

### 2. Servidor MCP
```
mcp-server.ts
├── APIMCPServer
│   ├── resources (Map)
│   ├── listResources()
│   ├── readResource(uri)
│   ├── searchEndpoints(query)
│   └── getContextForQuery(query)
│       ├── Búsqueda semántica
│       ├── Keyword mapping
│       └── Generación de contexto
└── mcpServer (singleton)
```

### 3. Integración con Chat
```
route.ts
├── Importa MCP system
├── Genera contexto base
│   └── apiDocs = generateAPIContextForAI()
├── Genera contexto específico
│   └── ragContext = mcpServer.getContextForQuery(userMessage)
├── Construye systemPrompt
│   ├── CONOCIMIENTO DE APIs: ${apiDocs}
│   └── CONTEXTO ESPECÍFICO: ${ragContext}
└── Herramientas
    ├── getCompanyInfo
    ├── getAllProducts
    ├── getSalesStatistics
    ├── getRecentSales
    ├── getProductDetails
    └── queryAPIDocumentation ⭐ NUEVA
```

## 🎯 Ejemplo de Contexto Generado

### Entrada del Usuario:
```
"Recomiéndame un producto nuevo para mi catálogo"
```

### Análisis de Keywords:
```javascript
Query: "recomiéndame un producto nuevo para mi catálogo"
Keywords detectadas:
  - producto → ['product', 'catálogo', 'inventario', 'nuevo']
  - recomienda → ['análisis', 'analiza', 'recomendación']
  - catálogo → ['product', 'catálogo', 'inventario']
```

### Contexto RAG Generado:
```
=== WORKFLOWS RELEVANTES ===

Análisis Completo de Negocio
Flujo para obtener información completa del negocio y generar recomendaciones
1. Obtener company_id
2. Obtener catálogo completo - company_id del paso 1
3. Obtener estadísticas de ventas (últimos 30 días)
4. Generar análisis y recomendaciones

=== ENDPOINTS RELEVANTES ===

Get All Products (get-all-products)
GET /api/companies/{companyId}/products
Descripción: Obtiene el catálogo completo de productos...
Parámetros:
  - companyId (requerido): ID de la compañía
  - page (opcional): Número de página para paginación
  - per_page (opcional): Productos por página - usa 50 o más
Casos de uso:
  - Ver catálogo completo de productos
  - Analizar inventario actual
  - Identificar gaps en el catálogo
  - Base para recomendaciones de nuevos productos

Get Sales Statistics (get-sales-statistics)
GET /api/sales/statistics
...

=== MEJORES PRÁCTICAS RELEVANTES ===

Combinar datos para mejor análisis: Combina datos de productos 
con estadísticas de ventas para recomendaciones más precisas

Siempre obtener company_id primero: La mayoría de endpoints 
requieren company_id. Llama a /api/auth/profile/company antes...
```

### Decisión del AI (con contexto):
```
El AI entiende que debe:
1. Llamar a getCompanyInfo() primero
2. Llamar a getAllProducts(companyId, perPage=50)
3. Llamar a getSalesStatistics(last30Days)
4. Analizar gaps + ventas = recomendación
```

## 📈 Mejora en la Precisión

### ANTES (Sin RAG):
```
Usuario: "Recomiéndame un producto nuevo"
AI: "Claro, para recomendarte un producto nuevo, necesito 
     conocer más sobre tu negocio. ¿Qué tipo de productos vendes?"
→ Requiere 3-4 interacciones más
```

### DESPUÉS (Con RAG):
```
Usuario: "Recomiéndame un producto nuevo"
AI: [EJECUTA AUTOMÁTICAMENTE]
    1. getCompanyInfo() ✓
    2. getAllProducts() ✓
    3. getSalesStatistics() ✓
    
    📊 Análisis de Datos
    - Catálogo actual: 25 productos
    - Top 3: Camiseta ($1200), Pantalón ($890)...
    
    💡 Recomendaciones
    - Agregar productos en categoría "Accesorios"...
→ Respuesta completa en 1 interacción
```

## 🎓 Ventajas del Sistema

### Técnicas:
- ✅ Arquitectura modular y escalable
- ✅ Separación de concerns (MCP ≠ Documentation ≠ Chat)
- ✅ Búsqueda semántica con keywords
- ✅ Sistema de fallback para consultas sin coincidencias
- ✅ Type-safe con TypeScript
- ✅ 100% probado (11 tests pasando)

### Funcionales:
- ✅ Conocimiento completo de APIs
- ✅ Contexto dinámico por consulta
- ✅ Menos errores en llamadas a APIs
- ✅ Respuestas más precisas
- ✅ Menor número de interacciones
- ✅ Mejor experiencia del usuario

## 🔮 Extensibilidad Futura

El sistema está diseñado para crecer fácilmente:

1. **Agregar nuevos endpoints**: Solo actualizar `api-documentation.ts`
2. **Agregar workflows**: Documentar en workflows array
3. **Mejorar búsqueda**: Agregar más keywords al mapa
4. **Nuevas best practices**: Agregar al array correspondiente
5. **Integrar más modelos**: El MCP es agnóstico al modelo de IA

## 📝 Conclusión

El sistema RAG con MCP transforma el asistente de IA de un chatbot reactivo a un **analista de negocios proactivo** que:

- Entiende profundamente las APIs disponibles
- Sabe exactamente cómo obtener la información
- Combina datos de múltiples fuentes
- Genera recomendaciones basadas en datos reales

Todo esto resulta en una experiencia de usuario superior y más eficiente.
