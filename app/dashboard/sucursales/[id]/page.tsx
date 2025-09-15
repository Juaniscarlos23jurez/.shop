'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  BranchForm, 
  BranchStats, 
  QuickActions 
} from './components';

export default function BranchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  // State
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');
  const [isEditing, setIsEditing] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Fetch branch details and employees
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
          zipCode: currentBranch.zip_code || '',
          isActive: currentBranch.is_active !== undefined ? currentBranch.is_active : true,
          createdAt: currentBranch.created_at || new Date().toISOString(),
          updatedAt: currentBranch.updated_at || new Date().toISOString()
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
              : employeesResponse.data?.employees || [];
              
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
              setEmployees(formattedEmployees);
            } else {
              console.log('No employees found for this location');
              setEmployees([]);
            }
          } else {
            console.error('Error in API response:', employeesResponse.message || 'Unknown error');
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
      
      // Format data for API
      const updateData = {
        name: updatedBranch.name,
        description: updatedBranch.description,
        phone: updatedBranch.phone,
        email: updatedBranch.email,
        address: updatedBranch.address,
        city: updatedBranch.city,
        state: updatedBranch.state,
        country: updatedBranch.country,
        zip_code: updatedBranch.zipCode,
        is_active: updatedBranch.isActive
      };
      
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
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/sucursales" className="flex items-center">
            <span className="mr-2">←</span>
            Volver a sucursales
          </Link>
        </Button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Editar sucursal</h2>
          <BranchForm 
            branch={branch}
            onSave={handleSaveBranch}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <BranchInfo 
          branch={branch} 
          onEditClick={() => setIsEditing(true)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="employees">Empleados</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              {showEmployeeForm ? (
                <EmployeeForm
                  employee={currentEmployee}
                  locationId={id as string}
                  onSave={currentEmployee ? handleUpdateEmployee : handleAddEmployee}
                  onCancel={() => {
                    setShowEmployeeForm(false);
                    setCurrentEmployee(null);
                  }}
                />
              ) : (
                <EmployeeList
                  onAddEmployee={() => setShowEmployeeForm(true)}
                  onEditEmployee={(emp) => {
                    setCurrentEmployee(emp);
                    setShowEmployeeForm(true);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la sucursal</CardTitle>
                  <CardDescription>
                    Configura las opciones avanzadas de esta sucursal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configuración avanzada de la sucursal.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <BranchStats branch={branch} employees={employees} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}