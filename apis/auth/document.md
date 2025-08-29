# Documentación de la API

Base URL (local): `http://localhost:8000`

## Autenticación con Laravel (Sanctum)

### POST /api/auth/register
- **Descripción**: Crea usuario en MySQL y emite token de Sanctum.
- **Body JSON**:
  - `name` (string, requerido)
  - `email` (string, requerido, único)
  - `phone` (string, opcional)
  - `password` (string, requerido, min:6)
  - `password_confirmation` (string, requerido, debe coincidir)
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "email": "juan2@example.com",
    "phone": "123456789",
    "password": "123456",
    "password_confirmation": "123456"
  }'
```
- **200/201 Respuesta**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": { /* datos del usuario */ },
  "access_token": "SANCTUM_TOKEN",
  "token_type": "Bearer"
}
```

### POST /api/auth/login
- **Descripción**: Login con email/contraseña y emite token de Sanctum.
- **Body JSON**:
  - `email` (string, requerido)
  - `password` (string, requerido)
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan2@example.com","password":"123456"}'
```
- **200 Respuesta**: Igual formato que register (incluye `access_token`).

### POST /api/auth/logout
- **Descripción**: Revoca el token actual de Sanctum.
- **Headers**:
  - `Authorization: Bearer SANCTUM_TOKEN`
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer SANCTUM_TOKEN"
```
- **200 Respuesta**:
```json
{ "status": "success", "message": "Successfully logged out" }
```

### GET /api/auth/user
- **Descripción**: Devuelve el usuario autenticado con Sanctum.
- **Headers**: `Authorization: Bearer SANCTUM_TOKEN`
- **cURL**:
```bash
curl http://localhost:8000/api/auth/user \
  -H "Authorization: Bearer SANCTUM_TOKEN"
```

---

## Autenticación con Firebase
Requisitos en `.env`:
- `FIREBASE_WEB_API_KEY=...` (API Key del proyecto)
- `FIREBASE_CREDENTIALS=/ruta/absoluta/service-account.json`

### POST /api/auth/firebase/register
- **Descripción**: Registra usuario en Firebase (REST) y lo sincroniza en MySQL. Devuelve `id_token` de Firebase.
- **Body JSON**:
  - `name` (string, requerido)
  - `email` (string, requerido)
  - `password` (string, requerido, min:6)
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/firebase/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Juan",
    "email":"juan@example.com",
    "password":"123456"
  }'
```
- **201 Respuesta**:
```json
{
  "success": true,
  "message": "Usuario registrado en Firebase y sincronizado",
  "id_token": "FIREBASE_ID_TOKEN",
  "user": { /* datos del usuario con firebase_uid */ }
}
```

### POST /api/auth/firebase/login
- **Descripción**: Login en Firebase (REST) y asegura que el usuario exista en MySQL. Devuelve `id_token`.
- **Body JSON**:
  - `email` (string, requerido)
  - `password` (string, requerido)
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/firebase/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"123456"}'
```
- **200 Respuesta**:
```json
{
  "success": true,
  "message": "Login Firebase OK",
  "id_token": "FIREBASE_ID_TOKEN",
  "user": { /* datos */ }
}
```

### POST /api/auth/firebase/sync
- **Descripción**: Sincroniza/crea el usuario en MySQL usando el ID token de Firebase. No emite token de Sanctum.
- **Headers**:
  - `Authorization: Bearer FIREBASE_ID_TOKEN`
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/firebase/sync \
  -H "Authorization: Bearer FIREBASE_ID_TOKEN"
```
- **200 Respuesta**:
```json
{ "success": true, "message": "Usuario sincronizado con Firebase", "user": { /* ... */ } }
```

---

## Rutas protegidas por Firebase
Estas rutas requieren `Authorization: Bearer FIREBASE_ID_TOKEN`.

### GET /api/auth/profile
- **Descripción**: Retorna claims básicos del token de Firebase.
- **cURL**:
```bash
curl http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer FIREBASE_ID_TOKEN"
```
- **200 Respuesta**:
```json
{
  "success": true,
  "user": {
    "firebase_uid": "...",
    "firebase_email": "...",
    "firebase_name": "...",
    "message": "¡Acceso autorizado!"
  }
}
```

### GET /api/protected-route
- **Descripción**: Ejemplo protegido; retorna el UID del usuario.
- **cURL**:
```bash
curl http://localhost:8000/api/protected-route \
  -H "Authorization: Bearer FIREBASE_ID_TOKEN"
