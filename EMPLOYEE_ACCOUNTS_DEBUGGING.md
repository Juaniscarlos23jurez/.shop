# Guía de Depuración - Sistema de Cuentas de Empleado

## 🐛 Error: "Rol no autorizado para acceder a recursos de compañía"

### Causa del Error
Este error ocurre cuando el usuario autenticado **no tiene el campo `role` definido** o no cumple con los requisitos del middleware `CheckCompanyAccess`.

---

## ✅ Solución Aplicada

### 1. Middleware Actualizado
El middleware `CheckCompanyAccess` ahora:
- ✅ Verifica primero si el usuario tiene `company_id`
- ✅ Si tiene `company_id`, solo verifica que coincida con el solicitado
- ✅ No requiere que el usuario tenga un `role` definido
- ✅ Compatible con usuarios legacy que no tienen rol

### 2. Rutas Actualizadas
Las rutas de employee-accounts ahora:
- ✅ Solo usan middleware `company.access` (no `role:admin`)
- ✅ Permiten acceso a cualquier usuario con `company_id` válido

---

## 📋 Verificar Estado del Usuario

### Opción 1: Desde Laravel Tinker
```bash
php artisan tinker
```

```php
// Ver datos del usuario
$user = User::find(YOUR_USER_ID);
dd([
    'id' => $user->id,
    'email' => $user->email,
    'role' => $user->role,
    'company_id' => $user->company_id,
]);
```

### Opción 2: Consulta SQL Directa
```sql
SELECT id, email, role, company_id, is_active 
FROM users 
WHERE id = YOUR_USER_ID;
```

---

## 🔍 Ver Logs de Depuración

Los logs ahora incluyen información detallada:

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Buscar logs específicos
grep "CheckCompanyAccess" storage/logs/laravel.log
grep "EmployeeAccountController" storage/logs/laravel.log
```

**Información en los logs:**
- `user_id` - ID del usuario autenticado
- `user_email` - Email del usuario
- `user_role` - Rol del usuario (o "sin rol")
- `user_company_id` - Company ID del usuario
- `requested_company_id` - Company ID solicitado en la URL
- `route` - Ruta que se está intentando acceder

---

## 🔧 Asignar Rol a Usuario Existente

Si tu usuario no tiene rol asignado, puedes agregarlo:

### Opción 1: Desde Tinker
```bash
php artisan tinker
```

```php
$user = User::find(YOUR_USER_ID);
$user->role = 'admin'; // o null para usuarios sin rol específico
$user->save();

// Verificar
dd($user->role);
```

### Opción 2: SQL Directo
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = YOUR_USER_ID;
```

### Opción 3: Dejar sin rol (compatible)
El sistema ahora funciona sin rol si el usuario tiene `company_id`:
```php
$user = User::find(YOUR_USER_ID);
$user->role = null; // Sin rol específico
$user->company_id = 1; // Debe tener company_id
$user->save();
```

---

## 🧪 Probar el Endpoint

### Con cURL
```bash
curl -X POST \
  https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/companies/1/employee-accounts/employees/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@empresa.com",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!",
    "role_type": "sales",
    "location_id": 6,
    "name": "Test User"
  }' \
  -v
```

### Verificar Respuesta
Si funciona correctamente, deberías ver:
```json
{
  "status": "success",
  "message": "Cuenta de empleado creada exitosamente",
  "data": { ... }
}
```

Si hay error, verás:
```json
{
  "status": "error",
  "message": "...",
  "debug": {
    "user_company_id": 1,
    "requested_company_id": 1,
    "user_role": "sin rol"
  }
}
```

---

## 📊 Verificar Estructura de Base de Datos

### Verificar que la columna `role` existe
```sql
DESCRIBE users;
```

