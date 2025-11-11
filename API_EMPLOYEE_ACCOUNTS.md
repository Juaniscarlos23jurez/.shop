# API de Gestión de Cuentas de Empleado

## Descripción General

Este sistema permite al **administrador de una compañía** crear cuentas de acceso para sus empleados, asignándoles roles específicos (ventas, cajero, supervisor, gerente) con permisos limitados según su función.

## Flujo de Trabajo

1. **Admin crea la compañía y sucursales** (locations)
2. **Admin crea empleados** en el sistema
3. **Admin crea cuentas de acceso** para los empleados que necesiten usar la aplicación
4. **Empleados inician sesión** con sus credenciales y acceden solo a las funciones permitidas por su rol

---

## Roles Disponibles

### 1. `employee_sales` (Ventas)
**Descripción:** Personal de ventas con acceso limitado

**Permisos:**
- ✅ Ver productos
- ✅ Crear ventas
- ✅ Ver sus propias ventas
- ✅ Ver clientes
- ✅ Aplicar cupones

**Uso típico:** Vendedores en piso de venta

---

### 2. `employee_cashier` (Cajero)
**Descripción:** Personal de caja con acceso a ventas y pagos

**Permisos:**
- ✅ Ver productos
- ✅ Crear ventas
- ✅ Ver todas las ventas de la ubicación
- ✅ Procesar pagos
- ✅ Ver clientes
- ✅ Aplicar cupones

**Uso típico:** Cajeros en punto de venta

---

### 3. `employee_supervisor` (Supervisor)
**Descripción:** Supervisor con acceso a reportes y gestión

**Permisos:**
- ✅ Ver productos
- ✅ Crear ventas
- ✅ Ver todas las ventas
- ✅ Ver reportes
- ✅ Gestionar empleados de la ubicación
- ✅ Ver clientes
- ✅ Gestionar cupones

**Uso típico:** Supervisores de turno

---

### 4. `employee_manager` (Gerente)
**Descripción:** Gerente con acceso completo a la ubicación

**Permisos:**
- ✅ Ver productos
- ✅ Gestionar productos
- ✅ Crear ventas
- ✅ Ver todas las ventas
- ✅ Gestionar ventas
- ✅ Ver reportes
- ✅ Gestionar empleados
- ✅ Ver clientes
- ✅ Gestionar clientes
- ✅ Gestionar cupones
- ✅ Gestionar configuración de ubicación

**Uso típico:** Gerentes de sucursal

---

## Endpoints de la API

**Base URL:** `/api`

**Autenticación:** Todos los endpoints requieren autenticación con `Bearer Token` (Sanctum)

**Middleware aplicado:**
- `auth:sanctum` - Autenticación requerida
- `company.access` - Verifica acceso a la compañía
- `role:admin` - Solo administradores pueden gestionar cuentas

---

### 1. Listar Cuentas de Empleado

**Endpoint:** `GET /api/companies/{companyId}/employee-accounts`

**Descripción:** Obtiene todas las cuentas de empleado de una compañía (paginado)

**Respuesta Exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan.perez@empresa.com",
      "role": "employee_sales",
      "role_type": "sales",
      "role_display": "Ventas",
      "is_active": true,
      "company_id": 1,
      "employee_id": 5,
      "location_id": 2
    }
  ]
}
```

---

### 2. Crear Cuenta de Empleado

**Endpoint:** `POST /api/companies/{companyId}/employee-accounts/employees/{employeeId}`

**Body (JSON):**
```json
{
  "email": "juan.perez@empresa.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "role_type": "sales",
  "location_id": 2,
  "name": "Juan Pérez"
}
```

**Campos:**
- `email` (string, requerido) - Email único
- `password` (string, requerido) - Contraseña (mínimo 8 caracteres)
- `password_confirmation` (string, requerido) - Confirmación
- `role_type` (string, requerido) - `sales`, `manager`, `cashier`, `supervisor`
- `location_id` (integer, opcional) - ID de ubicación
- `name` (string, opcional) - Nombre para la cuenta

---

### 3. Ver Detalles de Cuenta

**Endpoint:** `GET /api/companies/{companyId}/employee-accounts/{userId}`

---

### 4. Actualizar Cuenta

**Endpoint:** `PUT /api/companies/{companyId}/employee-accounts/{userId}`

**Body (JSON):**
```json
{
  "email": "nuevo.email@empresa.com",
  "role_type": "manager",
  "location_id": 3,
  "is_active": true
}
```

---

### 5. Desactivar Cuenta

**Endpoint:** `DELETE /api/companies/{companyId}/employee-accounts/{userId}`

---

### 6. Reactivar Cuenta

**Endpoint:** `POST /api/companies/{companyId}/employee-accounts/{userId}/activate`

---

### 7. Cambiar Contraseña

**Endpoint:** `POST /api/companies/{companyId}/employee-accounts/{userId}/change-password`

**Body (JSON):**
```json
{
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

---

### 8. Obtener Roles y Permisos

**Endpoint:** `GET /api/employee-roles/permissions`

---

## Ejemplos de Uso (JavaScript)

### Listar Cuentas
```javascript
const response = await fetch(
  `${API_BASE_URL}/api/companies/${companyId}/employee-accounts`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  }
);
const data = await response.json();
```

### Crear Cuenta
```javascript
const response = await fetch(
  `${API_BASE_URL}/api/companies/${companyId}/employee-accounts/employees/${employeeId}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'juan@empresa.com',
      password: 'SecurePass123!',
      password_confirmation: 'SecurePass123!',
      role_type: 'sales',
      location_id: 2,
    }),
  }
);
```

---

## Flujo Completo

1. **Crear empleado** usando el endpoint de empleados
2. **Crear cuenta de acceso** para ese empleado
3. **Empleado inicia sesión** con sus credenciales
4. **Sistema valida rol** y muestra solo funciones permitidas

