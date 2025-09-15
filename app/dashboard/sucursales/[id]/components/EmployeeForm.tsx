import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Employee, ROLES } from "@/types/branch";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the form schema with all required fields
const employeeFormSchema = z.object({
  // Basic info
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirmation: z.string(),
  phone: z.string().min(8, 'El teléfono es requerido'),
  
  // Work info
  position: z.string().min(2, 'El puesto es requerido'),
  department: z.string().min(2, 'El departamento es requerido'),
  hire_date: z.date({
    required_error: 'La fecha de contratación es requerida',
  }),
  salary: z.coerce.number().min(0, 'El salario debe ser mayor o igual a 0'),
  
  // Emergency contact
  emergency_contact_name: z.string().min(2, 'El nombre del contacto de emergencia es requerido'),
  emergency_contact_phone: z.string().min(8, 'El teléfono de emergencia es requerido'),
  address: z.string().min(5, 'La dirección es requerida'),
  
  // Location assignment
  location_assignment: z.object({
    role: z.string().min(2, 'El rol en la sucursal es requerido'),
    is_primary: z.boolean().default(true),
    start_date: z.date({
      required_error: 'La fecha de inicio es requerida',
    }),
  }).optional(),
  
  // Additional fields from the original form
  isActive: z.boolean().default(true),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  locationId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, locationId, onSave, onCancel }: EmployeeFormProps) {
  const today = new Date();
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      // Basic info
      first_name: employee?.name?.split(' ')[0] || '',
      last_name: employee?.name?.split(' ').slice(1).join(' ') || '',
      email: employee?.email || '',
      password: '',
      password_confirmation: '',
      phone: employee?.phone || '',
      
      // Work info
      position: employee?.position || '',
      department: '',
      hire_date: today,
      salary: 0,
      
      // Emergency contact
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
      
      // Location assignment
      location_assignment: {
        role: employee?.role || 'employee',
        is_primary: true,
        start_date: today,
      },
      
      // Status
      isActive: employee?.isActive ?? true,
    }
  });

  const onSubmit = (data: EmployeeFormValues) => {
    // Format the data for the API
    const apiData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      phone: data.phone,
      position: data.position,
      department: data.department,
      hire_date: format(data.hire_date, 'yyyy-MM-dd'),
      salary: data.salary,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      address: data.address,
      location_assignment: {
        location_id: locationId,
        role: data.location_assignment?.role || 'employee',
        is_primary: data.location_assignment?.is_primary || true,
        start_date: format(data.location_assignment?.start_date || new Date(), 'yyyy-MM-dd'),
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
    };
    
    onSave(apiData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">
        {employee ? 'Editar empleado' : 'Agregar nuevo empleado'}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Información Básica</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellidos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="correo@ejemplo.com" 
                        disabled={!!employee}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!employee && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle y número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Work Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Información Laboral</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puesto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Cajero" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ventas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Contratación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="pl-8"
                            step="0.01"
                            min="0"
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Emergency Contact */}
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-4">Contacto de Emergencia</h4>
                
                <FormField
                  control={form.control}
                  name="emergency_contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del contacto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergency_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono de contacto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Location Assignment */}
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-4">Asignación de Sucursal</h4>
                
                <FormField
                  control={form.control}
                  name="location_assignment.role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol en la Sucursal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Cajero principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location_assignment.start_date"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location_assignment.is_primary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sucursal Principal</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {field.value ? 'Sí' : 'No'}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado del Empleado</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {field.value ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {employee ? 'Actualizar' : 'Agregar'} empleado
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