Deberías ver:
```
+-------------+---------------------+------+-----+---------+
| Field       | Type                | Null | Key | Default |
+-------------+---------------------+------+-----+---------+
| id          | bigint unsigned     | NO   | PRI | NULL    |
| name        | varchar(255)        | NO   |     | NULL    |
| email       | varchar(255)        | NO   | UNI | NULL    |
| role        | varchar(50)         | YES  |     | user    |
| company_id  | bigint unsigned     | YES  | MUL | NULL    |
| employee_id | bigint unsigned     | YES  | MUL | NULL    |
| location_id | bigint unsigned     | YES  | MUL | NULL    |
+-------------+---------------------+------+-----+---------+
```

### Si no existe la columna `role`
```bash
php artisan migrate
```

---

## 🔄 Flujo de Depuración Completo

### 1. Verificar Usuario
```php
$user = User::find(YOUR_USER_ID);
echo "Email: " . $user->email . "\n";
echo "Role: " . ($user->role ?? 'sin rol') . "\n";
echo "Company ID: " . $user->company_id . "\n";
```

### 2. Verificar Empleado
```php
$employee = Employee::find(EMPLOYEE_ID);
echo "Nombre: " . $employee->full_name . "\n";
echo "Company ID: " . $employee->company_id . "\n";
echo "Ya tiene cuenta: " . (User::where('employee_id', $employee->id)->exists() ? 'Sí' : 'No') . "\n";
```

### 3. Verificar Ubicación
```php
$location = Location::find(LOCATION_ID);
echo "Nombre: " . $location->name . "\n";
echo "Company ID: " . $location->company_id . "\n";
```

### 4. Intentar Crear Cuenta
```php
// Desde tinker
$user = User::create([
    'name' => 'Test Employee',
    'email' => 'test@empresa.com',
    'password' => Hash::make('SecurePass123!'),
    'company_id' => 1,
    'employee_id' => 1,
    'location_id' => 6,
    'role' => 'employee_sales',
    'is_active' => true,
]);

echo "Cuenta creada con ID: " . $user->id;
```

---

## ⚠️ Errores Comunes

### Error 1: "Este empleado ya tiene una cuenta de acceso"
**Solución:** El empleado ya tiene una cuenta. Verificar:
```php
$existingAccount = User::where('employee_id', EMPLOYEE_ID)->first();
if ($existingAccount) {
    echo "Ya existe cuenta con email: " . $existingAccount->email;
}
```

### Error 2: "No tienes acceso a esta compañía"
**Solución:** El `company_id` del usuario no coincide:
```php
$user = User::find(YOUR_USER_ID);
$user->company_id = 1; // Asignar company_id correcto
$user->save();
```

### Error 3: "La ubicación especificada no pertenece a esta compañía"
**Solución:** Verificar que la ubicación pertenezca a la compañía:
```sql
SELECT id, name, company_id 
FROM locations 
WHERE id = LOCATION_ID;
```

---

## 📝 Checklist de Verificación

- [ ] Usuario tiene `company_id` asignado
- [ ] `company_id` del usuario coincide con el de la URL
- [ ] Empleado existe y pertenece a la compañía
- [ ] Empleado no tiene ya una cuenta creada
- [ ] Ubicación (si se especifica) pertenece a la compañía
- [ ] Migración ejecutada (`role`, `employee_id`, `location_id` existen en tabla `users`)
- [ ] Middleware registrado en `bootstrap/app.php`

---

## 🎯 Resultado Esperado

Después de aplicar los cambios:

1. ✅ El middleware ya no requiere `role` definido
2. ✅ Solo verifica que `company_id` coincida
3. ✅ Los logs muestran información detallada
4. ✅ El sistema funciona con usuarios legacy (sin rol)
5. ✅ El sistema funciona con usuarios nuevos (con rol)

---

## 📞 Si el Problema Persiste

1. **Verificar logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verificar usuario en base de datos:**
   ```sql
   SELECT * FROM users WHERE id = YOUR_USER_ID;
   ```

3. **Limpiar caché:**
   ```bash
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```

4. **Reiniciar servidor:**
   ```bash
   php artisan serve
   ```