```

---

## Compañías y Horarios

### POST /api/companies
- **Descripción**: Crea una nueva compañía para el usuario autenticado.
- **Headers**: `Authorization: Bearer FIREBASE_ID_TOKEN`
- **Body JSON**:
  - `name` (string, requerido)
  - `description` (string, opcional)
  - `email` (string, opcional)
  - `phone` (string, opcional)
  - `website` (string, opcional)
  - `business_type` (string, opcional)
  - `address` (string, opcional)
  - `city` (string, opcional)
  - `state` (string, opcional)
  - `country` (string, opcional)
  - `postal_code` (string, opcional)
  - `timezone` (string, opcional)
  - `currency` (string, opcional)
  - `language` (string, opcional)
  - `location` (object, opcional):
    - `name` (string, requerido)
    - `address` (string, requerido)
  - `business_hours` (array, opcional):
    - `day_of_week` (string, requerido)
    - `is_open` (boolean, requerido)
    - `open_time` (string, opcional)
    - `close_time` (string, opcional)
- **cURL**:
```bash
curl -X POST http://localhost:8000/api/companies \
  -H "Authorization: Bearer TU_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Compañía",
    "description": "Descripción",
    "email": "compania@example.com",
    "phone": "555-123",
    "website": "https://miweb.com",
    "business_type": "restaurant",
    "address": "Calle 123",
    "city": "CDMX",
    "state": "CDMX",
    "country": "MX",
    "postal_code": "00000",
    "timezone": "America/Mexico_City",
    "currency": "MXN",
    "language": "es",
    "location": {
      "name": "Sucursal Centro",
      "address": "Av. Centro 456"
    },
    "business_hours": [
      { "day_of_week": "monday", "is_open": true, "open_time": "09:00", "close_time": "18:00" },
      { "day_of_week": "tuesday", "is_open": true, "open_time": "09:00", "close_time": "18:00" }
    ]
  }'
```
- **201 Respuesta**:
```json
{
  "success": true,
  "message": "Company created successfully",
  "company": { /* datos de la compañía */ },
  "location": { /* datos de la ubicación creada */ }
}
```

### PUT /api/companies/{companyId}
- **Descripción**: Actualiza la compañía del usuario autenticado.
- **Headers**: `Authorization: Bearer FIREBASE_ID_TOKEN`
- **Body JSON**:
  - `name` (string, opcional)
  - `description` (string, opcional)
  - `email` (string, opcional)
  - `phone` (string, opcional)
  - `website` (string, opcional)
  - `business_type` (string, opcional)
  - `address` (string, opcional)
  - `city` (string, opcional)
  - `state` (string, opcional)
  - `country` (string, opcional)
  - `postal_code` (string, opcional)
  - `timezone` (string, opcional)
  - `currency` (string, opcional)
  - `language` (string, opcional)
  - `location_id` (string, opcional): ID de la ubicación a actualizar.
  - `location` (object, opcional):
    - `name` (string, opcional)
    - `address` (string, opcional)
  - `business_hours` (array, opcional):
    - `day_of_week` (string, requerido)
    - `is_open` (boolean, requerido)
    - `open_time` (string, opcional)
    - `close_time` (string, opcional)
- **cURL**:
```bash
curl -X PUT http://localhost:8000/api/companies/COMPANY_ID \
  -H "Authorization: Bearer TU_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Compañía Actualizada",
    "location_id": "LOCATION_ID",
    "location": {
      "name": "Sucursal Centro Actualizada",
      "address": "Nueva dirección 789"
    },
    "business_hours": [
      { "day_of_week": "saturday", "is_open": true, "open_time": "10:00", "close_time": "16:00" },
      { "day_of_week": "sunday", "is_open": false }
    ]
  }'
