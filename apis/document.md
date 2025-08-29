
# API de Compañías y Horarios de Negocio

## Creación de Compañía

Crea una nueva compañía en el sistema.

- **Endpoint:** `POST /api/companies`
- **Autenticación:** Requiere autenticación Firebase (Admin)
- **Controlador:** `CompanyController@store`

### Cuerpo de la Solicitud

```json
{
    "name": "Mi Empresa S.A. de C.V.",
    "description": "Descripción de la empresa",
    "email": "contacto@miempresa.com",
    "phone": "+521234567890",
    "website": "https://miempresa.com",
    "logo_url": "https://miempresa.com/logo.png",
    "business_type": "Restaurante",
    "address": "Calle Principal #123",
    "city": "Ciudad de México",
    "state": "CDMX",
    "country": "México",
    "postal_code": "12345",
    "timezone": "America/Mexico_City",
    "currency": "MXN",
    "language": "es",
    "location": {
        "name": "Sucursal Principal",
        "address": "Calle Principal #123",
        "phone": "+521234567890",
        "email": "sucursal@miempresa.com",
        "contact_person": "Juan Pérez",
        "primary_color": "#4F46E5",
        "secondary_color": "#10B981",
        "timezone": "America/Mexico_City",
        "city": "Ciudad de México",
        "state": "CDMX",
        "country": "México",
        "postal_code": "12345",
        "notes": "Cerca del metro"
    }
}
```

### Respuesta Exitosa (201 Created)

```json
{
    "success": true,
    "message": "Company created successfully",
    "company": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Mi Empresa S.A. de C.V.",
        "slug": "mi-empresa-sa-de-cv",
        "description": "Descripción de la empresa",
        "email": "contacto@miempresa.com",
        "phone": "+521234567890",
        "website": "https://miempresa.com",
        "logo_url": "https://miempresa.com/logo.png",
        "business_type": "Restaurante",
        "address": "Calle Principal #123",
        "city": "Ciudad de México",
        "state": "CDMX",
        "country": "México",
        "postal_code": "12345",
        "timezone": "America/Mexico_City",
        "currency": "MXN",
        "language": "es",
        "is_active": true,
        "created_at": "2025-08-28T23:15:00.000000Z",
        "updated_at": "2025-08-28T23:15:00.000000Z"
    },
    "location": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "company_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Sucursal Principal",
        "slug": "sucursal-principal",
        "address": "Calle Principal #123",
        "phone": "+521234567890",
        "email": "sucursal@miempresa.com",
        "contact_person": "Juan Pérez",
        "primary_color": "#4F46E5",
        "secondary_color": "#10B981",
        "timezone": "America/Mexico_City",
        "city": "Ciudad de México",
        "state": "CDMX",
        "country": "México",
        "postal_code": "12345",
        "notes": "Cerca del metro",
        "created_at": "2025-08-28T23:15:00.000000Z",
        "updated_at": "2025-08-28T23:15:00.000000Z"
    }
}
```

## Horarios de Negocio

### Obtener Horarios de una Compañía

Obtiene los horarios de negocio para una compañía específica.

- **Endpoint:** `GET /api/companies/{companyId}/business-hours`
- **Autenticación:** Pública (No requiere autenticación)
- **Controlador:** `BusinessHourController@indexByCompany`

#### Respuesta Exitosa (200 OK)
```json
{
    "success": true,
    "company_id": "company-uuid-here",
    "hours": [
        {
            "day_of_week": "monday",
            "day_name": "Lunes",
            "is_open": true,
            "open_time": "09:00",
            "close_time": "18:00",
            "range": "09:00 - 18:00"
        },
        // ... other days of the week
    ]
}
```

### Update Business Hours for a Company

Updates or creates business hours for a company. This endpoint requires admin authentication.

- **Endpoint:** `PUT /api/companies/{companyId}/business-hours`
- **Authentication:** `firebase.auth` (Admin required)
- **Controller:** `BusinessHourController@upsertByCompany`

#### Request Body
```json
{
    "hours": [
        {
            "day_of_week": "monday",
            "is_open": true,
            "open_time": "09:00",
            "close_time": "18:00"
        },
        {
            "day_of_week": "tuesday",
            "is_open": true,
            "open_time": "09:00",
            "close_time": "18:00"
        },
        // ... other days of the week
    ]
}
```

