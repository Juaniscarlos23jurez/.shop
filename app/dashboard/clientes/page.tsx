'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, ArrowUpDown, Mail, Phone, User, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data for clients
const mockClients = [
  {
    id: '1',
    name: 'María García',
    email: 'maria.garcia@example.com',
    phone: '+52 55 1234 5678',
    membership: 'Gold',
    points: 1250,
    lastPurchase: '2024-02-10',
    totalSpent: 12500,
    status: 'active',
    avatar: '/placeholder-user.jpg',
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+52 55 8765 4321',
    membership: 'Plata',
    points: 750,
    lastPurchase: '2024-02-15',
    totalSpent: 8750,
    status: 'active',
    avatar: '/placeholder-user.jpg',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    phone: '+52 55 1357 2468',
    membership: 'Bronce',
    points: 250,
    lastPurchase: '2024-01-25',
    totalSpent: 3200,
    status: 'inactive',
    avatar: '/placeholder-user.jpg',
  },
  {
    id: '4',
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    phone: '+52 55 9876 5432',
    membership: 'Oro',
    points: 2000,
    lastPurchase: '2024-02-18',
    totalSpent: 21500,
    status: 'active',
    avatar: '/placeholder-user.jpg',
  },
  {
    id: '5',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@example.com',
    phone: '+52 55 2468 1357',
    membership: 'Plata',
    points: 500,
    lastPurchase: '2024-02-05',
    totalSpent: 6500,
    status: 'active',
    avatar: '/placeholder-user.jpg',
  },
];

export default function ClientesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => router.push('/dashboard/clientes/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium"
                      onClick={() => handleSort('name')}
                    >
                      Cliente
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium"
                      onClick={() => handleSort('membership')}
                    >
                      Membresía
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium ml-auto"
                      onClick={() => handleSort('points')}
                    >
                      Puntos
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium ml-auto"
                      onClick={() => handleSort('totalSpent')}
                    >
                      Total Gastado
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium ml-auto"
                      onClick={() => handleSort('lastPurchase')}
                    >
                      Última Compra
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">Estado</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback>
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="capitalize">
                        {client.membership.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">{client.points.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">puntos</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">{formatCurrency(client.totalSpent)}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.totalSpent > 0 ? `${Math.floor(client.totalSpent / 1000)}+ compras` : 'Sin compras'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">
                        {format(new Date(client.lastPurchase), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(client.lastPurchase), 'HH:mm', { locale: es })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/clientes/${client.id}`)}
                      >
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedClients.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No se encontraron clientes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No hay clientes que coincidan con tu búsqueda.
              </p>
              <div className="mt-6">
                <Button onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Ver todos los clientes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
