import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QRScanner } from './QRScanner';
import { Customer } from '@/types/customer';
import { QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'cash' | 'card' | 'transfer';

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
  }) => void;
}

export function PaymentModal({ isOpen, onClose, total, onPaymentComplete }: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [change, setChange] = useState(0);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  const handleQRScanned = async (customerId: string) => {
    try {
      // TODO: Implement API call to fetch customer data
      // For now using mock data
      const mockCustomer: Customer = {
        id: customerId,
        name: 'Cliente Ejemplo',
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
    // Lógica básica: 1 punto por cada 10 pesos gastados
    return Math.floor(total / 10);
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

    if (paymentMethod !== 'cash' && customer === null) {
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
        pointsEarned: customer ? pointsEarned : undefined
      });
      // Reset form
      setPaymentMethod('cash');
      setCashAmount('');
      setChange(0);
      setCustomer(null);
      setPointsEarned(0);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
        </DialogHeader>

        <QRScanner
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={handleQRScanned}
        />

        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => setIsQRScannerOpen(true)}
            className="w-full"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Escanear QR Cliente
          </Button>
        </div>

        {customer && (
          <div className="mb-4 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold">Cliente: {customer.name}</h3>
            <p className="text-sm">Puntos actuales: {customer.points}</p>
            <p className="text-sm text-green-600">Puntos a ganar: +{pointsEarned}</p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-3 gap-4 mt-2"
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
            </RadioGroup>
          </div>

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
            disabled={paymentMethod === 'cash' && (isNaN(parseFloat(cashAmount)) || parseFloat(cashAmount) < total)}
          >
            Procesar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
