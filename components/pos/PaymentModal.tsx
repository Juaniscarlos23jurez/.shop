import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QRScanner } from './QRScanner';
import { Customer } from '@/types/customer';
import { QrCode } from 'lucide-react';
import { CustomerSearch } from './CustomerSearch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, pointRulesApi } from '@/lib/api/api';

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'points';

interface CustomerPoints {
  pointsEarned: number;
  newTotal: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (paymentData: {
    method: PaymentMethod;
    amount: number;
    change?: number;
    customerId?: string;
    pointsEarned?: number;
    note?: string;
  }) => void;
}

interface PointRule {
  id: number;
  company_id: number;
  spend_amount: string;
  points: number;
  starts_at: string;
  ends_at: string;
}

export function PaymentModal({ isOpen, onClose, total, onPaymentComplete }: PaymentModalProps) {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [change, setChange] = useState(0);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [pointRules, setPointRules] = useState<PointRule[]>([]);
  const [companyId, setCompanyId] = useState<string | number | null>(null);
  const [note, setNote] = useState("");

  // Fetch point rules when component mounts
  useEffect(() => {
    const fetchPointRules = async () => {
      console.log('PaymentModal: Checking point rules fetch conditions', { 
        isOpen, 
        hasToken: !!token, 
        userCompanyId: user?.company_id,
        resolvedCompanyId: companyId
      });
      
      if (!token) {
        console.log('PaymentModal: No token available');
        return;
      }
      
      // Try to get company_id from multiple sources
      let resolvedCompanyId: string | number | undefined = user?.company_id as any;
      
      if (!resolvedCompanyId) {
        console.log('PaymentModal: No company_id in user, trying to fetch from API');
        try {
          const companyResp = await api.userCompanies.get(token);
          if (companyResp.success) {
            const d: any = companyResp.data;
            const id = d?.company?.id ?? d?.id ?? d?.data?.company?.id ?? d?.data?.id;
            if (id) {
              resolvedCompanyId = id;
              setCompanyId(id);
              console.log('PaymentModal: Got company_id from userCompanies.get:', id);
            }
          }
        } catch (e) {
          console.error('PaymentModal: Error fetching company:', e);
        }
      } else {
        setCompanyId(resolvedCompanyId);
      }
      
      if (!resolvedCompanyId) {
        console.log('PaymentModal: Could not resolve company_id');
        return;
      }
      
      try {
        console.log('PaymentModal: Fetching point rules for company:', resolvedCompanyId);
        const response = await pointRulesApi.getPointRules(resolvedCompanyId, token);
        console.log('PaymentModal: Point rules response:', response);
        
        if (response.success && response.data) {
          setPointRules(response.data);
          console.log('PaymentModal: Point rules loaded:', response.data);
        } else {
          console.log('PaymentModal: No point rules data in response');
        }
      } catch (error) {
        console.error('PaymentModal: Error fetching point rules:', error);
      }
    };

    if (isOpen) {
      fetchPointRules();
    }
  }, [token, user?.company_id, isOpen]);

  // Recalculate points when customer or total changes
  useEffect(() => {
    if (customer && total > 0) {
      setPointsEarned(calculatePoints(total));
    }
  }, [customer, total, pointRules]);

  const handleCustomerSelected = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    const points = calculatePoints(total);
    setPointsEarned(points);
    
    toast({
      title: 'Cliente seleccionado',
      description: `${selectedCustomer.name} - ${selectedCustomer.points} puntos actuales. Ganará ${points.toFixed(1)} puntos`,
    });
  };

  const handleCustomerCleared = () => {
    setCustomer(null);
    setPointsEarned(0);
  };

  const handleQRScanned = async (customerId: string) => {
    try {
      // TODO: Implement API call to fetch customer data
      // For now using mock data
      const mockCustomer: Customer = {
        id: customerId,
        name: 'Cliente Escaneado',
        email: 'cliente@ejemplo.com',
        phone: '1234567890',
        points: 100,
      };
      setCustomer(mockCustomer);
      setPointsEarned(calculatePoints(total));
      setIsQRScannerOpen(false);

      toast({
        title: 'Cliente identificado',
        description: `${mockCustomer.name} - ${mockCustomer.points} puntos actuales`,
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo leer el código QR del cliente',
        variant: 'destructive'
      });
    }
  };

  const calculateChange = (amount: string) => {
    const amountNum = parseFloat(amount) || 0;
    setCashAmount(amount);
    setChange(amountNum - total);
  };

  const calculatePoints = (total: number): number => {
    if (pointRules.length === 0 || total <= 0) return 0;
    
    // Find the active rule (you can add date validation here if needed)
    const activeRule = pointRules.find(rule => {
      const now = new Date();
      const startsAt = new Date(rule.starts_at);
      const endsAt = new Date(rule.ends_at);
      return now >= startsAt && now <= endsAt;
    });
    
    if (!activeRule) {
      console.log('No active point rule found');
      return 0;
    }
    
    // Calculate points based on the rule: (total / spend_amount) * points
    const spendAmount = parseFloat(activeRule.spend_amount);
    const earnedPoints = (total / spendAmount) * activeRule.points;
    
    console.log(`Calculating points: $${total} / $${spendAmount} * ${activeRule.points} = ${earnedPoints.toFixed(1)} points`);
    
    // Return with one decimal place
    return Math.round(earnedPoints * 10) / 10;
  };

  const handleCustomerScanned = async (customerId: string) => {
    try {
      // TODO: Implement API call to fetch customer data
      // For now using mock data
      const mockCustomer: Customer = {
        id: customerId,
        name: 'Cliente Ejemplo',
        points: 100
      };
      setCustomer(mockCustomer);
      setPointsEarned(calculatePoints(total));
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) {
      toast({
        title: 'Error',
        description: 'El monto en efectivo debe ser mayor o igual al total',
        variant: 'destructive'
      });
      return;
    }

    if (paymentMethod === 'points') {
      if (!customer) {
        toast({
          title: 'Error',
          description: 'Debes seleccionar un cliente para pagar con puntos',
          variant: 'destructive'
        });
        return;
      }
      
      if (customer.points < total) {
        toast({
          title: 'Error',
          description: `Puntos insuficientes. El cliente tiene ${customer.points} puntos y necesita ${total.toFixed(1)} puntos`,
          variant: 'destructive'
        });
        return;
      }
    }

    if (paymentMethod !== 'cash' && paymentMethod !== 'points' && customer === null) {
      toast({
        description: 'Puedes escanear el QR del cliente para acumular puntos',
        variant: 'default'
      });
    }

    try {
      onPaymentComplete({
        method: paymentMethod,
        amount: paymentMethod === 'cash' ? parseFloat(cashAmount) : total,
        change: paymentMethod === 'cash' ? change : undefined,
        customerId: customer?.id,
        pointsEarned: paymentMethod === 'points' ? -total : (customer ? pointsEarned : undefined),
        note: note || undefined,
      });
      // Reset form
      setPaymentMethod('cash');
      setCashAmount('');
      setChange(0);
      setCustomer(null);
      setPointsEarned(0);
      setNote("");
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px] w-full">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
        </DialogHeader>

        <QRScanner
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={handleQRScanned}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Seleccionar Cliente</Label>
            <CustomerSearch 
              onSelect={handleCustomerSelected}
              onClear={handleCustomerCleared}
              selectedCustomer={customer}
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">O</span>
              <div className="flex-1 border-t" />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsQRScannerOpen(true)}
              className="w-full"
              type="button"
              size="sm"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Escanear QR Cliente
            </Button>
          </div>

          {customer && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {customer.phone}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Puntos actuales: {customer.points}
                  </p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Ganará: +{pointsEarned.toFixed(1)} pts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notas del vendedor - visible para todos los métodos */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="sale-note">Notas</Label>
          <Textarea
            id="sale-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Agrega instrucciones, comentarios o notas para esta venta..."
            className="min-h-24"
          />
        </div>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-4 gap-4 mt-2"
            >
              <div>
                <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                <Label
                  htmlFor="cash"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span>Efectivo</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span>Tarjeta</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                <Label
                  htmlFor="transfer"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span>Transferencia</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="points" 
                  id="points" 
                  className="peer sr-only" 
                  disabled={!customer || customer.points < total}
                />
                <Label
                  htmlFor="points"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Puntos</span>
                  {customer && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {customer.points} pts
                    </span>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'points' && customer && (
            <div className="space-y-2">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Puntos disponibles:</span>
                  <span className="text-lg font-bold">{customer.points} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total a pagar:</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Puntos después del pago:</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {(customer.points - total).toFixed(1)} pts
                    </span>
                  </div>
                </div>
                {customer.points < total && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                    Puntos insuficientes. Necesitas {(total - customer.points).toFixed(1)} puntos más.
                  </div>
                )}
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Efectivo Recibido</Label>
              <Input
                id="cashAmount"
                type="number"
                value={cashAmount}
                onChange={(e) => calculateChange(e.target.value)}
                placeholder="0.00"
                min={total}
                step="0.01"
              />
              {change >= 0 && (
                <div className="text-sm text-muted-foreground">
                  Cambio: ${change.toFixed(2)}
                </div>
              )}
              {change < 0 && (
                <div className="text-sm text-red-500">
                  El monto es menor al total
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total a Pagar:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              (paymentMethod === 'cash' && (isNaN(parseFloat(cashAmount)) || parseFloat(cashAmount) < total)) ||
              (paymentMethod === 'points' && (!customer || customer.points < total))
            }
          >
            Procesar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
