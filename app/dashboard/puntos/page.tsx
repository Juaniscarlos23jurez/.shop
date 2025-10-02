"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, pointRulesApi } from "@/lib/api/api";

type PointsRule = {
  id: string;
  company_id: number;
  spend_amount: string;
  points: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  metadata?: { nota?: string };
  created_at: string;
  updated_at: string;
};

type PointsConfig = {
  isEnabled: boolean;
  rules: PointsRule[];
};

export default function PointsConfiguration() {
  const { token, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({ 
    spend_amount: '',
    points: '',
    is_active: true,
    starts_at: '',
    ends_at: '',
    note: ''
  });
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [config, setConfig] = useState<PointsConfig>({
    isEnabled: false,
    rules: [],
  });
  const [editingRule, setEditingRule] = useState<PointsRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const sortRules = (rules: PointsRule[]) => {
    return [...rules].sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return parseFloat(a.spend_amount) - parseFloat(b.spend_amount);
    });
  };

  const fetchRules = async () => {
    if (loading) return;
    if (!token) {
      setIsLoading(false);
      return;
    }
    let companyId: string | number | undefined = user?.company_id as any;
    if (!companyId) {
      try {
        const companyResp = await api.userCompanies.get(token);
        if (companyResp.success) {
          const d: any = companyResp.data;
          const id = d?.company?.id ?? d?.id ?? d?.data?.company?.id ?? d?.data?.id;
          if (id) {
            companyId = id;
            setResolvedCompanyId(companyId as string | number);
          }
        }
      } catch (e) {
        console.error('Error fetching company:', e);
      }

      if (!companyId) {
        try {
          const prof = await api.auth.getProfile(token);
          if (prof.success) {
            const pid = (prof.data as any)?.company_id;
            if (pid) {
              companyId = pid;
              setResolvedCompanyId(companyId as string | number);
            }
          }
        } catch (e) {
          console.error('Error fetching profile:', e);
        }
      }

      if (!companyId) {
        try {
          const list = await api.companies.getAllCompanies(token);
          if (list.success && Array.isArray(list.data) && list.data.length > 0) {
            const first = list.data[0];
            const lid = first?.id || first?.company_id;
            if (lid) {
              companyId = lid;
              setResolvedCompanyId(companyId as string | number);
            }
          }
        } catch (e) {
          console.error('Error fetching companies:', e);
        }
      }

      if (!companyId) {
        setIsLoading(false);
        return;
      }
    } else {
      setResolvedCompanyId(companyId as string | number);
    }

    try {
      setIsLoading(true);
      const resp = await pointRulesApi.getPointRules(companyId!, token);
      const apiRules = Array.isArray(resp?.data) ? resp.data : [];

      setConfig(prev => ({
        ...prev,
        isEnabled: apiRules.length > 0,
        rules: sortRules(apiRules),
      }));
    } catch (error: any) {
      console.error('Error fetching point rules:', error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo cargar las reglas de puntos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [loading, token, user?.company_id]);

  const addRule = async () => {
    const spendAmount = parseFloat(newRule.spend_amount);
    const points = parseInt(newRule.points);

    if (!newRule.spend_amount || !newRule.points || spendAmount <= 0 || points < 0) {
      toast({
        title: "Error",
        description: "El monto debe ser > 0 y los puntos >= 0",
        variant: "destructive",
      });
      return;
    }

    if (newRule.starts_at && newRule.ends_at) {
      const s = new Date(newRule.starts_at);
      const e = new Date(newRule.ends_at);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || e.getTime() < s.getTime()) {
        toast({ 
          title: 'Error', 
          description: 'La fecha de fin debe ser posterior o igual a la de inicio', 
          variant: 'destructive' 
        });
        return;
      }
    }

    if (!token) {
      toast({ title: 'Error', description: 'Falta token', variant: 'destructive' });
      return;
    }

    const companyId = (resolvedCompanyId ?? user?.company_id) as string | number | undefined;
    if (!companyId) {
      toast({ title: 'Error', description: 'No se pudo resolver la compañía', variant: 'destructive' });
      return;
    }

    try {
      setIsCreating(true);
      const starts_at = newRule.starts_at ? new Date(newRule.starts_at).toISOString() : null;
      const ends_at = newRule.ends_at ? new Date(newRule.ends_at).toISOString() : null;
      const metadata = newRule.note ? { nota: newRule.note } : undefined;

      const payload: any = {
        spend_amount: spendAmount,
        points: points,
        is_active: newRule.is_active,
      };

      if (starts_at) payload.starts_at = starts_at;
      if (ends_at) payload.ends_at = ends_at;
      if (metadata) payload.metadata = metadata;

      await pointRulesApi.createPointRule(companyId, payload, token);

      toast({
        title: 'Regla creada',
        description: 'La regla de puntos fue creada correctamente',
      });

      await fetchRules();

      setNewRule({ 
        spend_amount: '', 
        points: '', 
        is_active: true, 
        starts_at: '', 
        ends_at: '', 
        note: '' 
      });
      setShowAddRuleForm(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.message || 'No se pudo crear la regla', 
        variant: 'destructive' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!token) {
      toast({ title: 'Error', description: 'Falta token', variant: 'destructive' });
      return;
    }

    const companyId = (resolvedCompanyId ?? user?.company_id) as string | number | undefined;
    if (!companyId) {
      toast({ title: 'Error', description: 'No se pudo resolver la compañía', variant: 'destructive' });
      return;
    }

    try {
      setIsDeleting(ruleId);
      await pointRulesApi.deletePointRule(companyId, ruleId, token);

      toast({
        title: 'Regla eliminada',
        description: 'La regla fue eliminada correctamente',
      });

      await fetchRules();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.message || 'No se pudo eliminar la regla', 
        variant: 'destructive' 
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditing = (rule: PointsRule) => {
    setEditingRule({...rule});
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editingRule) return;

    const spendAmount = parseFloat(editingRule.spend_amount);
    const points = editingRule.points;

    if (spendAmount <= 0 || points < 0) {
      toast({
        title: "Error",
        description: "El monto debe ser > 0 y los puntos >= 0",
        variant: "destructive",
      });
      return;
    }

    if (editingRule.starts_at && editingRule.ends_at) {
      const s = new Date(editingRule.starts_at);
      const e = new Date(editingRule.ends_at);
      if (e.getTime() < s.getTime()) {
        toast({ 
          title: 'Error', 
          description: 'La fecha de fin debe ser posterior o igual a la de inicio', 
          variant: 'destructive' 
        });
        return;
      }
    }

    if (!token) {
      toast({ title: 'Error', description: 'Falta token', variant: 'destructive' });
      return;
    }

    const companyId = (resolvedCompanyId ?? user?.company_id) as string | number | undefined;
    if (!companyId) {
      toast({ title: 'Error', description: 'No se pudo resolver la compañía', variant: 'destructive' });
      return;
    }

    try {
      setIsUpdating(true);
      
      const payload: any = {
        spend_amount: spendAmount,
        points: points,
        is_active: editingRule.is_active,
      };

      if (editingRule.starts_at) {
        payload.starts_at = new Date(editingRule.starts_at).toISOString();
      }
      if (editingRule.ends_at) {
        payload.ends_at = new Date(editingRule.ends_at).toISOString();
      }
      if (editingRule.metadata?.nota) {
        payload.metadata = { nota: editingRule.metadata.nota };
      }

      await pointRulesApi.updatePointRule(companyId, editingRule.id, payload, token);

      toast({
        title: 'Regla actualizada',
        description: 'La regla fue actualizada correctamente',
      });

      await fetchRules();
      setEditingRule(null);
      setIsEditing(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.message || 'No se pudo actualizar la regla', 
        variant: 'destructive' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeLocal = (isoDate: string | null) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Puntos</h1>
          <p className="text-muted-foreground">
            Configura las reglas para que los clientes acumulen puntos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRules}>
            Recargar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reglas de Puntos</CardTitle>
              <CardDescription>
                Define montos de compra y los puntos que otorgan. Las reglas activas se aplican primero.
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowAddRuleForm(true)}
              disabled={isEditing || showAddRuleForm}
            >
              Agregar Regla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddRuleForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20">
              <h4 className="font-medium mb-3">Nueva Regla de Puntos</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="new-amount">Monto de compra (MXN) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="new-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newRule.spend_amount}
                      onChange={(e) => setNewRule({ ...newRule, spend_amount: e.target.value })}
                      disabled={isCreating}
                      className="pl-8"
                      placeholder="100.00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-points">Puntos a otorgar *</Label>
                  <Input
                    id="new-points"
                    type="number"
                    min="0"
                    step="1"
                    value={newRule.points}
                    onChange={(e) => setNewRule({ ...newRule, points: e.target.value })}
                    disabled={isCreating}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-starts">Fecha de inicio</Label>
                  <Input
                    id="new-starts"
                    type="datetime-local"
                    value={newRule.starts_at}
                    onChange={(e) => setNewRule({ ...newRule, starts_at: e.target.value })}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-ends">Fecha de fin</Label>
                  <Input
                    id="new-ends"
                    type="datetime-local"
                    value={newRule.ends_at}
                    onChange={(e) => setNewRule({ ...newRule, ends_at: e.target.value })}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="new-note">Nota (metadata)</Label>
                  <Input
                    id="new-note"
                    type="text"
                    placeholder="Ej. Promoción de temporada"
                    value={newRule.note}
                    onChange={(e) => setNewRule({ ...newRule, note: e.target.value })}
                    disabled={isCreating}
                  />
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    id="new-active"
                    checked={newRule.is_active}
                    onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                    disabled={isCreating}
                  />
                  <Label htmlFor="new-active" className="cursor-pointer">
                    Regla activa
                  </Label>
                </div>
                <div className="flex items-end space-x-2 md:col-span-2">
                  <Button onClick={addRule} size="sm" disabled={isCreating}>
                    {isCreating ? 'Creando...' : 'Crear Regla'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowAddRuleForm(false);
                      setNewRule({ 
                        spend_amount: '', 
                        points: '', 
                        is_active: true, 
                        starts_at: '', 
                        ends_at: '', 
                        note: '' 
                      });
                    }}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {editingRule && (
            <div className="mb-6 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <h4 className="font-medium mb-3">Editar Regla</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-amount">Monto de compra (MXN)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="edit-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editingRule.spend_amount}
                      onChange={(e) => setEditingRule({ ...editingRule, spend_amount: e.target.value })}
                      disabled={isUpdating}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-points">Puntos a otorgar</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    min="0"
                    step="1"
                    value={editingRule.points}
                    onChange={(e) => setEditingRule({ ...editingRule, points: parseInt(e.target.value) || 0 })}
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-starts">Fecha de inicio</Label>
                  <Input
                    id="edit-starts"
                    type="datetime-local"
                    value={formatDateTimeLocal(editingRule.starts_at)}
                    onChange={(e) => setEditingRule({ ...editingRule, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-ends">Fecha de fin</Label>
                  <Input
                    id="edit-ends"
                    type="datetime-local"
                    value={formatDateTimeLocal(editingRule.ends_at)}
                    onChange={(e) => setEditingRule({ ...editingRule, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="edit-note">Nota (metadata)</Label>
                  <Input
                    id="edit-note"
                    type="text"
                    value={editingRule.metadata?.nota || ''}
                    onChange={(e) => setEditingRule({ 
                      ...editingRule, 
                      metadata: { ...editingRule.metadata, nota: e.target.value } 
                    })}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    id="edit-active"
                    checked={editingRule.is_active}
                    onCheckedChange={(checked) => setEditingRule({ ...editingRule, is_active: checked })}
                    disabled={isUpdating}
                  />
                  <Label htmlFor="edit-active" className="cursor-pointer">
                    Regla activa
                  </Label>
                </div>
                <div className="flex items-end space-x-2 md:col-span-2">
                  <Button onClick={saveEdit} size="sm" disabled={isUpdating}>
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelEdit}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Monto</th>
                  <th className="text-left p-4 font-medium">Puntos</th>
                  <th className="text-left p-4 font-medium">Vigencia</th>
                  <th className="text-left p-4 font-medium">Nota</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {config.rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay reglas configuradas. Crea tu primera regla para empezar.
                    </td>
                  </tr>
                ) : (
                  sortRules(config.rules).map((rule) => (
                    <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        ${parseFloat(rule.spend_amount).toFixed(2)} MXN
                      </td>
                      <td className="p-4">
                        {rule.points} puntos
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {rule.starts_at || rule.ends_at ? (
                          <div className="space-y-0.5">
                            {rule.starts_at && <div>Desde: {formatDate(rule.starts_at)}</div>}
                            {rule.ends_at && <div>Hasta: {formatDate(rule.ends_at)}</div>}
                          </div>
                        ) : (
                          'Sin límite'
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">
                        {rule.metadata?.nota || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => startEditing(rule)}
                            disabled={isEditing || showAddRuleForm || isDeleting === rule.id}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRule(rule.id)}
                            disabled={isEditing || showAddRuleForm || isDeleting !== null}
                          >
                            <span className="text-destructive">
                              {isDeleting === rule.id ? 'Eliminando...' : 'Eliminar'}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}