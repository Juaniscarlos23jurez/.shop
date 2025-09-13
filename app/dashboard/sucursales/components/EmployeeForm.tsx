import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES, Employee } from '@/types/branch';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (employeeData: Omit<Employee, 'id' | 'lastActive'>) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || ROLES[0],
    status: employee?.status || 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {employee ? 'Editar empleado' : 'Agregar nuevo empleado'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nombre del empleado"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({...formData, role: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="active"
                  name="status"
                  checked={formData.status === 'active'}
                  onChange={() => setFormData({...formData, status: 'active'})}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <Label htmlFor="active" className="font-normal">
                  Activo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="inactive"
                  name="status"
                  checked={formData.status === 'inactive'}
                  onChange={() => setFormData({...formData, status: 'inactive'})}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <Label htmlFor="inactive" className="font-normal">
                  Inactivo
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {employee ? 'Guardar cambios' : 'Agregar empleado'}
          </Button>
        </div>
      </form>
    </div>
  );
}
