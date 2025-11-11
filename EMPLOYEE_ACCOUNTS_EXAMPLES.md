# Ejemplos Detallados - Sistema de Cuentas de Empleado

## Tabla de Contenidos
1. [Flujo Completo de Implementación](#flujo-completo)
2. [Ejemplos React/Next.js](#ejemplos-react)
3. [Manejo de Errores](#manejo-de-errores)
4. [Validación de Permisos en Frontend](#validación-permisos)

---

## Flujo Completo de Implementación

### Paso 1: Admin Crea Empleado
```javascript
// POST /api/companies/{companyId}/employees
const createEmployee = async (companyId, employeeData) => {
  const response = await fetch(
    `${API_URL}/api/companies/${companyId}/employees`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        email: employeeData.personalEmail,
        phone: employeeData.phone,
        position: employeeData.position,
        department: employeeData.department,
        hire_date: employeeData.hireDate,
      }),
    }
  );
  
  return await response.json();
};

// Uso
const employee = await createEmployee(1, {
  firstName: 'Juan',
  lastName: 'Pérez',
  personalEmail: 'juan.perez@personal.com',
  phone: '+52 555 1234 5678',
  position: 'Vendedor',
  department: 'Ventas',
  hireDate: '2025-11-01',
});

console.log('Empleado creado:', employee.id);
```

### Paso 2: Admin Crea Cuenta de Acceso
```javascript
const createEmployeeAccount = async (companyId, employeeId, accountData) => {
  const response = await fetch(
    `${API_URL}/api/companies/${companyId}/employee-accounts/employees/${employeeId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: accountData.email,
        password: accountData.password,
        password_confirmation: accountData.password,
        role_type: accountData.roleType,
        location_id: accountData.locationId,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};

// Uso
const account = await createEmployeeAccount(1, employee.id, {
  email: 'juan.perez@empresa.com',
  password: 'TempPass123!',
  roleType: 'sales',
  locationId: 2,
});

console.log('Cuenta creada:', account.data);
```

### Paso 3: Empleado Inicia Sesión
```javascript
const employeeLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  // Guardar token y datos del usuario
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user_role', data.user.role);
  localStorage.setItem('user_data', JSON.stringify(data.user));
  
  return data;
};

// Uso
const loginData = await employeeLogin(
  'juan.perez@empresa.com',
  'TempPass123!'
);

console.log('Usuario logueado:', loginData.user.role_display);
```

---

## Ejemplos React/Next.js

### Hook Personalizado para Gestión de Cuentas

```jsx
// hooks/useEmployeeAccounts.js
import { useState, useEffect } from 'react';

export function useEmployeeAccounts(companyId) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, [companyId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}/employee-accounts`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Error al cargar cuentas');

      const data = await response.json();
      setAccounts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (employeeId, accountData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}/employee-accounts/employees/${employeeId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      await fetchAccounts(); // Recargar lista
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const updateAccount = async (userId, updates) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}/employee-accounts/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar');

      await fetchAccounts();
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const toggleStatus = async (userId, isActive) => {
    try {
      const url = isActive
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}/employee-accounts/${userId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}/employee-accounts/${userId}/activate`;

      const response = await fetch(url, {
        method: isActive ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Error al cambiar estado');

      await fetchAccounts();
    } catch (err) {
      throw err;
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    toggleStatus,
    refresh: fetchAccounts,
  };
}

function getToken() {
  return localStorage.getItem('auth_token');
}
```

### Componente de Lista de Cuentas

```jsx
// components/EmployeeAccountsList.jsx
import React from 'react';
import { useEmployeeAccounts } from '../hooks/useEmployeeAccounts';

export function EmployeeAccountsList({ companyId }) {
  const { accounts, loading, error, toggleStatus } = useEmployeeAccounts(companyId);

  if (loading) return <div>Cargando cuentas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="accounts-list">
      <h2>Cuentas de Empleado</h2>
      
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(account => (
            <tr key={account.id}>
              <td>
                <div className="user-info">
                  {account.employee?.profile_picture && (
                    <img 
                      src={account.employee.profile_picture} 
                      alt={account.name}
                      className="avatar"
                    />
                  )}
                  <span>{account.name}</span>
                </div>
              </td>
              <td>{account.email}</td>
              <td>
                <span className={`badge badge-${account.role_type}`}>
                  {account.role_display}
                </span>
              </td>
              <td>{account.location?.name || 'Sin asignar'}</td>
              <td>
                <span className={account.is_active ? 'status-active' : 'status-inactive'}>
                  {account.is_active ? '● Activo' : '○ Inactivo'}
                </span>
              </td>
              <td>
                <button
                  onClick={() => toggleStatus(account.id, account.is_active)}
                  className="btn btn-sm"
                >
                  {account.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Formulario de Creación de Cuenta

```jsx
// components/CreateAccountForm.jsx
import React, { useState } from 'react';

export function CreateAccountForm({ companyId, employeeId, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
    roleType: 'sales',
    locationId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}/employee-accounts/employees/${employeeId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
            role_type: formData.roleType,
            location_id: formData.locationId || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.errors) {
          setErrors(error.errors);
        }
        throw new Error(error.message);
      }

      const data = await response.json();
      onSuccess(data);
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        passwordConfirmation: '',
        roleType: 'sales',
        locationId: '',
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-account-form">
      <h3>Crear Cuenta de Acceso</h3>

      <div className="form-group">
        <label>Email Corporativo *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        {errors.email && <span className="error">{errors.email[0]}</span>}
      </div>

      <div className="form-group">
        <label>Contraseña *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          minLength={8}
          required
        />
        {errors.password && <span className="error">{errors.password[0]}</span>}
      </div>

      <div className="form-group">
        <label>Confirmar Contraseña *</label>
        <input
          type="password"
          value={formData.passwordConfirmation}
          onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Rol *</label>
        <select
          value={formData.roleType}
          onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
          required
        >
          <option value="sales">Ventas</option>
          <option value="cashier">Cajero</option>
          <option value="supervisor">Supervisor</option>
          <option value="manager">Gerente</option>
        </select>
        {errors.role_type && <span className="error">{errors.role_type[0]}</span>}
      </div>

      <div className="form-group">
        <label>Ubicación (Opcional)</label>
        <select
          value={formData.locationId}
          onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
        >
          <option value="">Sin asignar</option>
          {/* Cargar ubicaciones dinámicamente */}
        </select>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Creando...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}
```

---

## Manejo de Errores

### Errores Comunes y Soluciones

```javascript
// Wrapper para manejo de errores
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 401:
          // No autenticado - redirigir a login
          window.location.href = '/login';
          throw new Error('Sesión expirada');
          
        case 403:
          // Sin permisos
          throw new Error('No tienes permisos para realizar esta acción');
          
        case 404:
          throw new Error('Recurso no encontrado');
          
        case 422:
          // Error de validación
          throw {
            type: 'validation',
            errors: error.errors,
            message: error.message,
          };
          
        default:
          throw new Error(error.message || 'Error desconocido');
      }
    }
    
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// Uso
try {
  const data = await apiCall(url, options);
  // Éxito
} catch (error) {
  if (error.type === 'validation') {
    // Mostrar errores de validación
    setFormErrors(error.errors);
  } else {
    // Mostrar error general
    alert(error.message);
  }
}
```

---

## Validación de Permisos en Frontend

### Helper para Verificar Permisos

```javascript
// utils/permissions.js

const ROLE_PERMISSIONS = {
  employee_sales: [
    'view_products',
    'create_sales',
    'view_own_sales',
    'view_customers',
    'apply_coupons',
  ],
  employee_cashier: [
    'view_products',
    'create_sales',
    'view_sales',
    'process_payments',
    'view_customers',
    'apply_coupons',
  ],
  employee_supervisor: [
    'view_products',
    'create_sales',
    'view_sales',
    'view_reports',
    'manage_employees',
    'view_customers',
    'manage_coupons',
  ],
  employee_manager: [
    'view_products',
    'manage_products',
    'create_sales',
    'view_sales',
    'manage_sales',
    'view_reports',
    'manage_employees',
    'view_customers',
    'manage_customers',
    'manage_coupons',
    'manage_location_settings',
  ],
  admin: ['*'], // Acceso completo
};

export function hasPermission(userRole, permission) {
  if (userRole === 'admin') return true;
  
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function canAccessRoute(userRole, route) {
  const routePermissions = {
    '/products': 'view_products',
    '/products/new': 'manage_products',
    '/sales': 'view_sales',
    '/sales/new': 'create_sales',
    '/reports': 'view_reports',
    '/employees': 'manage_employees',
    '/customers': 'view_customers',
  };
  
  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true;
  
  return hasPermission(userRole, requiredPermission);
}
```

### Componente de Protección de Rutas

```jsx
// components/ProtectedRoute.jsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { canAccessRoute } from '../utils/permissions';

export function ProtectedRoute({ children, requiredPermission }) {
  const router = useRouter();
  const userRole = localStorage.getItem('user_role');

  useEffect(() => {
    if (!userRole) {
      router.push('/login');
      return;
    }

    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      router.push('/unauthorized');
    }
  }, [userRole, requiredPermission]);

  if (!userRole || (requiredPermission && !hasPermission(userRole, requiredPermission))) {
    return <div>Verificando permisos...</div>;
  }

  return children;
}

// Uso
<ProtectedRoute requiredPermission="manage_products">
  <ProductsPage />
</ProtectedRoute>
```

---

## Resumen de Implementación

1. ✅ **Backend:** Middleware, controladores y rutas creados
2. ✅ **Roles:** 4 roles con permisos específicos
3. ✅ **API:** 8 endpoints para gestión completa
4. ✅ **Frontend:** Hooks y componentes React listos
5. ✅ **Seguridad:** Validación de permisos en ambos lados

