/**
 * Coupon Assignment Modal
 * 
 * A reusable component for assigning coupons to users or membership plans.
 * Can be integrated into the coupon management pages.
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api/api';
import { Coupon } from '@/types/api';
import { format } from 'date-fns';
import { CalendarIcon, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CouponAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon;
  companyId: string | number;
  token: string;
  onSuccess?: () => void;
}

export function CouponAssignmentModal({
  isOpen,
  onClose,
  coupon,
  companyId,
  token,
  onSuccess
}: CouponAssignmentModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'users' | 'membership'>('users');
  
  // User assignment state
  const [userIds, setUserIds] = useState('');
  
  // Membership assignment state
  const [membershipPlanIds, setMembershipPlanIds] = useState('');
  
  // Common state
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);

  const handleAssignToUsers = async () => {
    const ids = userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      toast({
        title: 'Error',
        description: 'Ingresa al menos un ID de usuario válido',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.coupons.assignToUsers(
        String(companyId),
        String(coupon.id),
        {
          user_ids: ids,
          expires_at: expiresAt?.toISOString()
        },
        token
      );

      if (response.success) {
        toast({
          title: 'Cupón asignado',
          description: `El cupón se asignó correctamente a ${ids.length} usuario(s)`,
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || 'Error al asignar cupón');
      }
    } catch (error) {
      console.error('Error assigning coupon to users:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo asignar el cupón',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignByMembership = async () => {
    const ids = membershipPlanIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      toast({
        title: 'Error',
        description: 'Ingresa al menos un ID de plan de membresía válido',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.coupons.assignByMembership(
        String(companyId),
        String(coupon.id),
        {
          membership_plan_ids: ids,
          expires_at: expiresAt?.toISOString()
        },
        token
      );

      if (response.success) {
        const usersAssigned = response.data?.users_assigned || 0;
        toast({
          title: 'Cupón asignado',
          description: `El cupón se asignó correctamente a ${usersAssigned} usuario(s) con membresía`,
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || 'Error al asignar cupón');
      }
    } catch (error) {
      console.error('Error assigning coupon by membership:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo asignar el cupón',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (assignmentType === 'users') {
      handleAssignToUsers();
    } else {
      handleAssignByMembership();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUserIds('');
      setMembershipPlanIds('');
      setExpiresAt(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignar Cupón</DialogTitle>
          <DialogDescription>
            Asigna el cupón <span className="font-semibold text-foreground">{coupon.code}</span> a usuarios específicos o por membresía
          </DialogDescription>
        </DialogHeader>

        <Tabs value={assignmentType} onValueChange={(v) => setAssignmentType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Por Usuario
            </TabsTrigger>
            <TabsTrigger value="membership" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Por Membresía
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="userIds">IDs de Usuarios</Label>
              <Input
                id="userIds"
                placeholder="Ej: 123, 456, 789"
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Ingresa los IDs de usuario separados por comas
              </p>
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="membershipIds">IDs de Planes de Membresía</Label>
              <Input
                id="membershipIds"
                placeholder="Ej: 1, 2, 3"
                value={membershipPlanIds}
                onChange={(e) => setMembershipPlanIds(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                El cupón se asignará a todos los usuarios con estas membresías activas
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Fecha de Expiración (Opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expiresAt && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiresAt ? format(expiresAt, "PPP") : "Sin fecha límite"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiresAt}
                onSelect={setExpiresAt}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Los usuarios podrán usar el cupón hasta esta fecha (opcional)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Asignando...' : 'Asignar Cupón'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