```
- **200 Respuesta**:
```json
{
  "success": true,
  "message": "Company updated successfully",
  "company": { /* datos de la compañía actualizada */ }
}
```

### PUT /api/locations/{locationId}/business-hours
- **Descripción**: Upsert de horarios para una sucursal.
- **Headers**: `Authorization: Bearer FIREBASE_ID_TOKEN`
- **Body JSON**:
  - `hours` (array, requerido):
    - `day_of_week` (string, requerido)
    - `is_open` (boolean, requerido)
    - `open_time` (string, opcional)
    - `close_time` (string, opcional)
- **cURL**:
```bash
curl -X PUT http://localhost:8000/api/locations/LOCATION_ID/business-hours \
  -H "Authorization: Bearer TU_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hours": [
      { "day_of_week": "monday", "is_open": true, "open_time": "09:00", "close_time": "18:00" },
      { "day_of_week": "tuesday", "is_open": false }
    ]
  }'
```
- **200 Respuesta**:
```json
{
  "success": true,
  "message": "Business hours updated"
}
```

---

## Utilidades (no API prefix)

### GET /generate-pass
- **Descripción**: Genera un Apple Wallet pass de ejemplo.
- **cURL**:
```bash
curl -I http://localhost:8000/generate-pass
```

### GET /test-firebase
- **Descripción**: Prueba de conexión con Firebase Realtime Database.
- **cURL**:
```bash
curl http://localhost:8000/test-firebase
```

---

## Errores comunes
- `401 Unauthorized` (Firebase): Falta o es inválido `Authorization: Bearer FIREBASE_ID_TOKEN`.
- `422 Validation error`: Campos inválidos (mira `errors` en la respuesta).
- `500 Firebase no está configurado correctamente`: Verifica `FIREBASE_CREDENTIALS`/Service Account y permisos.

## Notas
- Para endpoints protegidos con Sanctum usa `Authorization: Bearer SANCTUM_TOKEN`.
- Para endpoints protegidos con Firebase usa `Authorization: Bearer FIREBASE_ID_TOKEN`. El frontend guarda este token como `id_token` y lo envía automáticamente en cada petición.


# Documentación de la API de Planes de Membresía

Basado en el controlador `MembershipPlanController.php`, aquí está la documentación para que un dueño de compañía gestione los planes de membresía:

## 1. Crear un Plan de Membresía

**Endpoint:** `POST /api/companies/{companyId}/membership-plans`

**Descripción:** Permite al dueño de una compañía crear un nuevo plan de membresía.

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Cuerpo de la Petición (JSON)

```json
{
    "name": "Plan Premium",
    "price": 199.99,
    "duration": 30,
    "billing_period": "monthly",
    "discount_percentage": 15.5,
    "discount_all_items": true,
    "is_active": true,
    "has_birthday_perk": true,
    "has_events_perk": true,
    "has_free_drinks": true,
    "has_priority": true
}
```

### Campos Requeridos

- `name`: Nombre del plan (string, max 255 caracteres)
- `price`: Precio del plan (número, mínimo 0)
- `duration`: Duración en días (entero, mínimo 1)
- `billing_period`: Período de facturación (monthly/yearly)

### Campos Opcionales

- `discount_percentage`: Porcentaje de descuento (0-100)
- `discount_all_items`: Si aplica a todos los ítems (booleano)
- `is_active`: Si el plan está activo (booleano)
- `has_birthday_perk`: Beneficio de cumpleaños (booleano)
- `has_events_perk`: Beneficio de eventos (booleano)
- `has_free_drinks`: Bebidas gratis (booleano)
- `has_priority`: Prioridad (booleano)

### Respuesta Exitosa (201 Created)

```json
{
    "success": true,
    "message": "Plan de membresía creado exitosamente",
    "data": {
        "id": "plan-uuid-here",
        "company_id": "company-uuid-here",
        "name": "Plan Premium",
        "price": "199.99",
        "duration": 30,
        "billing_period": "monthly",
        "discount_percentage": "15.50",
        "discount_all_items": true,
        "is_active": true,
        "has_birthday_perk": true,
        "has_events_perk": true,
        "has_free_drinks": true,
        "has_priority": true,
        "subscribers_count": 0,
        "created_at": "2025-08-17T00:00:00.000000Z",
        "updated_at": "2025-08-17T00:00:00.000000Z"
    }
}
```

### Códigos de Error

- **401**: No autenticado o token inválido
- **403**: No tienes permiso para crear planes en esta compañía
- **422**: Error de validación en los datos enviados
- **500**: Error del servidor

---

## 2. Listar Planes de una Compañía

**Endpoint:** `GET /api/companies/{companyId}/membership-plans`

**Descripción:** Obtiene todos los planes de membresía de una compañía, ordenados por precio ascendente.

### Headers

```
Authorization: Bearer {token}
Accept: application/json
```

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "data": [
        {
            "id": "plan-uuid-1",
            "company_id": "company-uuid-here",
            "name": "Plan Básico",
            "price": "99.99",
            "duration": 30,
            "billing_period": "monthly",
            "discount_percentage": "10.00",
            "discount_all_items": false,
            "is_active": true,
            "has_birthday_perk": true,
            "has_events_perk": false,
            "has_free_drinks": false,
            "has_priority": false,
            "subscribers_count": 15,
            "created_at": "2025-08-01T00:00:00.000000Z",
            "updated_at": "2025-08-15T00:00:00.000000Z"
        },
        {
            "id": "plan-uuid-2",
            "company_id": "company-uuid-here",
            "name": "Plan Premium",
            "price": "199.99",
            "duration": 30,
            "billing_period": "monthly",
            "discount_percentage": "15.50",
            "discount_all_items": true,
            "is_active": true,
            "has_birthday_perk": true,
            "has_events_perk": true,
            "has_free_drinks": true,
            "has_priority": true,
            "subscribers_count": 8,
            "created_at": "2025-08-10T00:00:00.000000Z",
            "updated_at": "2025-08-16T00:00:00.000000Z"
        }
    ]
}
```

