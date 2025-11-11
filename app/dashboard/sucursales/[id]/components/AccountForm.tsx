'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { EmployeeAccount, EMPLOYEE_ROLE_TYPES, EMPLOYEE_ROLE_DISPLAY, EmployeeRoleType } from "@/types/branch";
import { Alert, AlertDescription } from "@/components/ui/alert";

const accountFormSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  role_type: z.enum(['sales', 'cashier', 'supervisor', 'manager'], {
    required_error: 'El rol es requerido',
  }),
  is_active: z.boolean().default(true),
}).refine((data) => {
  // Only validate password match if password is provided
  if (data.password && data.password.length > 0) {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  account?: EmployeeAccount | null;
  employeeId: string;
  employeeName: string;
  locationId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function AccountForm({ 
  account, 
  employeeId, 
  employeeName,
  locationId,
  onSave, 
  onCancel 
}: AccountFormProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: account?.email || '',
      password: '',
      password_confirmation: '',
      role_type: account?.role_type || 'sales',
      is_active: account?.is_active ?? true,
    }
  });

  const onSubmit = (data: AccountFormValues) => {
    const apiData: any = {
      email: data.email,
      role_type: data.role_type,
      location_id: parseInt(locationId),
      name: employeeName,
    };

    // Only include password if it's a new account or if password was changed
    if (!account && data.password) {
      apiData.password = data.password;
      apiData.password_confirmation = data.password_confirmation;
    }

    // For updates, include is_active
    if (account) {
      apiData.is_active = data.is_active;
    }

    onSave(apiData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {account ? 'Editar cuenta de acceso' : 'Crear cuenta de acceso'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Empleado: <span className="font-medium">{employeeName}</span>
        </p>
      </div>

      {!account && (
        <Alert>
          <AlertDescription>
            Se creará una cuenta de acceso para que el empleado pueda iniciar sesión en el sistema.
          </AlertDescription>
        </Alert>
      )}

      {account && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Este empleado ya tiene una cuenta activa. Puedes actualizar su rol o correo.
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico de acceso</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="empleado@empresa.com" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Este será el correo que el empleado usará para iniciar sesión
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!account && (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña temporal</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres. El empleado podrá cambiarla después.
                    </FormDescription>
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
            name="role_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol de acceso</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EMPLOYEE_ROLE_TYPES.map((roleType) => (
                      <SelectItem key={roleType} value={roleType}>
                        {EMPLOYEE_ROLE_DISPLAY[roleType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Define los permisos que tendrá el empleado en el sistema
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role descriptions */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
            <p className="font-medium">Permisos por rol:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>Ventas:</strong> Ver productos, crear ventas, ver clientes</li>
              <li><strong>Cajero:</strong> Todo lo de Ventas + procesar pagos</li>
              <li><strong>Supervisor:</strong> Todo lo de Cajero + reportes y gestión de empleados</li>
              <li><strong>Gerente:</strong> Acceso completo a la sucursal</li>
            </ul>
          </div>

          {account && (
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado de la cuenta</FormLabel>
                    <FormDescription>
                      {field.value ? 'La cuenta está activa' : 'La cuenta está desactivada'}
                    </FormDescription>
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
          )}
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {account ? 'Actualizar cuenta' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
