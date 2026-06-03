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
import { Clock as CalendarIcon, Eye, EyeOff, User, Briefcase, Phone, MapPin, Building, ShieldCheck, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {employee ? 'Editar empleado' : 'Agregar nuevo empleado'}
        </h3>
        <p className="text-slate-500">
          {employee 
            ? 'Modifica la información y permisos de este empleado.' 
            : 'Crea una cuenta para un nuevo integrante de la sucursal. Sus credenciales se generarán automáticamente.'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Tarjeta de Información Básica */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <User className="w-5 h-5 text-blue-500" />
                Información Básica
              </CardTitle>
              <CardDescription>Datos personales y de contacto del empleado.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan Carlos" className="bg-white" {...field} />
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
                      <FormLabel className="text-slate-700">Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Pérez Gómez" className="bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Correo electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="correo@ejemplo.com" 
                          disabled={!!employee}
                          className="bg-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Se utilizará para iniciar sesión.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Teléfono</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <Input placeholder="1234567890" className="pl-10 bg-white" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Dirección completa</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <Input placeholder="Calle, número, colonia, ciudad..." className="pl-10 bg-white" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tarjeta de Seguridad (Sólo Creación) */}
          {!employee && (
            <Card className="border-emerald-200 shadow-sm overflow-hidden">
              <div className="bg-emerald-500 h-1 w-full" />
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Credenciales de Acceso
                </CardTitle>
                <CardDescription className="text-emerald-700/80">
                  Define la contraseña que usará el empleado para entrar al sistema. (Regla de negocio: visible para ti).
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Contraseña Inicial</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Escribe una contraseña segura"
                              className="pr-10 border-emerald-200 focus-visible:ring-emerald-500 bg-white"
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
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
                        <FormLabel className="text-slate-700 font-semibold">Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirma la contraseña"
                              className="pr-10 border-emerald-200 focus-visible:ring-emerald-500 bg-white"
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tarjeta de Información Laboral */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Información Laboral
              </CardTitle>
              <CardDescription>Detalles del puesto, contratación y salario.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Puesto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Cajero, Vendedor, Gerente" className="bg-white" {...field} />
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
                      <FormLabel className="text-slate-700">Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ventas, Operaciones" className="bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-700">Fecha de Contratación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>}
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
                      <FormLabel className="text-slate-700">Salario Mensual</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-slate-500">$</span>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="pl-7 bg-white"
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
            </CardContent>
          </Card>

          {/* Tarjeta de Contacto de Emergencia */}
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="bg-red-50/30 border-b border-red-50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <HeartPulse className="w-5 h-5 text-red-500" />
                Contacto de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="emergency_contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Familiar o persona de confianza" className="bg-white" {...field} />
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
                      <FormLabel className="text-slate-700">Teléfono</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <Input placeholder="1234567890" className="pl-10 bg-white" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Asignación y Permisos */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Building className="w-5 h-5 text-amber-500" />
                Asignación y Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location_assignment.role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nivel de Acceso (Rol)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Empleado (Acceso Básico)</SelectItem>
                          <SelectItem value="manager">Gerente (Acceso Medio)</SelectItem>
                          <SelectItem value="admin">Administrador (Acceso Total)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Determina qué puede hacer en el sistema.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location_assignment.start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-700">Fecha de Inicio en Sucursal</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="location_assignment.is_primary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="space-y-1">
                        <FormLabel className="text-base font-semibold text-slate-800">Sucursal Principal</FormLabel>
                        <p className="text-sm text-slate-500">
                          Marca si esta es su ubicación de trabajo principal.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="space-y-1">
                        <FormLabel className="text-base font-semibold text-slate-800">Estado del Empleado</FormLabel>
                        <p className="text-sm text-slate-500">
                          {field.value ? 'El empleado tiene acceso al sistema.' : 'El acceso al sistema está deshabilitado.'}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Separator className="my-6" />
          
          <div className="flex justify-end items-center gap-4 pt-2">
            <Button type="button" variant="outline" size="lg" onClick={onCancel} className="px-8 border-slate-300">
              Cancelar
            </Button>
            <Button type="submit" size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 shadow-md">
              {employee ? 'Guardar Cambios' : 'Crear Empleado'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
