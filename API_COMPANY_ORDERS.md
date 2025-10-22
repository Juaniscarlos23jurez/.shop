# API de Órdenes para Compañías

Esta documentación describe los endpoints disponibles para que las compañías puedan gestionar las órdenes que reciben de sus clientes.

## Autenticación

Todas las rutas requieren autenticación mediante Sanctum (`auth:sanctum`). El usuario autenticado debe ser el propietario de la compañía.

**Header requerido:**
```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. Listar todas las órdenes

Obtiene todas las órdenes de la compañía con filtros opcionales.

**Endpoint:**
```
GET /api/companies/{companyId}/orders
```

**Parámetros de consulta (query params):**
- `status` (opcional): Filtrar por estado (`pending`, `paid`, `completed`, `canceled`, `failed`)
- `payment_status` (opcional): Filtrar por estado de pago (`pending`, `paid`, `failed`)
- `location_id` (opcional): Filtrar por sucursal
- `delivery_method` (opcional): Filtrar por método de entrega (`pickup`, `delivery`)
- `payment_method` (opcional): Filtrar por método de pago (`cash`, `spei`, `points`)
- `from_date` (opcional): Fecha desde (formato: YYYY-MM-DD)
- `to_date` (opcional): Fecha hasta (formato: YYYY-MM-DD)
- `per_page` (opcional): Número de resultados por página (default: 20)

**Ejemplo de petición:**
```bash
GET /api/companies/1/orders?status=pending&location_id=1&per_page=50
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "custom_user_id": 5,
        "company_id": 1,
        "location_id": 1,
        "coupon_id": null,
        "status": "pending",
        "delivery_method": "pickup",
        "payment_method": "spei",
        "payment_status": "pending",
        "subtotal": "185.00",
        "discount_amount": "0.00",
        "discount_type": null,
        "tax": "29.60",
        "total": "214.60",
        "currency": "MXN",
        "payment_reference": null,
        "payment_proof_url": "https://...",
        "points_earned": 0,
        "points_spent": 0,
        "delivery_address": null,
        "notes": "Orden SPEI desde app",
        "created_at": "2025-10-22T05:17:48.000000Z",
        "updated_at": "2025-10-22T05:17:48.000000Z",
        "items": [
          {
            "id": 1,
            "order_id": 1,
            "product_id": 1,
            "quantity": 2,
            "unit_price": "50.00",
            "subtotal": "100.00",
            "product": {
              "id": 1,
              "name": "Café caliente",
              "price": "50.00",
              "image_url": "https://..."
            }
          }
        ],
        "location": {
          "id": 1,
          "name": "Mienl de sol",
          "address": "Calle 2ª J. Ma. Morelos y Pavon 310",
          "phone": "2381638747"
        },
        "user": {
          "id": 5,
          "name": "Juan Pérez",
          "email": "juan@example.com",
          "phone": "2381234567"
        },
        "coupon": null
      }
    ],
    "first_page_url": "http://...",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://...",
    "next_page_url": null,
    "path": "http://...",
    "per_page": 20,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 2. Listar órdenes pendientes

Obtiene todas las órdenes pendientes de la compañía (ordenadas por fecha ascendente - las más antiguas primero).

**Endpoint:**
```
GET /api/companies/{companyId}/orders/pending
```

**Parámetros de consulta:**
- `location_id` (opcional): Filtrar por sucursal
- `payment_status` (opcional): Filtrar por estado de pago
- `per_page` (opcional): Número de resultados por página (default: 50)

**Ejemplo de petición:**
```bash
GET /api/companies/1/orders/pending?location_id=1
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "custom_user_id": 5,
        "company_id": 1,
        "status": "pending",
        "payment_status": "pending",
        "total": "214.60",
        "created_at": "2025-10-22T05:17:48.000000Z",
        "items": [...],
        "location": {...},
        "user": {...}
      }
    ],
    "total": 5
  },
  "summary": {
    "total_pending": 5,
    "total_amount": "1250.50"
  }
}
```

---

### 3. Ver detalle de una orden

Obtiene los detalles completos de una orden específica.

**Endpoint:**
```
GET /api/companies/{companyId}/orders/{orderId}
```

**Ejemplo de petición:**
```bash
GET /api/companies/1/orders/1
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "custom_user_id": 5,
    "company_id": 1,
    "location_id": 1,
    "status": "pending",
    "delivery_method": "pickup",
    "payment_method": "spei",
    "payment_status": "pending",
    "subtotal": "185.00",
    "tax": "29.60",
    "total": "214.60",
    "payment_proof_url": "https://...",
    "notes": "Orden SPEI desde app",
    "created_at": "2025-10-22T05:17:48.000000Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 2,
        "unit_price": "50.00",
        "subtotal": "100.00",
        "product": {
          "id": 1,
          "name": "Café caliente",
          "description": "Café americano caliente",
          "price": "50.00",
          "image_url": "https://..."
        }
      }
    ],
    "location": {
      "id": 1,
      "name": "Mienl de sol",
      "address": "Calle 2ª J. Ma. Morelos y Pavon 310",
      "phone": "2381638747",
      "email": "veta@gmail.com"
    },
    "user": {
      "id": 5,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "2381234567"
    }
  }
}
```

