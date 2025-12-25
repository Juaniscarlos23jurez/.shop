'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, ArrowUpDown, Mail, Phone, User, Calendar as CalendarIcon, Loader2, CheckCircle, XCircle, Smartphone, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';

interface Follower {
  company_id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_email_verified?: number;
  customer_login_provider?: string;
  customer_fcm_token?: string;
  customer_profile_photo_path?: string;
  has_push_notifications_enabled?: number;
  customer_since: string;
  following_since: string;
  points_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  membership_id: number | null;
  membership_name: string | null;
  membership_description: string | null;
  membership_price: string | null;
  has_active_membership: number; // 0 or 1
}

interface ApiResponseData {
  company: {
    id: number;
    name: string;
  };
  summary: {
    total_followers: number;
    followers_with_membership: number;
    followers_without_membership: number;
  };
  followers: Follower[];
}

interface ApiResponse {
  success: boolean;
  data: {
    status: string;
    data: ApiResponseData;
    message?: string;
  };
  status: number;
  statusText: string;
  message?: string;
}

// Define sortable fields explicitly to ensure type safety
type SortableField = keyof Pick<Follower, 'customer_name' | 'customer_email' | 'following_since' | 'customer_since' | 'membership_name'>;

export default function ClientesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponseData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'with_membership' | 'without_membership'>('all');
  
  const [sortConfig, setSortConfig] = useState<{ key: SortableField; direction: 'asc' | 'desc' }>({
    key: 'following_since',
    direction: 'desc',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error('No authentication token available');
        setError('No se pudo autenticar. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      try {
        console.log('Fetching followers data...');
        setIsLoading(true);
        
        console.log('Using token:', token.substring(0, 10) + '...');
        
        const response = await api.userCompanies.getFollowers(token);
        console.log('API Response:', response);
        
        if (response && response.success && response.data) {
          // The API returns data with the wrapper structure
          const responseData = response.data.data as ApiResponseData;
          console.log('API Response Data:', responseData);
          
          setData(responseData);
        } else {
          const errorMsg = response?.message || 'Error al procesar la respuesta del servidor';
          console.error('API Error:', errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching followers:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setError(`Error al conectar con el servidor: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSort = (key: SortableField) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredClients = data?.followers?.filter((follower) => {
    const matchesSearch = 
      follower.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      follower.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (follower.customer_phone || '').includes(searchTerm);
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'with_membership') return matchesSearch && follower.has_active_membership === 1;
    if (statusFilter === 'without_membership') return matchesSearch && follower.has_active_membership !== 1;
    
    return matchesSearch;
  }) || [];

  const sortedClients = [...filteredClients].sort((a, b) => {
    const { key, direction } = sortConfig;
    
    // Type guard to ensure we only access valid properties
    const getValue = (item: Follower, k: SortableField): string | number | null => {
      const value = item[k];
      return value;
    };
    
    const aValue = getValue(a, key);
    const bValue = getValue(b, key);
    
    // Handle null or undefined values
    if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
    if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;
    
    // Convert to string for consistent comparison
    const strA = String(aValue).toLowerCase();
    const strB = String(bValue).toLowerCase();
    
    if (strA < strB) return direction === 'asc' ? -1 : 1;
    if (strA > strB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (hasActiveMembership: number) => {
    return hasActiveMembership === 1 ? (
      <Badge className="bg-green-100 text-green-800">Con membresía</Badge>
    ) : (
      <Badge variant="outline">Sin membresía</Badge>
    );
  };

  const formatCurrency = (amount: string | number | null): string => {
    if (amount === null || amount === undefined) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy HH:mm', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            {data?.company?.name ? `Clientes de ${data.company.name}` : 'Gestiona la información de tus clientes'}
          </p>
          {data?.summary && (
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Total: {data.summary.total_followers}</span>
              <span>Con membresía: {data.summary.followers_with_membership}</span>
              <span>Sin membresía: {data.summary.followers_without_membership}</span>
            </div>
          )}
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => router.push('/dashboard/clientes/nuevo')} 
          disabled={!token}
        >
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'with_membership' | 'without_membership')}
                disabled={isLoading}
              >
                <option value="all">Todos los clientes</option>
                <option value="with_membership">Con membresía</option>
                <option value="without_membership">Sin membresía</option>
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
                      onClick={() => handleSort('customer_name')}
                    >
                      Cliente
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium"
                      onClick={() => handleSort('membership_name')}
                    >
                      Membresía
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <div className="font-medium">
                      Precio
                    </div>
                  </th>
                  <th className="text-right py-3 px-4">
                    <div className="font-medium">
                      Puntos
                    </div>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium ml-auto"
                      onClick={() => handleSort('customer_since')}
                    >
                      Cliente desde
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button 
                      className="flex items-center gap-1 font-medium ml-auto"
                      onClick={() => handleSort('following_since')}
                    >
                      Siguiendo desde
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">Estado</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedClients.map((client) => (
                  <tr key={client.customer_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.customer_profile_photo_path || "/placeholder-user.jpg"} alt={client.customer_name} />
                          <AvatarFallback>
                            {client.customer_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {client.customer_name}
                            {client.customer_email_verified === 1 && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.customer_email}
                          </div>
                          {client.customer_phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.customer_phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {client.customer_login_provider === 'google.com' && '🇬 Google'}
                              {client.customer_login_provider === 'apple.com' && '🍎 Apple'}
                              {!client.customer_login_provider && '📧 Email'}
                            </Badge>
                            {client.has_push_notifications_enabled === 1 ? (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                <Smartphone className="h-3 w-3 mr-1" />
                                Notificaciones
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                <XCircle className="h-3 w-3 mr-1" />
                                Sin notificaciones
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {client.membership_name ? (
                        <div>
                          <div className="font-medium">{client.membership_name}</div>
                          {client.membership_description && (
                            <div className="text-xs text-muted-foreground">
                              {client.membership_description}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin membresía</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">
                        {client.membership_name && client.membership_price
                          ? formatCurrency(client.membership_price)
                          : '—'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">
                        {client.points_balance || 0}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm">
                        {formatDate(client.customer_since)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm">
                        {formatDate(client.following_since)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {getStatusBadge(client.has_active_membership)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/clientes/${client.customer_id}`)}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron clientes que coincidan con tu búsqueda'
                  : 'Aún no tienes clientes registrados'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Intenta con otros términos de búsqueda o filtros.'
                  : 'Los clientes que sigan tu negocio aparecerán aquí.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Ver todos los clientes
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}