#### Field Descriptions
- `day_of_week`: (required) One of: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
- `is_open`: (required) Boolean indicating if the business is open on this day
- `open_time`: (required if `is_open` is true) Opening time in 24-hour format (HH:MM)
- `close_time`: (required if `is_open` is true) Closing time in 24-hour format (HH:MM)

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Company business hours updated successfully"
}
```

#### Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Server error during update

## Notes
- All times are in 24-hour format (HH:MM)
- The API will automatically create or update records as needed
- When `is_open` is `false`, the `open_time` and `close_time` fields are ignored
- The API returns business hours for all days of the week, even if some days are not explicitly set (they'll have default values)

# API de Ubicaciones (Locations)

## Crear una Nueva Ubicación

Crea una nueva ubicación para una compañía existente.

- **Endpoint:** `POST /api/companies/{companyId}/locations`
- **Autenticación:** Requiere autenticación Firebase (Admin)
- **Controlador:** `LocationController@store`

### Cuerpo de la Solicitud

```json
{
    "name": "Sucursal Principal",
    "address": "Av. Principal #123",
    "phone": "+521234567890",
    "email": "sucursal@ejemplo.com",
    "contact_person": "Juan Pérez",
    "primary_color": "#4F46E5",
    "secondary_color": "#10B981",
    "timezone": "America/Mexico_City",
    "city": "Ciudad de México",
    "state": "CDMX",
    "country": "México",
    "postal_code": "12345",
    "notes": "Cerca del metro"
}
```

### Parámetros Requeridos

| Parámetro     | Tipo   | Descripción                               |
|---------------|--------|-------------------------------------------|
| `name`        | string | Nombre de la ubicación (máx. 255 caracteres) |
| `address`     | string | Dirección completa de la ubicación         |
| `phone`       | string | Número de teléfono (opcional)              |
| `email`       | string | Correo electrónico (opcional)              |
| `contact_person` | string | Nombre de la persona de contacto (opcional) |
| `primary_color`  | string | Código de color primario en formato HEX (opcional) |
| `secondary_color`| string | Código de color secundario en formato HEX (opcional) |
| `timezone`    | string | Zona horaria (ej. "America/Mexico_City") (opcional) |
| `city`        | string | Ciudad (opcional)                         |
| `state`       | string | Estado (opcional)                         |
| `country`     | string | País (opcional)                           |
| `postal_code` | string | Código postal (opcional)                  |
| `notes`       | string | Notas adicionales (opcional)              |

### Respuesta Exitosa (201 Created)

```json
{
    "success": true,
    "message": "Location created successfully",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "company_id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Sucursal Principal",
        "slug": "sucursal-principal",
        "address": "Av. Principal #123",
        "phone": "+521234567890",
        "email": "sucursal@ejemplo.com",
        "contact_person": "Juan Pérez",
        "primary_color": "#4F46E5",
        "secondary_color": "#10B981",
        "timezone": "America/Mexico_City",
        "city": "Ciudad de México",
        "state": "CDMX",
        "country": "México",
        "postal_code": "12345",
        "notes": "Cerca del metro",
        "created_at": "2025-08-28T23:15:00.000000Z",
        "updated_at": "2025-08-28T23:15:00.000000Z"
    }
}
```

### Posibles Errores

- **400 Bad Request**: Datos de entrada inválidos o faltantes
- **401 Unauthorized**: Se requiere autenticación
- **403 Forbidden**: No tienes permiso para crear ubicaciones en esta compañía
- **404 Not Found**: La compañía especificada no existe
- **500 Internal Server Error**: Error en el servidor al crear la ubicación

## Obtener Ubicaciones de una Compañía

Obtiene todas las ubicaciones de una compañía específica.

- **Endpoint:** `GET /api/companies/{companyId}/locations`
- **Autenticación:** Pública
- **Controlador:** `LocationController@indexByCompany`

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "company_id": "550e8400-e29b-41d4-a716-446655440001",
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Sucursal Principal",
            "slug": "sucursal-principal",
            "address": "Av. Principal #123",
            "city": "Ciudad de México",
            "state": "CDMX",
            "country": "México"
        },
        // ... más ubicaciones
    ]
}
```

## Obtener Detalles de una Ubicación

Obtiene los detalles completos de una ubicación específica.

- **Endpoint:** `GET /api/locations/{locationId}`
- **Autenticación:** Pública
- **Controlador:** `LocationController@show`

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "company_id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Sucursal Principal",
        "slug": "sucursal-principal",
        "address": "Av. Principal #123",
        "phone": "+521234567890",
        "email": "sucursal@ejemplo.com",
        "contact_person": "Juan Pérez",
        "primary_color": "#4F46E5",
        "secondary_color": "#10B981",
        "timezone": "America/Mexico_City",
        "city": "Ciudad de México",
        "state": "CDMX",
        "country": "México",
        "postal_code": "12345",
        "notes": "Cerca del metro",
        "created_at": "2025-08-28T23:15:00.000000Z",
        "updated_at": "2025-08-28T23:15:00.000000Z"
    }
}
```

## Actualizar una Ubicación

Actualiza los datos de una ubicación existente.

- **Endpoint:** `PUT /api/locations/{locationId}`
- **Autenticación:** Requiere autenticación Firebase (Admin)
- **Controlador:** `LocationController@update`

### Cuerpo de la Solicitud (Ejemplo)

```json
{
    "name": "Sucursal Principal Actualizada",
    "address": "Av. Principal #123, Col. Centro",
    "phone": "+521234567891"
}
```

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "message": "Location updated successfully",
    "data": {
        // Datos actualizados de la ubicación
    }
}
```

## Eliminar una Ubicación

Elimina una ubicación existente.

- **Endpoint:** `DELETE /api/locations/{locationId}`
- **Autenticación:** Requiere autenticación Firebase (Admin)
- **Controlador:** `LocationController@destroy`

### Respuesta Exitosa (200 OK)

```json
{
    "success": true,
    "message": "Location deleted"
}
```

## Notas Adicionales

- Todas las fechas y horas se devuelven en formato ISO 8601 (UTC)
- Los colores deben estar en formato HEX (ej. "#4F46E5")
- La zona horaria debe ser una zona horaria válida de la base de datos de zonas horarias de PHP
- El slug se genera automáticamente a partir del nombre de la ubicación
