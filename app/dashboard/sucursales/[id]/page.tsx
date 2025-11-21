'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { api } from '@/lib/api';
import { Branch, Employee } from '@/types/branch';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Components
import dynamic from 'next/dynamic';

// Import components
import { 
  BranchInfo, 
  EmployeeList, 
  EmployeeForm, 
  BranchStats, 
  QuickActions
} from './components';
import { EditBranchView } from './components/EditBranchView';
import { BranchShowView } from './components/BranchShowView';
import { AccountForm } from './components/AccountForm';

export default function BranchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  // Debug helper to standardize logs
  const debugLog = (label: string, payload: any) => {
    try {
      // avoid huge console noise
      // mask token if ever passed mistakenly
      const safe = JSON.parse(JSON.stringify(payload));
      if (safe && typeof safe === 'object') {
        if ('token' in safe) safe.token = safe.token ? '***MASKED***' : undefined;
        if ('Authorization' in safe) safe.Authorization = 'Bearer ***MASKED***';
        if ('password' in safe) safe.password = '***MASKED***';
        if ('password_confirmation' in safe) safe.password_confirmation = '***MASKED***';
      }
      // eslint-disable-next-line no-console
      console.debug(`[BranchDetail] ${label}:`, safe);
    } catch {
      // eslint-disable-next-line no-console
      console.debug(`[BranchDetail] ${label}`);
    }
  };
  
  // State
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Fetch branch details and employees
  // Check URL for edit and tab query params on initial load
  useEffect(() => {
    const editParam = searchParams?.get('edit');
    const tabParam = searchParams?.get('tab');
    
    if (editParam === 'true') {
      setIsEditing(true);
    }
    
    if (tabParam && ['employees', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        
        // Get company ID first
        const companyResponse = await api.userCompanies.get(token);
        if (!companyResponse.success || !companyResponse.data?.data?.id) {
          throw new Error('No se pudo obtener el ID de la compañía');
        }
        
        const companyId = companyResponse.data.data.id;
        setCompanyId(companyId.toString());
        debugLog('Company resolved', { companyId, routeLocationId: id });
        
        // Get all locations
        const locationsResponse = await api.userCompanies.getLocations(token);
        if (!locationsResponse.success) {
          throw new Error(locationsResponse.message || 'Error al cargar las sucursales');
        }
        
        // Find the current branch - handle both response formats
        const responseData = locationsResponse.data as any;
        const locations = Array.isArray(responseData) 
          ? responseData 
          : responseData?.locations || responseData?.data?.locations || [];
        const currentBranch = locations.find((loc: any) => loc.id.toString() === id);
        
        if (!currentBranch) {
          throw new Error('Sucursal no encontrada');
        }
        
        // Format branch data to match our type
        const formattedBranch: Branch = {
          id: currentBranch.id.toString(),
          name: currentBranch.name,
          description: currentBranch.description || '',
          phone: currentBranch.phone || '',
          email: currentBranch.email || '',
          address: currentBranch.address || '',
          city: currentBranch.city || '',
          state: currentBranch.state || '',
          country: currentBranch.country || 'México',
          zipCode: currentBranch.postal_code || currentBranch.zip_code || '',
          isActive: currentBranch.is_active !== undefined ? currentBranch.is_active : true,
          createdAt: currentBranch.created_at || new Date().toISOString(),
          updatedAt: currentBranch.updated_at || new Date().toISOString(),
          // Preserve geo IDs and coordinates if present
          country_id: currentBranch.country_id,
          state_id: currentBranch.state_id,
          city_id: currentBranch.city_id,
          latitude: currentBranch.latitude,
          longitude: currentBranch.longitude
        };
        
        setBranch(formattedBranch);
        
        // Fetch employees for this location
        try {
          const employeesResponse = await api.userCompanies.getLocationEmployees(
            companyId,
            currentBranch.id.toString(),
            token
          );
          
          console.log('Employees API Response:', employeesResponse);
          
          if (employeesResponse.success) {
            // The employees might be directly in the data array or in a nested employees property
            const employeesData = Array.isArray(employeesResponse.data) 
              ? employeesResponse.data 
              : (employeesResponse.data && Array.isArray(employeesResponse.data.data))
                ? employeesResponse.data.data
                : [];
              
            if (employeesData.length > 0) {
              // Map the API response to our Employee type
              const formattedEmployees = employeesData.map((emp: any) => ({
                id: emp.id?.toString() || `emp-${Math.random().toString(36).substr(2, 9)}`,
                name: emp.name || emp.full_name || 'Nombre no disponible',
                email: emp.email || '',
                role: (emp.role && ['admin', 'manager', 'employee'].includes(emp.role.toLowerCase())) 
                  ? emp.role.toLowerCase() as 'admin' | 'manager' | 'employee'
                  : 'employee',
                isActive: emp.status ? emp.status === 'active' : true,
                lastActive: emp.last_active || emp.last_login || new Date().toISOString(),
                phone: emp.phone || emp.phone_number || '',
                position: emp.position || emp.job_title || 'Empleado',
                avatar: emp.avatar || emp.profile_photo_url || ''
              }));

              // After employees, fetch accounts and merge by employee_id
              try {
                const accountsResp = await api.userCompanies.getEmployeeAccounts(companyId, token);
                if (accountsResp.success) {
                  const accountsArray: any[] = Array.isArray(accountsResp.data)
                    ? accountsResp.data
                    : (accountsResp.data && Array.isArray((accountsResp as any).data?.data))
                      ? (accountsResp as any).data.data
                      : [];

                  const accountsByEmployee: Record<string, any> = {};
                  for (const acc of accountsArray) {
                    const empId = (acc.employee_id ?? acc.employee?.id)?.toString?.() || '';
                    if (empId) accountsByEmployee[empId] = acc;
                  }

                  const merged = formattedEmployees.map(e => {
                    const acc = accountsByEmployee[e.id];
                    if (!acc) return e;
                    return {
                      ...e,
                      account: {
                        user_id: (acc.user_id ?? acc.id)?.toString?.() || '',
                        employee_id: (acc.employee_id ?? acc.employee?.id)?.toString?.() || e.id,
                        email: acc.email,
                        role_type: acc.role_type,
                        is_active: acc.is_active ?? true,
                        location_id: acc.location_id ?? undefined,
                      },
                    } as any;
                  });

                  setEmployees(merged);
                } else {
                  setEmployees(formattedEmployees);
                }
              } catch {
                setEmployees(formattedEmployees);
              }
            } else {
              console.log('No employees found for this location');
              setEmployees([]);
            }
          } else {
            toast({
              title: 'Error',
              description: employeesResponse.message || 'No se pudieron cargar los empleados de la sucursal',
              variant: 'destructive',
            });
            setEmployees([]);
          }
        } catch (error) {
          console.error('Error fetching employees:', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los empleados de la sucursal',
            variant: 'destructive',
          });
          setEmployees([]);
        }
        
      } catch (error) {
        console.error('Error fetching branch details:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Error al cargar los datos de la sucursal',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Handle branch update
  const handleSaveBranch = async (updatedBranch: Branch) => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      console.log('[BranchDetail] handleSaveBranch - Received updatedBranch:', updatedBranch);
      console.log('[BranchDetail] handleSaveBranch - postal_code from updatedBranch:', (updatedBranch as any).postal_code);
      console.log('[BranchDetail] handleSaveBranch - zipCode from updatedBranch:', updatedBranch.zipCode);
      
      // Format data for API - include IDs and coordinates as per backend requirements
      const updateData: any = {
        name: updatedBranch.name,
        description: updatedBranch.description,
        phone: updatedBranch.phone,
        email: updatedBranch.email,
        address: updatedBranch.address,
        city: updatedBranch.city,
        state: updatedBranch.state,
        country: updatedBranch.country,
        postal_code: (updatedBranch as any).postal_code || updatedBranch.zipCode,
        is_active: updatedBranch.isActive
      };
      
      console.log('[BranchDetail] handleSaveBranch - updateData being sent to API:', updateData);
      
      // Include optional geo IDs if present
      if ((updatedBranch as any).country_id) {
        updateData.country_id = (updatedBranch as any).country_id;
      }
      if ((updatedBranch as any).state_id) {
        updateData.state_id = (updatedBranch as any).state_id;
      }
      if ((updatedBranch as any).city_id) {
        updateData.city_id = (updatedBranch as any).city_id;
      }
      
      // Include coordinates if present
      if ((updatedBranch as any).latitude !== undefined) {
        updateData.latitude = (updatedBranch as any).latitude;
      }
      if ((updatedBranch as any).longitude !== undefined) {
        updateData.longitude = (updatedBranch as any).longitude;
      }
      
      // Update branch via API
      const response = await api.userCompanies.updateLocation(
        updatedBranch.id,
        updateData,
        token
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar la sucursal');
      }
      
      // Update local state with the updated branch data
      setBranch(updatedBranch);
      setIsEditing(false);
      
      toast({
        title: '¡Éxito!',
        description: 'La sucursal se ha actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la sucursal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle employee actions
  const handleAddEmployee = async (employeeData: any) => {
    if (!token || !branch) return;
    
    try {
      setLoading(true);
      
      // First, get the company ID
      const companyResponse = await api.userCompanies.get(token);
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('No se pudo obtener el ID de la compañía');
      }
      
      const companyId = companyResponse.data.data.id;
      
      // Create employee with location assignment
      const createResponse = await api.userCompanies.createEmployee(
        companyId,
        {
          ...employeeData,
          location_assignment: {
            ...employeeData.location_assignment,
            location_id: branch.id,
            schedule: {
              monday: { start: "09:00", end: "18:00", is_working: true },
              tuesday: { start: "09:00", end: "18:00", is_working: true },
              wednesday: { start: "09:00", end: "18:00", is_working: true },
              thursday: { start: "09:00", end: "18:00", is_working: true },
              friday: { start: "09:00", end: "18:00", is_working: true },
              saturday: { start: null, end: null, is_working: false },
              sunday: { start: null, end: null, is_working: false }
            }
          }
        },
        token
      );
      
      if (!createResponse.success) {
        throw new Error(createResponse.message || 'Error al crear el empleado');
      }
      
      // Refresh the employees list
      const employeesResponse = await api.userCompanies.getLocationEmployees(
        companyId,
        branch.id,
        token
      );
      
      if (employeesResponse.success && employeesResponse.data?.employees) {
        const formattedEmployees = employeesResponse.data.employees.map((emp: any) => ({
          id: emp.id.toString(),
          name: emp.name || 'Nombre no disponible',
          email: emp.email || '',
          role: (emp.role && ['admin', 'manager', 'employee'].includes(emp.role.toLowerCase())) 
            ? emp.role.toLowerCase() as 'admin' | 'manager' | 'employee'
            : 'employee',
          isActive: emp.status ? emp.status === 'active' : true,
          lastActive: emp.last_active || new Date().toISOString(),
          phone: emp.phone || '',
          position: emp.position || 'Empleado',
          avatar: emp.avatar || ''
        }));
        setEmployees(formattedEmployees);
      }
      
      setShowEmployeeForm(false);
      
      toast({
        title: '¡Éxito!',
        description: 'El empleado ha sido agregado correctamente a la sucursal',
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo agregar al empleado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeData: Omit<Employee, 'id' | 'lastActive'>) => {
    if (!token || !currentEmployee || !branch) return;
    
    try {
      setLoading(true);
      
      // First, get the company ID
      const companyResponse = await api.userCompanies.get(token);
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('No se pudo obtener el ID de la compañía');
      }
      
      const companyId = companyResponse.data.data.id;
      
      // Update employee assignment with new data
      const updateData = {
        // Include any fields that can be updated
        role: employeeData.role,
        // Add any other fields that can be updated
      };
      
      const updateResponse = await api.userCompanies.updateEmployeeAssignment(
        companyId,
        branch.id,
        currentEmployee.id,
        updateData,
        token
      );
      
      if (!updateResponse.success) {
        throw new Error(updateResponse.message || 'Error al actualizar la información del empleado');
      }
      
      // Refresh the employees list
      const employeesResponse = await api.userCompanies.getLocationEmployees(
        companyId,
        branch.id,
        token
      );
      
      if (employeesResponse.success && employeesResponse.data?.employees) {
        const formattedEmployees = employeesResponse.data.employees.map((emp: any) => ({
          id: emp.id.toString(),
          name: emp.name || 'Nombre no disponible',
          email: emp.email || '',
          role: (emp.role && ['admin', 'manager', 'employee'].includes(emp.role.toLowerCase())) 
            ? emp.role.toLowerCase() as 'admin' | 'manager' | 'employee'
            : 'employee',
          isActive: emp.status ? emp.status === 'active' : true,
          lastActive: emp.last_active || new Date().toISOString(),
          phone: emp.phone || '',
          position: emp.position || 'Empleado',
          avatar: emp.avatar || ''
        }));
        setEmployees(formattedEmployees);
      }
      
      setCurrentEmployee(null);
      setShowEmployeeForm(false);
      
      toast({
        title: '¡Éxito!',
        description: 'La información del empleado ha sido actualizada correctamente',
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la información del empleado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!token || !branch) return;
    
    // Confirm before deleting
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar a este empleado de esta sucursal?');
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      
      // First, get the company ID
      const companyResponse = await api.userCompanies.get(token);
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('No se pudo obtener el ID de la compañía');
      }
      
      const companyId = companyResponse.data.data.id;
      
      // Remove employee from location
      const deleteResponse = await api.userCompanies.removeEmployeeFromLocation(
        companyId,
        branch.id,
        employeeId,
        token
      );
      
      if (!deleteResponse.success) {
        throw new Error(deleteResponse.message || 'Error al eliminar al empleado de la sucursal');
      }
      
      // Refresh the employees list
      const employeesResponse = await api.userCompanies.getLocationEmployees(
        companyId,
        branch.id,
        token
      );
      
      if (employeesResponse.success && employeesResponse.data?.employees) {
        const formattedEmployees = employeesResponse.data.employees.map((emp: any) => ({
          id: emp.id.toString(),
          name: emp.name || 'Nombre no disponible',
          email: emp.email || '',
          role: (emp.role && ['admin', 'manager', 'employee'].includes(emp.role.toLowerCase())) 
            ? emp.role.toLowerCase() as 'admin' | 'manager' | 'employee'
            : 'employee',
          isActive: emp.status ? emp.status === 'active' : true,
          lastActive: emp.last_active || new Date().toISOString(),
          phone: emp.phone || '',
          position: emp.position || 'Empleado',
          avatar: emp.avatar || ''
        }));
        setEmployees(formattedEmployees);
      }
      
      toast({
        title: '¡Éxito!',
        description: 'El empleado ha sido eliminado correctamente de la sucursal',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar al empleado de la sucursal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle employee account management
  const handleManageAccount = (employee: Employee) => {
    // If account is missing, try to fetch and attach from accounts listing
    if (!employee.account && companyId && token) {
      (async () => {
        try {
          const resp = await api.userCompanies.getEmployeeAccounts(companyId, token, { employee_id: employee.id });
          if (resp.success) {
            const accountsArray: any[] = Array.isArray(resp.data)
              ? resp.data
              : (resp.data && Array.isArray((resp as any).data?.data))
                ? (resp as any).data.data
                : [];
            const found = accountsArray.find((acc: any) => {
              const empId = (acc.employee_id ?? acc.employee?.id)?.toString?.();
              return empId === employee.id;
            });
            if (found) {
              employee = {
                ...employee,
                account: {
                  user_id: (found.user_id ?? found.id)?.toString?.() || '',
                  employee_id: (found.employee_id ?? found.employee?.id)?.toString?.() || employee.id,
                  email: found.email,
                  role_type: found.role_type,
                  is_active: found.is_active ?? true,
                  location_id: found.location_id ?? undefined,
                } as any,
              } as Employee;
            }
          }
        } catch {}
        setCurrentEmployee(employee);
        setShowAccountForm(true);
      })();
      return;
    }
    setCurrentEmployee(employee);
    setShowAccountForm(true);
  };

  const handleSaveAccount = async (accountData: any) => {
    if (!token || !currentEmployee || !companyId) return;
    
    try {
      setLoading(true);
      // sanitize payload for logs
      const { password, password_confirmation, ...rest } = accountData || {};
      debugLog('Account operation start', {
        action: currentEmployee.account ? 'update' : 'create',
        companyId,
        employeeId: currentEmployee.id,
        locationId: id,
        payload: rest,
        hasToken: !!token,
      });
      
      if (currentEmployee.account) {
        // Update existing account
        const updateResponse = await api.userCompanies.updateEmployeeAccount(
          companyId,
          currentEmployee.account.user_id.toString(),
          accountData,
          token
        );
        
        debugLog('Account update response', updateResponse);
        if (!updateResponse.success) {
          throw new Error(updateResponse.message || 'Error al actualizar la cuenta');
        }
        
        toast({
          title: '¡Éxito!',
          description: 'La cuenta ha sido actualizada correctamente',
        });
      } else {
        // Create new account
        const createResponse = await api.userCompanies.createEmployeeAccount(
          companyId,
          currentEmployee.id,
          accountData,
          token
        );
        
        debugLog('Account create response', createResponse);
        if (!createResponse.success) {
          throw new Error(createResponse.message || 'Error al crear la cuenta');
        }
        
        toast({
          title: '¡Éxito!',
          description: 'La cuenta ha sido creada correctamente',
        });
      }
      
      // Refresh employees to get updated account info
      const employeesResponse = await api.userCompanies.getLocationEmployees(
        companyId,
        id as string,
        token
      );
      debugLog('Employees refresh after account op', employeesResponse);
      if (employeesResponse.success) {
        const employeesData = Array.isArray(employeesResponse.data) 
          ? employeesResponse.data 
          : (employeesResponse.data && Array.isArray(employeesResponse.data.data))
            ? employeesResponse.data.data
            : [];
            
        const formattedEmployees = employeesData.map((emp: any) => ({
          id: emp.id?.toString() || `emp-${Math.random().toString(36).substr(2, 9)}`,
          name: emp.name || emp.full_name || 'Nombre no disponible',
          email: emp.email || '',
          role: (emp.role && ['admin', 'manager', 'employee'].includes(emp.role.toLowerCase())) 
            ? emp.role.toLowerCase() as 'admin' | 'manager' | 'employee'
            : 'employee',
          isActive: emp.status ? emp.status === 'active' : true,
          lastActive: emp.last_active || emp.last_login || new Date().toISOString(),
          phone: emp.phone || emp.phone_number || '',
          position: emp.position || emp.job_title || 'Empleado',
          avatar: emp.avatar || emp.profile_photo_url || '',
          account: emp.account || emp.user_account || undefined
        }));
        setEmployees(formattedEmployees);
      }
      
      setShowAccountForm(false);
      setCurrentEmployee(null);
    } catch (error) {
      debugLog('Error managing account', {
        message: error instanceof Error ? error.message : String(error),
        companyId,
        employeeId: currentEmployee?.id,
        locationId: id,
      });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo gestionar la cuenta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando datos de la sucursal...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Sucursal no encontrada</h2>
        <p className="text-muted-foreground mt-2">
          La sucursal que estás buscando no existe o no tienes permiso para verla.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          Volver atrás
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditing ? (
        <EditBranchView 
          branch={branch}
          onSave={handleSaveBranch}
          onCancel={() => {
            setIsEditing(false);
            router.replace(`/dashboard/sucursales/${id}`, { scroll: false });
          }}
        />
      ) : (
        <BranchShowView
          branch={branch}
          employees={employees}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEditClick={() => {
            setIsEditing(true);
            router.push(`/dashboard/sucursales/${id}?edit=true`, { scroll: false });
          }}
          onAddEmployee={() => setShowEmployeeForm(true)}
          onEditEmployee={(emp) => {
            setCurrentEmployee(emp);
            setShowEmployeeForm(true);
          }}
          onManageAccount={handleManageAccount}
          onDeleteEmployee={handleDeleteEmployee}
          showEmployeeForm={showEmployeeForm}
          showAccountForm={showAccountForm}
          currentEmployee={currentEmployee}
          onSaveEmployee={currentEmployee ? handleUpdateEmployee : handleAddEmployee}
          onSaveAccount={handleSaveAccount}
          onCancelEmployeeForm={() => {
            setShowEmployeeForm(false);
            setCurrentEmployee(null);
          }}
          onCancelAccountForm={() => {
            setShowAccountForm(false);
            setCurrentEmployee(null);
          }}
          locationId={id as string}
        />
      )}
    </div>
  );
}