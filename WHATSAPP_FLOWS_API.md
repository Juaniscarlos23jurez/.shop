# API de Flujos Automáticos de WhatsApp

## Endpoints

### 1. Crear un Flujo (POST)
```
POST /api/whatsapp/companies/{companyId}/flows
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (Request):**
```json
{
  "name": "string - Nombre del flujo",
  "description": "string - Descripción del flujo",
  "trigger": "manual | first_message | keyword | post_purchase | abandoned_cart",
  "triggerKeywords": ["string[]", "palabras clave si trigger es 'keyword'"],
  "isActive": "boolean",
  "steps": [
    {
      "id": "string - ID único del paso",
      "type": "message | question | condition | action | delay | ai_assistant",
      "content": "string - Contenido del mensaje o pregunta",
      "options": ["string[]", "opciones si type es 'question'"],
      "nextStep": "string - ID del siguiente paso (para type 'message')"],
      "optionConnections": {
        "0": "string - ID del paso si selecciona opción 0",
        "1": "string - ID del paso si selecciona opción 1"
      },
      "conditions": [
        {
          "field": "string - Campo a evaluar",
          "operator": "equals | contains | greater_than | less_than",
          "value": "string - Valor a comparar",
          "nextStep": "string - ID del paso si se cumple"
        }
      ],
      "actions": [
        {
          "type": "tag_contact | send_notification | create_order | assign_agent",
          "parameters": {
            "key": "value"
          }
        }
      ],
      "delay": "number - Segundos de espera (para type 'delay')",
      "aiConfig": {
        "assistantType": "customer_service | sales | support | order_confirmation",
        "prompt": "string - Prompt personalizado",
        "maxTokens": "number - Máximo de tokens (default: 150)",
        "temperature": "number - Creatividad 0-1 (default: 0.7)",
        "fallbackMessage": "string - Mensaje si falla la IA"
      }
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "string - ID generado por el servidor",
    "name": "Bienvenida Nuevos Clientes",
    "description": "Flujo automático para dar la bienvenida...",
    "trigger": "first_message",
    "triggerKeywords": [],
    "isActive": true,
    "steps": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "stats": {
      "totalTriggers": 0,
      "completionRate": 0,
      "averageTime": 0
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "string - Descripción del error"
}
```

---

### 2. Actualizar un Flujo (PATCH)
```
PATCH /api/whatsapp/companies/{companyId}/flows/{flowId}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (Request):**
```json
{
  "name": "string - Opcional",
  "description": "string - Opcional",
  "trigger": "string - Opcional",
  "triggerKeywords": ["string[]", "Opcional"],
  "isActive": "boolean - Opcional",
  "steps": [...]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "flowId",
    "name": "Bienvenida Nuevos Clientes",
    "description": "...",
    "trigger": "first_message",
    "triggerKeywords": [],
    "isActive": true,
    "steps": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### 3. Obtener Flujos (GET)
```
GET /api/whatsapp/companies/{companyId}/flows
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Bienvenida Nuevos Clientes",
      "description": "...",
      "trigger": "first_message",
      "isActive": true,
      "steps": [...],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 4. Eliminar un Flujo (DELETE)
```
DELETE /api/whatsapp/companies/{companyId}/flows/{flowId}
```

**Response (Success - 204):**
```json
{
  "success": true
}
```

---

## Ejemplos Completos

### Ejemplo 1: Flujo de Bienvenida Simple
```json
{
  "name": "Bienvenida Nuevos Clientes",
  "description": "Flujo automático para dar la bienvenida a nuevos clientes",
  "trigger": "first_message",
  "triggerKeywords": [],
  "isActive": true,
  "steps": [
    {
      "id": "step_1",
      "type": "message",
      "content": "¡Hola! 👋 Bienvenido a nuestro negocio. ¿En qué podemos ayudarte hoy?",
      "nextStep": "step_2"
    },
    {
      "id": "step_2",
      "type": "question",
      "content": "¿Qué te interesa?",
      "options": ["Ver productos", "Hacer un pedido", "Contactar soporte"],
      "optionConnections": {
        "0": "step_3",
        "1": "step_4",
        "2": "step_5"
      }
    },
    {
      "id": "step_3",
      "type": "message",
      "content": "Aquí están nuestros productos destacados: [lista de productos]",
      "nextStep": null
    },
    {
      "id": "step_4",
      "type": "message",
      "content": "Perfecto, te ayudaremos con tu pedido. ¿Cuál es tu nombre?",
      "nextStep": null
    },
    {
      "id": "step_5",
      "type": "message",
      "content": "Conectándote con un agente de soporte...",
      "nextStep": null
    }
  ]
}
```

### Ejemplo 2: Flujo con Condiciones
```json
{
  "name": "Seguimiento Post-Venta",
  "description": "Pide feedback después de una compra",
  "trigger": "post_purchase",
  "triggerKeywords": [],
  "isActive": true,
  "steps": [
    {
      "id": "step_1",
      "type": "message",
      "content": "¡Gracias por tu compra! 🎉 ¿Cómo fue tu experiencia?",
      "nextStep": "step_2"
    },
    {
      "id": "step_2",
      "type": "question",
      "content": "Califica tu experiencia",
      "options": ["Excelente", "Buena", "Necesita mejora"],
      "optionConnections": {
        "0": "step_3_excellent",
        "1": "step_3_good",
        "2": "step_3_poor"
      }
    },
    {
      "id": "step_3_excellent",
      "type": "message",
      "content": "¡Excelente! Aquí va un cupón de 10% para tu próxima compra: GRACIAS10",
      "nextStep": null
    },
    {
      "id": "step_3_good",
      "type": "message",
      "content": "¡Gracias por tu feedback! Seguiremos mejorando.",
      "nextStep": null
    },
    {
      "id": "step_3_poor",
      "type": "message",
      "content": "Lamentamos que no haya sido una buena experiencia. Conectándote con soporte...",
      "nextStep": null
    }
  ]
}
```

### Ejemplo 3: Flujo con IA
```json
{
  "name": "Asistente de Ventas con IA",
  "description": "Responde preguntas sobre productos usando IA",
  "trigger": "keyword",
  "triggerKeywords": ["ayuda", "producto", "precio"],
  "isActive": true,
  "steps": [
    {
      "id": "step_1",
      "type": "message",
      "content": "Hola, soy tu asistente de ventas. ¿En qué puedo ayudarte?",
      "nextStep": "step_2"
    },
    {
      "id": "step_2",
      "type": "ai_assistant",
      "content": "Responde preguntas sobre nuestros productos",
      "aiConfig": {
        "assistantType": "sales",
        "prompt": "Eres un asistente de ventas amable y profesional. Responde preguntas sobre productos, precios y promociones. Si no sabes, ofrece conectar con un agente.",
        "maxTokens": 200,
        "temperature": 0.7,
        "fallbackMessage": "No entendí tu pregunta. ¿Podrías reformularla o prefieres hablar con un agente?"
      },
      "nextStep": "step_3"
    },
    {
      "id": "step_3",
      "type": "question",
      "content": "¿Necesitas algo más?",
      "options": ["Sí", "No"],
      "optionConnections": {
        "0": "step_2",
        "1": "step_4"
      }
    },
    {
      "id": "step_4",
      "type": "message",
      "content": "¡Gracias por tu interés! Si tienes más preguntas, no dudes en escribir.",
      "nextStep": null
    }
  ]
}
```

### Ejemplo 4: Flujo con Delays
```json
{
  "name": "Recordatorio de Carrito Abandonado",
  "description": "Recuerda al cliente sobre su carrito después de 1 hora",
  "trigger": "abandoned_cart",
  "triggerKeywords": [],
  "isActive": true,
  "steps": [
    {
      "id": "step_1",
      "type": "delay",
      "content": "Esperando 1 hora...",
      "delay": 3600,
      "nextStep": "step_2"
    },
    {
      "id": "step_2",
      "type": "message",
      "content": "¿Olvidaste tu carrito? 🛒 Aquí está lo que dejaste: [productos]",
      "nextStep": "step_3"
    },
    {
      "id": "step_3",
      "type": "question",
      "content": "¿Deseas completar tu compra?",
      "options": ["Sí", "No"],
      "optionConnections": {
        "0": "step_4",
        "1": "step_5"
      }
    },
    {
      "id": "step_4",
      "type": "message",
      "content": "¡Perfecto! Aquí está tu enlace de pago: [link]",
      "nextStep": null
    },
    {
      "id": "step_5",
      "type": "message",
      "content": "Está bien, estaremos aquí cuando lo necesites.",
      "nextStep": null
    }
  ]
}
```

### Ejemplo 5: Flujo con Acciones
```json
{
  "name": "Crear Orden desde WhatsApp",
  "description": "Crea una orden y etiqueta al cliente",
  "trigger": "manual",
  "triggerKeywords": [],
  "isActive": true,
  "steps": [
    {
      "id": "step_1",
      "type": "message",
      "content": "Vamos a crear tu orden. ¿Cuál es tu nombre?",
      "nextStep": "step_2"
    },
    {
      "id": "step_2",
      "type": "question",
      "content": "¿Qué deseas ordenar?",
      "options": ["Hamburguesa", "Pizza", "Ensalada"],
      "optionConnections": {
        "0": "step_3",
        "1": "step_3",
        "2": "step_3"
      }
    },
    {
      "id": "step_3",
      "type": "action",
      "content": "Creando orden...",
      "actions": [
        {
          "type": "create_order",
          "parameters": {
            "status": "pending",
            "source": "whatsapp"
          }
        },
        {
          "type": "tag_contact",
          "parameters": {
            "tags": ["cliente_activo", "comprador"]
          }
        }
      ],
      "nextStep": "step_4"
    },
    {
      "id": "step_4",
      "type": "message",
      "content": "¡Orden creada exitosamente! Tu número de orden es #12345",
      "nextStep": null
    }
  ]
}
```

---

## Tipos de Pasos (Steps)

### 1. **message** - Mensaje Simple
Envía un mensaje de texto al cliente sin esperar respuesta.

```json
{
  "id": "step_1",
  "type": "message",
  "content": "Hola, ¿cómo estás?",
  "nextStep": "step_2"
}
```

### 2. **question** - Pregunta con Opciones
Envía una pregunta con múltiples opciones para que el cliente seleccione.

```json
{
  "id": "step_2",
  "type": "question",
  "content": "¿Qué te interesa?",
  "options": ["Opción 1", "Opción 2", "Opción 3"],
  "optionConnections": {
    "0": "step_3a",
    "1": "step_3b",
    "2": "step_3c"
  }
}
```

### 3. **condition** - Condición
Evalúa una condición y sigue diferentes caminos según el resultado.

```json
{
  "id": "step_3",
  "type": "condition",
  "content": "Evaluando condición...",
  "conditions": [
    {
      "field": "customer_type",
      "operator": "equals",
      "value": "premium",
      "nextStep": "step_4_premium"
    },
    {
      "field": "customer_type",
      "operator": "equals",
      "value": "regular",
      "nextStep": "step_4_regular"
    }
  ]
}
```

### 4. **action** - Acción
Ejecuta una acción en el sistema (crear orden, etiquetar, etc.).

```json
{
  "id": "step_4",
  "type": "action",
  "content": "Procesando...",
  "actions": [
    {
      "type": "create_order",
      "parameters": { "status": "pending" }
    },
    {
      "type": "tag_contact",
      "parameters": { "tags": ["cliente_nuevo"] }
    }
  ],
  "nextStep": "step_5"
}
```

### 5. **delay** - Espera
Espera un tiempo determinado antes de continuar.

```json
{
  "id": "step_5",
  "type": "delay",
  "content": "Esperando...",
  "delay": 3600,
  "nextStep": "step_6"
}
```

### 6. **ai_assistant** - Asistente IA
Usa IA para responder preguntas del cliente.

```json
{
  "id": "step_6",
  "type": "ai_assistant",
  "content": "Responde preguntas sobre productos",
  "aiConfig": {
    "assistantType": "sales",
    "prompt": "Eres un asistente de ventas...",
    "maxTokens": 150,
    "temperature": 0.7,
    "fallbackMessage": "No entendí, ¿puedes reformular?"
  },
  "nextStep": "step_7"
}
```

---

## Triggers Disponibles

| Trigger | Descripción | Ejemplo |
|---------|-------------|---------|
| `manual` | Se activa manualmente desde el panel | Flujo de bienvenida manual |
| `first_message` | Se activa cuando un cliente escribe por primera vez | Bienvenida automática |
| `keyword` | Se activa cuando el cliente escribe una palabra clave | "ayuda", "producto" |
| `post_purchase` | Se activa después de una compra | Feedback y cupón |
| `abandoned_cart` | Se activa cuando hay carrito abandonado | Recordatorio de compra |

---

## Operadores de Condición

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `equals` | Igual a | `field: "status", value: "premium"` |
| `contains` | Contiene | `field: "message", value: "ayuda"` |
| `greater_than` | Mayor que | `field: "total_spent", value: "100"` |
| `less_than` | Menor que | `field: "age", value: "18"` |

---

## Tipos de Acciones

| Tipo | Parámetros | Ejemplo |
|------|-----------|---------|
| `tag_contact` | `tags: string[]` | `{ "tags": ["cliente_vip", "comprador"] }` |
| `send_notification` | `title: string, message: string` | `{ "title": "Nueva orden", "message": "..." }` |
| `create_order` | `status: string, source: string` | `{ "status": "pending", "source": "whatsapp" }` |
| `assign_agent` | `agentId: string, priority: string` | `{ "agentId": "agent_123", "priority": "high" }` |

---

## Tipos de Asistentes IA

| Tipo | Descripción | Caso de Uso |
|------|-------------|-----------|
| `customer_service` | Atención al cliente | Responder preguntas generales |
| `sales` | Ventas | Recomendar productos |
| `support` | Soporte técnico | Resolver problemas técnicos |
| `order_confirmation` | Confirmación de compra | Confirmar detalles de orden |

---

## Notas Importantes

1. **IDs únicos**: Cada paso debe tener un `id` único dentro del flujo.
2. **Validación**: El servidor validará que:
   - Todos los `nextStep` e `optionConnections` apunten a pasos existentes
   - Todos los pasos tengan contenido (`content` no vacío)
   - El flujo no tenga ciclos infinitos
3. **Timestamps**: `createdAt` y `updatedAt` son generados por el servidor.
4. **Estadísticas**: `stats` se generan automáticamente en el servidor.
5. **Autenticación**: Todos los endpoints requieren un token Bearer válido.
6. **Límites**: 
   - Máximo 50 pasos por flujo
   - Máximo 10 opciones por pregunta
   - Máximo 5 condiciones por paso

