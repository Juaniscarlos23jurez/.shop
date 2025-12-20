# Solución: Backend no guarda coordenadas (latitude/longitude)

## Problema
El frontend envía correctamente `latitude` y `longitude` al backend, pero Laravel no las está guardando en la base de datos.

**Request enviado desde frontend:**
```json
{
  "latitude": 33.7173029,
  "longitude": -84.4325554,
  "name": "empresa de prueba",
  "address": "Lorenzo Drive Southwest 1382"
}
```

**Response del backend:**
```json
{
  "latitude": null,
  "longitude": null
}
```

## Solución en Laravel

### 1. Verificar migración de la tabla `companies`

Asegúrate de que la tabla tenga las columnas `latitude` y `longitude`:

```php
// database/migrations/xxxx_xx_xx_create_companies_table.php
Schema::create('companies', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('email')->nullable();
    $table->string('phone')->nullable();
    $table->string('address')->nullable();
    $table->string('city')->nullable();
    $table->string('state')->nullable();
    $table->string('country')->nullable();
    $table->string('postal_code')->nullable();
    
    // AGREGAR ESTAS LÍNEAS:
    $table->decimal('latitude', 10, 7)->nullable();
    $table->decimal('longitude', 10, 7)->nullable();
    
    $table->timestamps();
});
```

Si ya existe la tabla, crea una nueva migración:

```bash
php artisan make:migration add_coordinates_to_companies_table
```

```php
// database/migrations/xxxx_xx_xx_add_coordinates_to_companies_table.php
public function up()
{
    Schema::table('companies', function (Blueprint $table) {
        $table->decimal('latitude', 10, 7)->nullable()->after('postal_code');
        $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
    });
}

public function down()
{
    Schema::table('companies', function (Blueprint $table) {
        $table->dropColumn(['latitude', 'longitude']);
    });
}
```

Ejecuta la migración:
```bash
php artisan migrate
```

### 2. Actualizar el modelo `Company`

Agrega `latitude` y `longitude` al array `$fillable`:

```php
// app/Models/Company.php
class Company extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'status',
        'email',
        'phone',
        'website',
        'logo_url',
        'banner_url',
        'business_type_id',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',        // ← AGREGAR
        'longitude',       // ← AGREGAR
        'timezone',
        'currency',
        'language',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:7',   // ← AGREGAR
        'longitude' => 'decimal:7',  // ← AGREGAR
    ];
}
```

### 3. Verificar el controlador

Asegúrate de que el controlador esté guardando estos campos:

```php
// app/Http/Controllers/CompanyController.php
public function update(Request $request, $id)
{
    $company = Company::findOrFail($id);
    
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'description' => 'nullable|string',
        'email' => 'sometimes|email',
        'phone' => 'nullable|string',
        'address' => 'nullable|string',
        'city' => 'nullable|string',
        'state' => 'nullable|string',
        'country' => 'nullable|string',
        'postal_code' => 'nullable|string',
        'latitude' => 'nullable|numeric|between:-90,90',      // ← AGREGAR
        'longitude' => 'nullable|numeric|between:-180,180',   // ← AGREGAR
        // ... otros campos
    ]);
    
    $company->update($validated);
    
    return response()->json([
        'status' => 'success',
        'message' => 'Company updated successfully',
        'company' => $company->fresh(),
    ]);
}
```

### 4. Hacer lo mismo para la tabla `locations` (sucursales)

```bash
php artisan make:migration add_coordinates_to_locations_table
```

```php
public function up()
{
    Schema::table('locations', function (Blueprint $table) {
        $table->decimal('latitude', 10, 7)->nullable()->after('postal_code');
        $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
    });
}
```

Y actualizar el modelo `Location`:

```php
// app/Models/Location.php
protected $fillable = [
    'company_id',
    'name',
    'slug',
    'address',
    'phone',
    'email',
    'city',
    'state',
    'country',
    'postal_code',
    'latitude',        // ← AGREGAR
    'longitude',       // ← AGREGAR
    // ... otros campos
];

protected $casts = [
    'latitude' => 'decimal:7',
    'longitude' => 'decimal:7',
];
```

## Verificación

Después de aplicar estos cambios:

1. Ejecuta las migraciones: `php artisan migrate`
2. Limpia la caché: `php artisan cache:clear`
3. Prueba actualizar una compañía desde el frontend
4. Verifica que las coordenadas se guarden correctamente en la base de datos

## Frontend ya está listo ✅

El frontend ya está enviando correctamente las coordenadas en:
- Creación de compañía
- Actualización de compañía
- Creación de sucursales
- Actualización de sucursales

Solo necesitas corregir el backend de Laravel siguiendo los pasos anteriores.
