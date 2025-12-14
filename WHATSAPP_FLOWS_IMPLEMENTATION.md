# Implementación de Flujos de WhatsApp

## Base de Datos

### Tabla: `whatsapp_flows`
```sql
CREATE TABLE whatsapp_flows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger ENUM('manual', 'first_message', 'keyword', 'post_purchase', 'abandoned_cart') DEFAULT 'manual',
    trigger_keywords JSON,
    steps JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_triggers INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    average_time INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX (company_id, is_active),
    INDEX (trigger)
);
```

## Modelo

**Archivo:** `/app/Models/WhatsappFlow.php`

```php
class WhatsappFlow extends Model
{
    protected $table = 'whatsapp_flows';
    
    protected $fillable = [
        'company_id',
        'name',
        'description',
        'trigger',
        'trigger_keywords',
        'steps',
        'is_active',
        'total_triggers',
        'completion_rate',
        'average_time',
    ];
    
    protected $casts = [
        'trigger_keywords' => 'json',
        'steps' => 'json',
        'is_active' => 'boolean',
    ];
    
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
```

## Controlador

**Archivo:** `/app/Http/Controllers/Api/WhatsAppFlowController.php`

Métodos disponibles:
- `store()` - Crear flujo
- `update()` - Actualizar flujo
- `index()` - Listar flujos
- `show()` - Ver flujo específico
- `destroy()` - Eliminar flujo

## Rutas API

Todas las rutas requieren autenticación (`auth:sanctum`).

### 1. Crear un Flujo (POST)
```
POST /api/whatsapp/companies/{companyId}/flows
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Bienvenida Nuevos Clientes",
  "description": "Flujo automático para dar la bienvenida",
  "trigger": "first_message",
  "triggerKeywords": [],
  "isActive": true,
  "steps": [
    {
      "id": "step_1",
      "type": "message",
      "content": "¡Hola! 👋 Bienvenido a nuestro negocio.",
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
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bienvenida Nuevos Clientes",
    "description": "Flujo automático para dar la bienvenida",
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

### 2. Actualizar un Flujo (PATCH)
```
PATCH /api/whatsapp/companies/{companyId}/flows/{flowId}
```

**Body:** (Todos los campos son opcionales)
```json
{
  "name": "Nuevo nombre",
  "description": "Nueva descripción",
  "trigger": "keyword",
  "triggerKeywords": ["ayuda", "producto"],
  "isActive": false,
  "steps": [...]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### 3. Obtener Flujos (GET)
```
GET /api/whatsapp/companies/{companyId}/flows
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bienvenida Nuevos Clientes",
      "description": "...",
      "trigger": "first_message",
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
  ]
}
```

### 4. Obtener un Flujo Específico (GET)
```
GET /api/whatsapp/companies/{companyId}/flows/{flowId}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### 5. Eliminar un Flujo (DELETE)
```
DELETE /api/whatsapp/companies/{companyId}/flows/{flowId}
```

**Response (204):**
```json
{
  "success": true
}
```

## Validación

El controlador valida:
- `name` - Requerido, máximo 255 caracteres
- `description` - Opcional
- `trigger` - Requerido, debe ser uno de: `manual`, `first_message`, `keyword`, `post_purchase`, `abandoned_cart`
- `trigger_keywords` - Opcional, array de strings
- `is_active` - Booleano, por defecto true
- `steps` - Requerido, array con mínimo 1 elemento
  - `steps.*.id` - Requerido, string único
  - `steps.*.type` - Requerido, uno de: `message`, `question`, `condition`, `action`, `delay`, `ai_assistant`
  - `steps.*.content` - Requerido, string
  - `steps.*.options` - Opcional, array
  - `steps.*.next_step` - Opcional, string
  - `steps.*.option_connections` - Opcional, object
  - `steps.*.conditions` - Opcional, array
  - `steps.*.actions` - Opcional, array
  - `steps.*.delay` - Opcional, integer (segundos)
  - `steps.*.ai_config` - Opcional, object

## Autorización

- Solo el propietario de la compañía puede crear, actualizar, listar y eliminar flujos
- Si el usuario no es propietario, se retorna error 403 Unauthorized

## Ejemplos de Flujos

### Flujo de Bienvenida Simple
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

### Flujo con Condiciones (Post-Venta)
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

### Flujo con IA
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
        "prompt": "Eres un asistente de ventas amable y profesional. Responde preguntas sobre productos, precios y promociones.",
        "maxTokens": 200,
        "temperature": 0.7,
        "fallbackMessage": "No entendí tu pregunta. ¿Podrías reformularla?"
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

### Flujo con Delays (Recordatorio de Carrito Abandonado)
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
      "content": "¡Hola! Notamos que dejaste algunos artículos en tu carrito. ¿Te gustaría completar tu compra?",
      "nextStep": "step_3"
    },
    {
      "id": "step_3",
      "type": "question",
      "content": "¿Qué prefieres?",
      "options": ["Completar compra", "Ver más productos", "No gracias"],
      "optionConnections": {
        "0": "step_4",
        "1": "step_5",
        "2": "step_6"
      }
    },
    {
      "id": "step_4",
      "type": "message",
      "content": "Perfecto, aquí está el enlace a tu carrito: [enlace]",
      "nextStep": null
    },
    {
      "id": "step_5",
      "type": "message",
      "content": "Excelente, aquí están nuestros productos destacados: [productos]",
      "nextStep": null
    },
    {
      "id": "step_6",
      "type": "message",
      "content": "Está bien, si cambias de opinión, ¡estamos aquí para ayudarte!",
      "nextStep": null
    }
  ]
}
```

## Migración

Para ejecutar la migración:
```bash
php artisan migrate
```

## Testing

### Crear un flujo
```bash
curl -X POST http://localhost:8000/api/whatsapp/companies/1/flows \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Flow",
    "trigger": "manual",
    "isActive": true,
    "steps": [
      {
        "id": "step_1",
        "type": "message",
        "content": "Hola!",
        "nextStep": null
      }
    ]
  }'
```

### Listar flujos
```bash
curl -X GET http://localhost:8000/api/whatsapp/companies/1/flows \
  -H "Authorization: Bearer {token}"
```

### Actualizar flujo
```bash
curl -X PATCH http://localhost:8000/api/whatsapp/companies/1/flows/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Flow Name",
    "isActive": false
  }'
```

### Eliminar flujo
```bash
curl -X DELETE http://localhost:8000/api/whatsapp/companies/1/flows/1 \
  -H "Authorization: Bearer {token}"
```
