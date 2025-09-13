import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Branch, Employee } from "@/types/branch";

interface BranchStatsProps {
  branch: Branch;
  employees: Employee[];
}

export function BranchStats({ branch, employees }: BranchStatsProps) {
  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const roles = new Set(employees.map(emp => emp.role));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Estado
          </div>
          <div className="flex items-center">
            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${branch.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{branch.isActive ? 'Activa' : 'Inactiva'}</span>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Empleados activos
          </div>
          <div className="text-2xl font-semibold">
            {activeEmployees} <span className="text-sm text-muted-foreground">/ {employees.length} total</span>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Roles en la sucursal
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(roles).map(role => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
            {roles.size === 0 && (
              <span className="text-sm text-muted-foreground">Sin roles definidos</span>
            )}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Creada el
          </div>
          <div className="text-sm">
            {new Date(branch.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
