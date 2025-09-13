'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Mail, User, UserPlus, Settings, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}

const ROLES = [
  'Administrador',
  'Gerente',
  'Supervisor',
  'Cajero',
  'Vendedor',
  'Almacenista'
];

export default function BranchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Branch>>({});

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock branch data
        const mockBranch: Branch = {
          id: id as string,
          name: `Sucursal ${id}`,
          address: 'Av. Principal #123, Col. Centro',
          phone: '555-123-4567',
          email: `sucursal${id}@empresa.com`,
          isActive: true
        };

        // Mock employees data
        const mockEmployees: Employee[] = [
          {
            id: '1',
            name: 'Juan Pérez',
            email: 'juan.perez@empresa.com',
            role: 'Gerente',
            status: 'active',
            lastActive: 'Hace 2 horas'
          },
          {
            id: '2',
            name: 'María García',
            email: 'maria.garcia@empresa.com',
            role: 'Vendedor',
            status: 'active',
            lastActive: 'Hace 5 minutos'
          },
          {
            id: '3',
            name: 'Carlos López',
            email: 'carlos.lopez@empresa.com',
            role: 'Cajero',
            status: 'inactive',
            lastActive: 'Ayer'
          }
        ];

        setBranch(mockBranch);
        setEditData(mockBranch);
        setEmployees(mockEmployees);
      } catch (error) {
        console.error('Error fetching branch details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeEmail || !selectedRole) return;
    
    // In a real app, you would call your API to add the employee
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployeeEmail.split('@')[0],
      email: newEmployeeEmail,
      role: selectedRole,
      status: 'active',
      lastActive: 'Recién agregado'
    };

    setEmployees([...employees, newEmployee]);
    setNewEmployeeEmail('');
    setSelectedRole(ROLES[0]);
  };

  const handleUpdateBranch = () => {
    // In a real app, you would call your API to update the branch
    if (branch) {
      setBranch({ ...branch, ...editData });
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">Sucursal no encontrada</h2>
          <p className="text-gray-500 mt-2">La sucursal que buscas no existe o no tienes permiso para verla.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a sucursales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{branch.name}</h1>
          <p className="text-sm text-gray-500">ID: {branch.id}</p>
        </div>
        <Badge variant={branch.isActive ? 'default' : 'secondary'} className="mr-2">
          {branch.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancelar' : 'Editar sucursal'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Información de la sucursal</CardTitle>
                {isEditing && (
                  <Button size="sm" onClick={handleUpdateBranch}>
                    Guardar cambios
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nombre</label>
                    <Input 
                      value={editData.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Dirección</label>
                    <Input 
                      value={editData.address} 
                      onChange={(e) => setEditData({...editData, address: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Teléfono</label>
                      <Input 
                        value={editData.phone} 
                        onChange={(e) => setEditData({...editData, phone: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Correo electrónico</label>
                      <Input 
                        type="email"
                        value={editData.email} 
                        onChange={(e) => setEditData({...editData, email: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editData.isActive}
                      onChange={(e) => setEditData({...editData, isActive: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Sucursal activa
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Dirección</h3>
                      <p className="text-gray-600">{branch.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium">Teléfono</h3>
                      <a href={`tel:${branch.phone}`} className="text-blue-600 hover:underline">
                        {branch.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium">Correo electrónico</h3>
                      <a href={`mailto:${branch.email}`} className="text-blue-600 hover:underline">
                        {branch.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empleados</CardTitle>
              <CardDescription>
                Administra los empleados y sus roles en esta sucursal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="employees" onClick={() => setActiveTab('employees')}>
                    <User className="h-4 w-4 mr-2" />
                    Empleados ({employees.length})
                  </TabsTrigger>
                  <TabsTrigger value="add" onClick={() => setActiveTab('add')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar empleado
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="employees">
                  <div className="space-y-4">
                    {employees.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer empleado a esta sucursal.</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Acciones</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map((employee) => (
                              <tr key={employee.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-10 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                      <div className="text-sm text-gray-500">{employee.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{employee.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant={employee.status === 'active' ? 'default' : 'outline'}>
                                    {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="add">
                  <div className="max-w-md space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Agregar empleado</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Invita a un nuevo empleado a esta sucursal. Se le enviará un correo electrónico con instrucciones.
                      </p>
                    </div>
                    
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Correo electrónico
                        </label>
                        <Input
                          type="email"
                          id="email"
                          placeholder="correo@ejemplo.com"
                          value={newEmployeeEmail}
                          onChange={(e) => setNewEmployeeEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                          Rol
                        </label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
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
                        <p className="mt-1 text-xs text-gray-500">
                          Los permisos se asignarán según el rol seleccionado.
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Button type="submit" className="w-full">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Enviar invitación
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de actividad de la sucursal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Empleados activos</div>
                <div className="text-2xl font-semibold">
                  {employees.filter(e => e.status === 'active').length}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Total de roles</div>
                <div className="text-2xl font-semibold">
                  {new Set(employees.map(e => e.role)).size}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Estado</div>
                <div className="flex items-center mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full mr-2 ${branch.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span>{branch.isActive ? 'Operativa' : 'Inactiva'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configuración de sucursal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar empleados
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Desactivar sucursal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