---

## 3. Obtener un Plan Específico

**Endpoint:** `GET /api/companies/{companyId}/membership-plans/{planId}`

**Descripción:** Obtiene los detalles de un plan de membresía específico.

### Headers

```
Authorization: Bearer {token}
Accept: application/json
```

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "data": {
        "id": "plan-uuid-here",
        "company_id": "company-uuid-here",
        "name": "Plan Premium",
        "price": "199.99",
        "duration": 30,
        "billing_period": "monthly",
        "discount_percentage": "15.50",
        "discount_all_items": true,
        "is_active": true,
        "has_birthday_perk": true,
        "has_events_perk": true,
        "has_free_drinks": true,
        "has_priority": true,
        "subscribers_count": 8,
        "created_at": "2025-08-10T00:00:00.000000Z",
        "updated_at": "2025-08-16T00:00:00.000000Z"
    }
}
```

### Códigos de Error

- **404**: Plan no encontrado
- **401**: No autenticado o token inválido

---

## 4. Actualizar un Plan

**Endpoint:** `PUT /api/companies/{companyId}/membership-plans/{planId}`

**Descripción:** Actualiza los datos de un plan de membresía existente.

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Cuerpo de la Petición (JSON)

```json
{
    "name": "Plan Premium Plus",
    "price": 249.99,
    "has_events_perk": true
}
```

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "message": "Plan de membresía actualizado exitosamente",
    "data": {
        "id": "plan-uuid-here",
        "company_id": "company-uuid-here",
        "name": "Plan Premium Plus",
        "price": "249.99",
        "duration": 30,
        "billing_period": "monthly",
        "discount_percentage": "15.50",
        "discount_all_items": true,
        "is_active": true,
        "has_birthday_perk": true,
        "has_events_perk": true,
        "has_free_drinks": true,
        "has_priority": true,
        "subscribers_count": 8,
        "created_at": "2025-08-10T00:00:00.000000Z",
        "updated_at": "2025-08-17T00:10:00.000000Z"
    }
}
```

### Códigos de Error

- **403**: No tienes permiso para modificar este plan
- **404**: Plan no encontrado
- **422**: Error de validación en los datos enviados
- **401**: No autenticado o token inválido

---

## 5. Eliminar un Plan

**Endpoint:** `DELETE /api/companies/{companyId}/membership-plans/{planId}`

**Descripción:** Elimina un plan de membresía.

### Headers

```
Authorization: Bearer {token}
Accept: application/json
```

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "message": "Plan de membresía eliminado exitosamente"
}
```

### Códigos de Error

- **403**: No tienes permiso para eliminar este plan
- **404**: Plan no encontrado
- **401**: No autenticado o token inválido

---

## Notas Importantes

- **Autenticación**: Todos los endpoints requieren autenticación mediante token de Firebase.
- **Permisos**: Solo el dueño de la compañía puede crear, actualizar o eliminar planes.
- **UUIDs**: Los IDs de compañía y planes son UUIDs.
- **Precios**: Los precios se manejan con 2 decimales.
- **Duración**: La duración siempre está en días.