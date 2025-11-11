import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Employee, EMPLOYEE_ROLE_DISPLAY } from "@/types/branch";

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onManageAccount: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

export function EmployeeList({ 
  employees,
  onAddEmployee, 
  onEditEmployee,
  onManageAccount,
  onDeleteEmployee
}: EmployeeListProps) {

  // Presentational component: parent controls loading state if needed

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
                <TableHead>Puesto</TableHead>
                <TableHead>Cuenta de Acceso</TableHead>
                <TableHead>Rol de Acceso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position || 'Empleado'}</TableCell>
                  <TableCell>
                    {employee.account ? (
                      <div>
                        <p className="text-sm font-medium">{employee.account.email}</p>
                        <Badge 
                          variant={employee.account.is_active ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {employee.account.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin cuenta</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.account ? (
                      <Badge variant="outline">
                        {EMPLOYEE_ROLE_DISPLAY[employee.account.role_type]}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                      {employee.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditEmployee(employee)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant={employee.account ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => onManageAccount(employee)}
                      >
                        {employee.account ? 'Gestionar cuenta' : 'Crear cuenta'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => onDeleteEmployee?.(employee.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
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
