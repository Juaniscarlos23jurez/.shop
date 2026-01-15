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
import { formatCurrency } from '@/lib/utils/currency';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { Textarea } from '@/components/ui/textarea';

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
  totalFollowedCompanies: number;
  totalCartProducts: number;
}

interface RecentSaleItem {
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  product?: {
    id: number;
    name: string;
    price: string;
  };
}

interface RecentSale {
  id: number;
  company_id: number;
  user_id: number;
  location_id: number;
  total: string;
  created_at: string;
  location?: {
    id: number;
    name: string;
  };
  items?: RecentSaleItem[];
}

interface FavoriteProduct {
  id: number;
  company_id: number;
  name: string;
  price: string;
  categories?: { id: number; name: string; slug: string }[];
  locations?: { id: number; name: string }[];
}

interface CartItem {
  id: number;
  product_name: string;
  product_description?: string;
  quantity: number;
  price: string;
  updated_at: string;
  status: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id || !token) return;
      setIsLoading(true);
      try {
        const response = await api.userCompanies.getFollowerDetail(id as string, token);
        if (response.success && (response as any).data?.status === 'success') {
          const payload = (response as any).data.data;
          const follower = payload.follower;

          const mapped: Client = {
            id: String(follower.customer_id),
            firstName: follower.customer_name,
            lastName: '',
            email: follower.customer_email,
            phone: follower.customer_phone || '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'México',
            birthdate: follower.customer_since,
            membership: follower.has_active_membership ? 'gold' : 'none',
            points: follower.points_balance ?? 0,
            totalSpent: follower.total_points_earned ?? 0,
            totalOrders: 0,
            lastPurchase: follower.following_since,
            isActive: !!follower.has_active_membership,
            acceptMarketing: true,
            notes: '',
            createdAt: follower.customer_since,
            updatedAt: follower.following_since,
            totalFollowedCompanies: follower.total_followed_companies_count || 0,
            totalCartProducts: follower.total_cart_products_count || 0,
          };

          setClient(mapped);
          setFormData(mapped);

          // Optional extra data from API: recent_sales and favorite_products
          const rs = (payload as any).recent_sales;
          if (Array.isArray(rs)) {
            setRecentSales(rs as RecentSale[]);
          } else {
            setRecentSales([]);
          }

          const fp = (payload as any).favorite_products;
          if (Array.isArray(fp)) {
            setFavoriteProducts(fp as FavoriteProduct[]);
          } else {
            setFavoriteProducts([]);
          }

          const ci = (payload as any).cart_items || (payload as any).cart;
          if (Array.isArray(ci)) {
            setCartItems(ci as CartItem[]);
          } else {
            // Data for demo based on user request if empty
            if (follower.total_cart_products_count > 0) {
              setCartItems([
                {
                  id: 1,
                  product_name: 'Miel de sol',
                  product_description: 'Bebida a tu elección más llavero',
                  quantity: 1,
                  price: '220.00',
                  updated_at: '2025-12-26 10:00:00',
                  status: 'Activo'
                }
              ]);
            } else {
              setCartItems([]);
            }
          }
        } else {
          console.error('Follower not found or not a follower of your company');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching follower detail:', error);
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, token, router]);

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
              <div className="flex gap-1.5 ml-2">
                {client.totalFollowedCompanies > 0 && (
                  <Badge
                    className="bg-green-500 hover:bg-green-600 text-white border-none"
                    title="Empresas seguidas"
                  >
                    {client.totalFollowedCompanies} empresas
                  </Badge>
                )}
                {client.totalCartProducts > 0 && (
                  <Badge
                    className="bg-blue-500 hover:bg-blue-600 text-white border-none"
                    title="Productos en el carrito"
                  >
                    {client.totalCartProducts} carrito
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
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

            </>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Fila de Estadísticas */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Carrito y Compras */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sección de Carrito */}
            <Card className="border-blue-200 bg-blue-50/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                    Carritos de Compra Activos
                  </CardTitle>
                  <CardDescription>Productos pendientes por comprar</CardDescription>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600 bg-white">
                  {cartItems.length} registros
                </Badge>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No hay productos en el carrito.</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border bg-white shadow-sm">
                        <div className="flex gap-3">
                          <div className="h-12 w-12 rounded bg-blue-50 flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{item.product_name}</h4>
                              <Badge className="bg-green-100 text-green-800 border-none text-[10px] h-4">
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.product_description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                              <span className="text-[10px] text-muted-foreground">Act: {format(new Date(item.updated_at), 'dd/MM/yy')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-bold text-blue-600">
                          {formatCurrency(parseFloat(item.price))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Estimado</p>
                        <p className="text-xl font-bold text-blue-700">
                          {formatCurrency(cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historial de Compras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Historial de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No hay historial de compras.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Sucursal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="text-xs">
                            {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yy HH:mm') : '-'}
                          </TableCell>
                          <TableCell>{(sale.items || []).length}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(Number(sale.total))}</TableCell>
                          <TableCell className="text-xs">{sale.location?.name || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Contacto, Puntos, Notas */}
          <div className="space-y-6">
            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Correo</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{client.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Teléfono</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{client.phone || 'No registrado'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fecha Nacimiento</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(new Date(client.birthdate), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Puntos */}
            <Card className="bg-yellow-50/30 border-yellow-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  Puntos
                  <Award className="h-4 w-4 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{client.points.toLocaleString()}</div>
                <p className="text-[10px] text-yellow-600">Puntos disponibles para canje</p>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    className="min-h-[100px] text-sm"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="text-sm p-3 bg-muted/30 rounded-md italic">
                    {client.notes || 'Sin notas adicionales.'}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <p className="text-[10px] text-muted-foreground">
                  Act: {format(new Date(client.updatedAt), 'dd/MM/yy')}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
