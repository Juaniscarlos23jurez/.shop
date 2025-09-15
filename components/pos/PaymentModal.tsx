import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PaymentMethod = 'cash' | 'card' | 'transfer';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (paymentData: {
    method: PaymentMethod;
    amount: number;
    change?: number;
  }) => void;
}

export function PaymentModal({ isOpen, onClose, total, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [change, setChange] = useState(0);

  const calculateChange = (amount: string) => {
    const amountNum = parseFloat(amount) || 0;
    setCashAmount(amount);
    setChange(amountNum - total);
  };

  const handleSubmit = () => {
    onPaymentComplete({
      method: paymentMethod,
      amount: paymentMethod === 'cash' ? parseFloat(cashAmount) : total,
      change: paymentMethod === 'cash' ? change : undefined
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
        </DialogHeader>
        
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