---

### 4. Actualizar estado de la orden

Actualiza el estado de una orden.

**Endpoint:**
```
PATCH /api/companies/{companyId}/orders/{orderId}/status
```

**Body (JSON):**
```json
{
  "status": "completed"
}
```

**Valores permitidos para `status`:**
- `pending` - Pendiente
- `paid` - Pagada
- `completed` - Completada
- `canceled` - Cancelada
- `failed` - Fallida

**Ejemplo de petición:**
```bash
PATCH /api/companies/1/orders/1/status
Content-Type: application/json

{
  "status": "completed"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estado de orden actualizado",
  "data": {
    "order": {
      "id": 1,
      "status": "completed",
      "items": [...],
      "location": {...},
      "user": {...}
    },
    "old_status": "pending",
    "new_status": "completed"
  }
}
```

**Errores posibles:**
- `422` - Error de validación (estado inválido)
- `404` - Orden no encontrada
- `403` - No autorizado (no es el dueño de la compañía)

---

### 5. Actualizar estado de pago

Actualiza el estado de pago de una orden. Si se marca como pagada, automáticamente actualiza el estado de la orden a "completed" y otorga los puntos ganados al cliente.

**Endpoint:**
```
PATCH /api/companies/{companyId}/orders/{orderId}/payment-status
```

**Body (JSON):**
```json
{
  "payment_status": "paid",
  "payment_reference": "REF123456" // opcional
}
```

**Valores permitidos para `payment_status`:**
- `pending` - Pago pendiente
- `paid` - Pagado
- `failed` - Pago fallido

**Ejemplo de petición:**
```bash
PATCH /api/companies/1/orders/1/payment-status
Content-Type: application/json

{
  "payment_status": "paid",
  "payment_reference": "SPEI-20251022-001"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estado de pago actualizado",
  "data": {
    "order": {
      "id": 1,
      "payment_status": "paid",
      "status": "completed",
      "payment_reference": "SPEI-20251022-001",
      "items": [...],
      "location": {...},
      "user": {...}
    },
    "old_payment_status": "pending",
    "new_payment_status": "paid"
  }
}
```

**Nota importante:** 
- Cuando se marca como `paid`, automáticamente:
  - El estado de la orden cambia a `completed`
  - Se otorgan los puntos ganados al cliente (si aplica)
  - Se actualiza el balance de puntos del cliente en `company_customers`

---

### 6. Estadísticas de órdenes

Obtiene estadísticas generales de las órdenes de la compañía.

**Endpoint:**
```
GET /api/companies/{companyId}/orders/statistics
```

**Ejemplo de petición:**
```bash
GET /api/companies/1/orders/statistics
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total_orders": 150,
    "pending_orders": 5,
    "completed_orders": 130,
    "canceled_orders": 15,
    "total_revenue": "45250.80",
    "pending_payment_amount": "1250.50",
    "orders_by_payment_method": [
      {
        "payment_method": "cash",
        "count": 80,
        "total": "25000.00"
      },
      {
        "payment_method": "spei",
        "count": 50,
        "total": "15250.80"
      },
      {
        "payment_method": "points",
        "count": 20,
        "total": "5000.00"
      }
    ],
    "orders_by_delivery_method": [
      {
        "delivery_method": "pickup",
        "count": 120,
        "total": "38000.00"
      },
      {
        "delivery_method": "delivery",
        "count": 30,
        "total": "7250.80"
      }
    ],
    "today": {
      "orders": 8,
      "revenue": "2150.00"
    },
    "this_week": {
      "orders": 35,
      "revenue": "9800.50"
    },
    "this_month": {
      "orders": 120,
      "revenue": "35000.00"
    }
  }
}
```

---

## Flujo de trabajo recomendado

### Para órdenes con pago SPEI:

1. **Cliente crea la orden** → Estado: `pending`, Pago: `pending`
2. **Compañía revisa el comprobante** → Verifica `payment_proof_url`
3. **Compañía confirma el pago** → PATCH `/payment-status` con `paid`
4. **Sistema automáticamente:**
   - Cambia estado a `completed`
   - Otorga puntos al cliente
   - Actualiza balance en `company_customers`

### Para órdenes con pago en efectivo:

1. **Cliente crea la orden** → Estado: `pending`, Pago: `pending`
2. **Cliente recoge y paga** → Compañía confirma
3. **Compañía marca como pagado** → PATCH `/payment-status` con `paid`

### Para órdenes con puntos:

1. **Cliente crea la orden** → Estado: `pending`, Pago: `paid` (automático)
2. **Compañía prepara la orden** → PATCH `/status` con `completed`

---

## Códigos de respuesta HTTP

- `200` - Operación exitosa
- `201` - Recurso creado
- `401` - No autenticado
- `403` - No autorizado (no es dueño de la compañía)
- `404` - Recurso no encontrado
- `422` - Error de validación

---

## Notas adicionales

- Todas las fechas están en formato ISO 8601 (UTC)
- Los montos están en formato decimal con 2 decimales
- La paginación usa el formato estándar de Laravel
- Las relaciones se cargan automáticamente (items, products, location, user, coupon)
