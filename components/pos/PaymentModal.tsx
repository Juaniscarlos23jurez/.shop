import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QRScanner } from './QRScanner';
import { Customer } from '@/types/customer';
import { QrCode, TicketPercent } from 'lucide-react';
import { CustomerSearch } from './CustomerSearch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, pointRulesApi } from '@/lib/api/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Coupon } from '@/types/api';

interface AppliedCoupon extends Coupon {
  discountAmount: number;
  finalAmount: number;
}

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'points';

interface CustomerPoints {
  pointsEarned: number;
  newTotal: number;
}

interface FollowerData {
  company_id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_fcm_token?: string;
  customer_profile_photo_path?: string;
  customer_since: string;
  following_since: string;
  points_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  membership_id: number | null;
  membership_name: string | null;
  membership_description: string | null;
  membership_price: string | null;
  has_active_membership: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (paymentData: {
    method: PaymentMethod;
    amount: number;
    change?: number;
    userId?: string;
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [discountedTotal, setDiscountedTotal] = useState(total);
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [customerPointsBalance, setCustomerPointsBalance] = useState<number | null>(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  // Debug: Log customer state changes
  useEffect(() => {
    console.log('🟡 Customer state changed:', customer);
    if (customer) {
      console.log('🟡 Customer points:', customer.points);
      console.log('🟡 Customer points balance:', customerPointsBalance);
    }
  }, [customer, customerPointsBalance]);

  // Fetch point rules when component mounts
  useEffect(() => {
    const fetchData = async () => {
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
      
      // Fetch point rules
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
      fetchData();
    }
  }, [token, user?.company_id, isOpen]);

  // Fetch user-specific coupons when customer is selected
  useEffect(() => {
    const fetchUserCoupons = async () => {
      if (!token || !companyId || !customer) {
        // If no customer, fetch public coupons
        if (!customer && token && companyId) {
          try {
            setIsLoadingCoupons(true);
            const response = await api.coupons.getCoupons(String(companyId), token);
            
            if (response.success && response.data?.data?.data) {
              // Filter only public, active coupons
              const publicCoupons = response.data.data.data.filter((coupon: Coupon) => {
                const now = new Date();
                const startsAt = new Date(coupon.starts_at);
                const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
                return (
                  coupon.is_active &&
                  coupon.is_public &&
                  now >= startsAt &&
                  (!expiresAt || now <= expiresAt) &&
                  (!coupon.usage_limit || (coupon.usage_count || 0) < coupon.usage_limit)
                );
              });
              setCoupons(publicCoupons);
            }
          } catch (error) {
            console.error('PaymentModal: Error fetching public coupons:', error);
          } finally {
            setIsLoadingCoupons(false);
          }
        }
        return;
      }

      try {
        setIsLoadingCoupons(true);
        console.log('PaymentModal: Fetching user coupons for customer:', customer.id);
        const response = await api.coupons.getUserCoupons(String(companyId), String(customer.id), token);
        
        if (response.success && response.data?.coupons) {
          setCoupons(response.data.coupons);
          console.log('PaymentModal: User coupons loaded:', response.data.coupons);
        } else {
          console.log('PaymentModal: No user coupons available');
          setCoupons([]);
        }
      } catch (error) {
        console.error('PaymentModal: Error fetching user coupons:', error);
        setCoupons([]);
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    if (isOpen) {
      fetchUserCoupons();
    }
  }, [token, companyId, customer, isOpen]);

  // Recalculate points when customer, total, or selected coupon changes
  useEffect(() => {
    if (customer && total > 0) {
      setPointsEarned(calculatePoints(selectedCoupon ? discountedTotal : total));
    }
  }, [customer, total, pointRules, selectedCoupon, discountedTotal]);
  
  // Update discounted total when total or selected coupon changes
  useEffect(() => {
    if (selectedCoupon) {
      // Only update if the total has actually changed to prevent unnecessary re-renders
      const newDiscountedTotal = calculateDiscountedTotal(selectedCoupon, total);
      if (newDiscountedTotal !== discountedTotal) {
        setDiscountedTotal(newDiscountedTotal);
      }
    } else if (discountedTotal !== total) {
      setDiscountedTotal(total);
    }
  }, [total, selectedCoupon?.id]); // Only depend on the coupon ID, not the entire coupon object
  
  const calculateDiscountedTotal = (coupon: Coupon, currentTotal: number) => {
    let discount = 0;
    
    if (coupon.type === 'fixed_amount' && coupon.discount_amount) {
      discount = typeof coupon.discount_amount === 'string' 
        ? parseFloat(coupon.discount_amount) 
        : coupon.discount_amount;
    } else if (coupon.type === 'percentage' && coupon.discount_percentage) {
      discount = (currentTotal * coupon.discount_percentage) / 100;
    }
    // For free_shipping, we don't modify the total here as it's handled separately
    
    return Math.max(0, currentTotal - discount);
  };

  const applyCouponByCode = async (code: string) => {
    if (!companyId || !token) {
      toast({
        title: 'Error',
        description: 'No se pudo validar el cupón',
        variant: 'destructive'
      });
      return;
    }

    setIsValidatingCoupon(true);

    try {
      const validationData = {
        code,
        user_id: customer?.id,
        subtotal: total
      };

      const response = await api.coupons.validateCoupon(
        String(companyId),
        validationData,
        token
      );

      if (response.success && response.data?.valid && response.data.coupon) {
        const { coupon, discount_amount, final_subtotal } = response.data;
        
        setSelectedCoupon({
          ...coupon,
          discountAmount: discount_amount || 0,
          finalAmount: final_subtotal || total
        });
        
        setDiscountedTotal(final_subtotal || total);
        setCouponCode('');
        
        toast({
          title: 'Cupón aplicado',
          description: `Se aplicó el cupón ${code} con un descuento de $${(discount_amount || 0).toFixed(2)}`,
        });
      } else {
        const errors = response.data?.errors || ['Cupón inválido'];
        toast({
          title: 'Cupón no válido',
          description: errors[0] || 'El cupón no es válido para esta compra',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: 'Error',
        description: 'No se pudo validar el cupón',
        variant: 'destructive'
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const applyCoupon = async (coupon: Coupon) => {
    await applyCouponByCode(coupon.code);
  };
  
  const removeCoupon = useCallback(() => {
    setSelectedCoupon(null);
    setDiscountedTotal(total);
    
    toast({
      title: 'Cupón eliminado',
      description: 'El cupón ha sido eliminado',
    });
  }, [total]);

  const handleCustomerSelected = async (selectedCustomer: Customer) => {
    console.log('🔵 PaymentModal: handleCustomerSelected called');
    console.log('🔵 Selected customer:', selectedCustomer);
    console.log('🔵 Customer points:', selectedCustomer.points);
    
    setCustomer(selectedCustomer);
    setCustomerPointsBalance(selectedCustomer.points);
    const points = calculatePoints(total);
    setPointsEarned(points);
    
    console.log('🔵 Customer state set with points:', selectedCustomer.points);
    console.log('🔵 Points to be earned:', points);
    
    toast({
      title: 'Cliente seleccionado',
      description: `${selectedCustomer.name} - ${selectedCustomer.points} puntos actuales. Ganará ${points.toFixed(1)} puntos`,
    });
    
    // Optionally fetch fresh data in the background
    if (token) {
      setIsLoadingPoints(true);
      console.log('🔵 Fetching fresh customer data from API...');
      try {
        const response = await api.userCompanies.getFollowers(token);
        console.log('🔵 API Response:', response);
        if (response.success && response.data?.followers) {
          const follower = response.data.followers.find(
            (f: FollowerData) => f.customer_id === parseInt(selectedCustomer.id)
          );
          console.log('🔵 Found follower:', follower);
          if (follower && follower.points_balance !== selectedCustomer.points) {
            console.log('🔵 Updating points from', selectedCustomer.points, 'to', follower.points_balance);
            setCustomerPointsBalance(follower.points_balance);
            // Update the customer object with fresh points
            setCustomer({
              ...selectedCustomer,
              points: follower.points_balance
            });
          } else {
            console.log('🔵 Points are already up to date or follower not found');
          }
        }
      } catch (error) {
        console.error('🔴 Error fetching customer points:', error);
      } finally {
        setIsLoadingPoints(false);
      }
    }
  };

  const handleCustomerCleared = () => {
    setCustomer(null);
    setPointsEarned(0);
    setCustomerPointsBalance(null);
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

  const handleSubmit = async () => {
    const currentTotal = selectedCoupon ? discountedTotal : total;
    console.log('PaymentModal: handleSubmit called', { 
      paymentMethod, 
      customer, 
      total,
      discountedTotal,
      selectedCoupon,
      currentTotal
    });
    
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < currentTotal)) {
      toast({
        title: 'Error',
        description: `El monto en efectivo debe ser mayor o igual al total ($${currentTotal.toFixed(2)})`,
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
      const paymentData = {
        method: paymentMethod,
        amount: paymentMethod === 'cash' ? parseFloat(cashAmount) : currentTotal,
        change: paymentMethod === 'cash' ? change : undefined,
        userId: customer?.id,
        pointsEarned: paymentMethod === 'points' ? -currentTotal : (customer ? pointsEarned : undefined),
        note: note || undefined,
        couponCode: selectedCoupon?.code,
        coupon: selectedCoupon ? {
          id: selectedCoupon.id,
          code: selectedCoupon.code,
          discount: selectedCoupon.discountAmount,
          type: selectedCoupon.type
        } : undefined
      };
      
      console.log('PaymentModal: Calling onPaymentComplete with:', paymentData);
      
      await onPaymentComplete(paymentData);
      
      console.log('PaymentModal: onPaymentComplete finished successfully');
      
      // Reset form
      setPaymentMethod('cash');
      setCashAmount('');
      setChange(0);
      setCustomer(null);
      setPointsEarned(0);
      setNote("");
      setSelectedCoupon(null);
      setDiscountedTotal(total);
      setCouponCode('');
      onClose();
    } catch (error) {
      console.error('PaymentModal: Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar el pago',
        variant: 'destructive'
      });
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
                    Puntos actuales: {isLoadingPoints ? (
                      <span className="inline-block animate-pulse">...</span>
                    ) : (
                      <span className="font-bold">
                        {customerPointsBalance !== null ? customerPointsBalance : customer.points}
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Ganará: +{pointsEarned.toFixed(1)} pts
                  </p>
                  {customerPointsBalance !== null && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Total después: {(customerPointsBalance + pointsEarned).toFixed(1)} pts
                    </p>
                  )}
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-normal">Cupón de descuento</Label>
            </div>
            
            {!selectedCoupon ? (
              <div className="space-y-2">
                {/* Manual coupon code input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Código de cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                    disabled={isValidatingCoupon}
                  />
                  <Button
                    onClick={() => applyCouponByCode(couponCode)}
                    disabled={!couponCode || isValidatingCoupon}
                    variant="outline"
                  >
                    {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                  </Button>
                </div>
                
                {/* Available coupons dropdown */}
                {coupons.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">o selecciona uno</span>
                    </div>
                  </div>
                )}
                
                <Select 
                  onValueChange={(value) => {
                    const coupon = coupons.find(c => c.id === parseInt(value));
                    if (coupon) applyCoupon(coupon);
                  }}
                  disabled={isLoadingCoupons || coupons.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingCoupons ? "Cargando cupones..." : coupons.length > 0 ? "Seleccionar cupón disponible" : "No hay cupones disponibles"} />
                  </SelectTrigger>
                  <SelectContent>
                    {coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <SelectItem 
                          key={coupon.id} 
                          value={coupon.id.toString()}
                          className="flex flex-col items-start"
                        >
                          <div className="font-medium">{coupon.code}</div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.type === 'fixed_amount' && `$${typeof coupon.discount_amount === 'string' ? parseFloat(coupon.discount_amount).toFixed(2) : coupon.discount_amount?.toFixed(2)} de descuento`}
                            {coupon.type === 'percentage' && `${coupon.discount_percentage}% de descuento`}
                            {coupon.type === 'free_shipping' && 'Envío gratis'}
                            {coupon.type === 'buy_x_get_y' && 'Compra y lleva más'}
                            {coupon.type === 'free_item' && 'Producto gratis'}
                            {coupon.min_purchase_amount && ` (Mín. $${typeof coupon.min_purchase_amount === 'string' ? parseFloat(coupon.min_purchase_amount).toFixed(2) : coupon.min_purchase_amount?.toFixed(2)})`}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        No hay cupones disponibles
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md flex items-center gap-1">
                  <TicketPercent className="h-4 w-4" />
                  {selectedCoupon.code}
                  {selectedCoupon.discountAmount > 0 && (
                    <span className="ml-1">-${selectedCoupon.discountAmount.toFixed(2)}</span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeCoupon}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Quitar
                </Button>
              </div>
            )}
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {selectedCoupon && selectedCoupon.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Descuento ({selectedCoupon.code}):</span>
                  <span>-${selectedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total a Pagar:</span>
                <div className="flex items-center gap-2">
                  {selectedCoupon && selectedCoupon.discountAmount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${total.toFixed(2)}
                    </span>
                  )}
                  <span className={selectedCoupon ? "text-lg font-bold text-green-600 dark:text-green-400" : ""}>
                    ${(selectedCoupon ? discountedTotal : total).toFixed(2)}
                  </span>
                </div>
              </div>
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
              (paymentMethod === 'cash' && (isNaN(parseFloat(cashAmount)) || parseFloat(cashAmount) < (selectedCoupon ? discountedTotal : total))) ||
              (paymentMethod === 'points' && (!customer || customer.points < (selectedCoupon ? discountedTotal : total)))
            }
          >
            Procesar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
