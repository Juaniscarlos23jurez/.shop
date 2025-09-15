import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/branch";
import { Pencil, Trash2 } from "lucide-react";
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface EmployeeListProps {
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
}

export function EmployeeList({ 
  onAddEmployee, 
  onEditEmployee
}: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { id: locationId } = useParams();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token || !locationId) return;
      
      try {
        setLoading(true);
        
        // Get company ID first
        const companyResponse = await api.userCompanies.get(token);
        if (!companyResponse.success || !companyResponse.data?.data?.id) {
          throw new Error('No se pudo obtener el ID de la compañía');
        }
        
        const companyId = companyResponse.data.data.id;
        
        // Fetch employees for this location
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud'}/api/companies/${companyId}/locations/${locationId}/employees`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `Error al cargar los empleados: ${response.status} ${response.statusText}`
          );
        }

        const responseData = await response.json();
        console.log('Raw API response:', responseData); // Debug log
        
        // Handle both array and object with data property
        const employeesData = Array.isArray(responseData) 
          ? responseData 
          : responseData.data || [];
        
        console.log('Employees data:', employeesData); // Debug log
        
        const formattedEmployees = employeesData.map((emp: any) => ({
          id: emp.id?.toString() || `emp-${Math.random().toString(36).substr(2, 9)}`,
          name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Nombre no disponible',
          email: emp.email || '',
          role: 'employee' as const,
          isActive: emp.is_active !== undefined ? emp.is_active : true,
          lastActive: emp.last_active || new Date().toISOString(),
          phone: emp.phone || '',
          position: emp.position || 'Empleado',
          avatar: emp.profile_picture || ''
        }));
        
        console.log('Formatted employees:', formattedEmployees); // Debug log
        setEmployees(formattedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        let errorMessage = 'No se pudieron cargar los empleados';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message);
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token, locationId]);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!token || !locationId) return;
    
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar a este empleado?');
    if (!confirmDelete) return;
    
    try {
      // Get company ID first
      const companyResponse = await api.userCompanies.get(token);
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('No se pudo obtener el ID de la compañía');
      }
      
      const companyId = companyResponse.data.data.id;
      
      // Call your delete API here
      // await api.userCompanies.removeEmployeeFromLocation(companyId, locationId, employeeId, token);
      
      // Remove from local state
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      
      toast({
        title: 'Éxito',
        description: 'Empleado eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar al empleado',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Empleados1</h3>
        <Button onClick={onAddEmployee}>
          Agregar empleado
        </Button>
      </div>
      
      {employees.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No hay empleados registrados</p>
          <Button variant="outline" className="mt-4" onClick={onAddEmployee}>
            Agregar el primer empleado
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                      {employee.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
