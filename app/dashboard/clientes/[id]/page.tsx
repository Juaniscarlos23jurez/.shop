'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Mail, Phone, MapPin, User, Edit, Trash2, CreditCard, ShoppingCart, History, Tag, Award, Plus, Check, X, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  birthdate: string;
  membership: 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';
  points: number;
  totalSpent: number;
  totalOrders: number;
  lastPurchase: string;
  isActive: boolean;
  acceptMarketing: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  items: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'earn' | 'redeem' | 'expire';
  balance: number;
}

const mockClient: Client = {
  id: '1',
  firstName: 'María',
  lastName: 'García',
  email: 'maria.garcia@example.com',
  phone: '+52 55 1234 5678',
  address: 'Av. Insurgentes Sur 1234',
  city: 'Ciudad de México',
  state: 'Ciudad de México',
  zipCode: '03100',
  country: 'México',
  birthdate: '1990-05-15',
  membership: 'gold',
  points: 1250,
  totalSpent: 12500,
  totalOrders: 27,
  lastPurchase: '2024-02-10T14:30:00-06:00',
  isActive: true,
  acceptMarketing: true,
  notes: 'Cliente frecuente, prefiere contacto por email.',
  createdAt: '2023-01-15T10:00:00-06:00',
  updatedAt: '2024-02-10T14:30:00-06:00',
};

const mockOrders: Order[] = [
  { id: 'ORD-1001', date: '2024-02-10T14:30:00-06:00', total: 1250, status: 'completed', items: 3 },
  { id: 'ORD-0998', date: '2024-01-28T11:15:00-06:00', total: 875, status: 'completed', items: 2 },
  { id: 'ORD-0987', date: '2024-01-15T16:45:00-06:00', total: 2300, status: 'completed', items: 5 },
  { id: 'ORD-0975', date: '2024-01-02T09:30:00-06:00', total: 650, status: 'completed', items: 2 },
  { id: 'ORD-0963', date: '2023-12-20T13:20:00-06:00', total: 3200, status: 'completed', items: 7 },
];

const mockTransactions: Transaction[] = [
  { id: 'TXN-1001', date: '2024-02-10T14:30:00-06:00', description: 'Compra #ORD-1001', amount: 125, type: 'earn', balance: 1250 },
  { id: 'TXN-0998', date: '2024-01-28T11:15:00-06:00', description: 'Compra #ORD-0998', amount: 87, type: 'earn', balance: 1125 },
  { id: 'TXN-0987', date: '2024-01-15T16:45:00-06:00', description: 'Canje de puntos', amount: -250, type: 'redeem', balance: 1038 },
  { id: 'TXN-0975', date: '2024-01-02T09:30:00-06:00', description: 'Compra #ORD-0975', amount: 65, type: 'earn', balance: 1288 },
  { id: 'TXN-0963', date: '2023-12-20T13:20:00-06:00', description: 'Compra #ORD-0963', amount: 320, type: 'earn', balance: 1223 },
];

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API fetch
    const fetchClient = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch the client data here
        await new Promise(resolve => setTimeout(resolve, 500));
        setClient(mockClient);
        setFormData(mockClient);
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save the updated client data here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClient(prev => ({ ...prev, ...formData } as Client));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMembershipBadge = (membership: string) => {
    switch (membership) {
      case 'platinum':
        return <Badge className="bg-purple-100 text-purple-800">Platino</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-100 text-yellow-800">Oro</Badge>;
      case 'silver':
        return <Badge className="bg-gray-200 text-gray-800">Plata</Badge>;
      case 'bronze':
        return <Badge className="bg-amber-100 text-amber-800">Bronce</Badge>;
      default:
        return <Badge variant="outline">Sin membresía</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'redeem':
        return <Tag className="h-4 w-4 text-blue-500" />;
      case 'expire':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {client.firstName} {client.lastName}
              </h1>
              {getMembershipBadge(client.membership)}
              {client.isActive ? (
                <Badge className="bg-green-100 text-green-800">Activo</Badge>
              ) : (
                <Badge variant="outline">Inactivo</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Cliente desde {format(new Date(client.createdAt), 'PPP', { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" onClick={() => router.push(`/dashboard/ventas/nueva?clientId=${client.id}`)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Nueva Venta
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="orders">Compras</TabsTrigger>
          <TabsTrigger value="points">Puntos</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(client.totalSpent)}</div>
                <p className="text-xs text-muted-foreground">
                  {client.totalOrders} {client.totalOrders === 1 ? 'compra' : 'compras'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Puntos Acumulados</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.points.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {client.points > 0 ? `Equivalente a ${formatCurrency(client.points * 10)}` : 'Sin puntos'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Compra</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(client.lastPurchase), 'dd MMM yyyy', { locale: es })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hace {Math.floor((new Date().getTime() - new Date(client.lastPurchase).getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membresía</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{client.membership === 'none' ? 'Sin membresía' : client.membership}</div>
                <p className="text-xs text-muted-foreground">
                  {client.acceptMarketing ? 'Acepta promociones' : 'No acepta promociones'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>Detalles de contacto del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Correo electrónico</Label>
                  {isEditing ? (
                    <Input
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${client.email}`} className="hover:underline">
                        {client.email}
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  {isEditing ? (
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${client.phone.replace(/\D/g, '')}`} className="hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        name="address"
                        placeholder="Calle y número"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          name="city"
                          placeholder="Ciudad"
                          value={formData.city || ''}
                          onChange={handleInputChange}
                        />
                        <Input
                          name="state"
                          placeholder="Estado"
                          value={formData.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          name="zipCode"
                          placeholder="Código Postal"
                          value={formData.zipCode || ''}
                          onChange={handleInputChange}
                        />
                        <Input
                          name="country"
                          placeholder="País"
                          value={formData.country || ''}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{client.address}</p>
                        <p>
                          {client.city}, {client.state} {client.zipCode}
                        </p>
                        <p>{client.country}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Nacimiento</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate?.split('T')[0] || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(client.birthdate), 'PPP', { locale: es })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas transacciones del cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'PPp', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'earn' ? '+' : ''}
                          {transaction.amount} pts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saldo: {transaction.balance} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="ghost" className="w-full" onClick={() => setActiveTab('points')}>
                  Ver todos los puntos
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
              <CardDescription>Lista de todas las compras realizadas por el cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID de Orden</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.date), 'PPp', { locale: es })}
                      </TableCell>
                      <TableCell>{order.items} {order.items === 1 ? 'producto' : 'productos'}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/ventas/${order.id}`)}>
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Puntos de Fidelidad</CardTitle>
                  <CardDescription>Historial de puntos ganados y canjeados</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{client.points.toLocaleString()}</span>
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earn' ? 'bg-green-100' : 
                        transaction.type === 'redeem' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'earn' ? 'Puntos ganados' : 
                           transaction.type === 'redeem' ? 'Puntos canjeados' : 'Puntos expirados'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description} • {format(new Date(transaction.date), 'PPp', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earn' ? '+' : '-'}
                        {Math.abs(transaction.amount)} pts
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Saldo: {transaction.balance} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notas del Cliente</CardTitle>
              <CardDescription>Información adicional y comentarios</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  className="min-h-[200px]"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Agrega notas sobre el cliente, preferencias, alergias, etc."
                />
              ) : (
                <div className="whitespace-pre-line p-4 bg-muted/50 rounded-lg min-h-[200px]">
                  {client.notes || 'No hay notas para este cliente.'}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Última actualización: {format(new Date(client.updatedAt), 'PPp', { locale: es })}
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar notas
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
