'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Search, Trash2, Edit, CreditCard, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { toast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function GiftCardsPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // Tabs: 'templates' | 'issued'
  const [activeTab, setActiveTab] = useState<'templates' | 'issued'>('templates');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Template Form State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    price: '',
    description: '',
    card_color_hex: '#000000',
    theme: 'Standard',
    image_url: '',
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const companyResponse = await api.userCompanies.get(token);
      if (companyResponse.success && companyResponse.data?.data?.id) {
        const id = companyResponse.data.data.id;
        setCompanyId(id);
        
        // Fetch both templates and issued gift cards
        const [tplRes, gcRes] = await Promise.all([
          api.giftCardTemplates.list(id, token),
          api.giftCards.list(id, token)
        ]);
        
        if (tplRes.success) setTemplates(tplRes.data?.data || tplRes.data || []);
        if (gcRes.success) setGiftCards(gcRes.data?.data || gcRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setFormData({
      name: '',
      amount: '',
      price: '',
      description: '',
      card_color_hex: '#000000',
      theme: 'Standard',
      image_url: '',
    });
    setImageFile(null);
    setImagePreview('');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditModal = (template: any) => {
    setEditingTemplateId(template.id);
    setFormData({
      name: template.name || '',
      amount: template.amount ? template.amount.toString() : '',
      price: template.price ? template.price.toString() : template.amount ? template.amount.toString() : '',
      description: template.description || '',
      card_color_hex: template.design_metadata?.card_color_hex || '#000000',
      theme: template.design_metadata?.theme || 'Standard',
      image_url: template.image_url || '',
    });
    setImageFile(null);
    setImagePreview(template.image_url || '');
    setIsTemplateModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = async () => {
    if (!token || !companyId || !formData.amount || !formData.name || !formData.price) {
      toast({ title: 'Campos Incompletos', description: 'Asegúrate de llenar nombre, monto y precio', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmitting(true);
      
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        const path = `companies/${companyId}/giftcards/${Date.now()}_${imageFile.name}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, imageFile);
        finalImageUrl = await getDownloadURL(fileRef);
      }

      const dataToSubmit = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        price: parseFloat(formData.price),
        image_url: finalImageUrl || undefined,
        description: formData.description || undefined,
        design_metadata: {
          card_color_hex: formData.card_color_hex,
          theme: formData.theme,
        },
      };

      let res;
      if (editingTemplateId) {
        res = await api.giftCardTemplates.update(companyId, editingTemplateId, dataToSubmit, token);
      } else {
        res = await api.giftCardTemplates.create(companyId, dataToSubmit, token);
      }

      if (res.success) {
        toast({ title: editingTemplateId ? 'Plantilla Actualizada' : 'Plantilla Creada Exitosamente' });
        setIsTemplateModalOpen(false);
        fetchData(); // reload
      } else {
        toast({ title: 'Error', description: 'No se pudo guardar la plantilla', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Ocurrió un problema de conexión', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!token || !companyId) return;
    if (!confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
    try {
      const res = await api.giftCardTemplates.delete(companyId, id, token);
      if (res.success) {
        toast({ title: 'Plantilla eliminada' });
        fetchData();
      } else {
        toast({ title: 'Error', variant: 'destructive' });
      }
    } catch (error) {
       toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleToggleTemplateStatus = async (id: string, currentStatus: boolean) => {
    if (!token || !companyId) return;
    try {
      const res = await api.giftCardTemplates.update(companyId, id, { is_active: !currentStatus }, token);
      if (res.success) {
        toast({ title: 'Estado actualizado' });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleUpdateGcStatus = async (id: string, status: string) => {
    if (!token || !companyId) return;
    try {
      const res = await api.giftCards.update(companyId, id, { status: status as any }, token);
      if (res.success) {
        toast({ title: 'Estado de tarjeta actualizado' });
        fetchData();
      }
    } catch (error) {}
  };

  const filteredData = activeTab === 'templates' 
    ? templates.filter(t => (t.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (t.amount?.toString().includes(searchTerm)))
    : giftCards.filter(c => (c.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (c.recipient_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-muted-foreground">
            Diseña plantillas y supervisa las tarjetas compradas por tus clientes
          </p>
        </div>
        
        {activeTab === 'templates' && (
          <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <Button className="mt-4 md:mt-0" onClick={handleOpenCreateModal}>
              <Plus className="mr-2 h-4 w-4" /> Nueva Plantilla
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingTemplateId ? 'Editar Plantilla' : 'Crear Plantilla de Venta'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre (Ej: Regalo Aniversario)</Label>
                  <Input 
                    placeholder="Tarjeta Premium" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monto / Saldo ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="500.00" 
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio de Venta ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="450.00" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Imagen (Opcional)</Label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-sm text-slate-500">Haz clic o arrastra una imagen</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG (Recomendado apaisado)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tema Visual</Label>
                    <Input 
                      placeholder="Gold Theme" 
                      value={formData.theme} 
                      onChange={e => setFormData({...formData, theme: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color de la Tarjeta</Label>
                    <Input 
                      type="color" 
                      className="h-10 w-full"
                      value={formData.card_color_hex} 
                      onChange={e => setFormData({...formData, card_color_hex: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!formData.amount || !formData.price || !formData.name || isSubmitting} onClick={handleSaveTemplate}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Plantilla'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <CreditCard className="mr-2 h-4 w-4" /> Catálogo de Plantillas
        </Button>
        <Button
          variant={activeTab === 'issued' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('issued')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <Ticket className="mr-2 h-4 w-4" /> Tarjetas Vendidas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'templates' ? "Buscar plantilla..." : "Buscar código o comprador..."}
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando...</p>
          ) : filteredData.length > 0 ? (
            <div className="space-y-4">
              {activeTab === 'templates' ? (
                // TEMPLATES LIST
                filteredData.map((tpl: any) => (
                  <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4 items-center">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-20 h-12 rounded shadow-sm border border-slate-200 flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tpl.design_metadata?.card_color_hex || '#000' }}
                        >
                          ${tpl.amount}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{tpl.name || `Plantilla $${tpl.amount}`}</h3>
                            <Badge variant={tpl.is_active !== false ? 'default' : 'secondary'}>
                              {tpl.is_active !== false ? 'Activa en Tienda' : 'Oculta'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Tema: {tpl.design_metadata?.theme || 'Estándar'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleTemplateStatus(tpl.id, tpl.is_active !== false)}
                        >
                          {tpl.is_active !== false ? 'Pausar' : 'Activar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(tpl)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // ISSUED GIFT CARDS LIST
                filteredData.map((card: any) => (
                  <Card key={card.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4 items-center">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-10 rounded shadow-sm border border-slate-200"
                          style={{ backgroundColor: card.design_metadata?.card_color_hex || '#000' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{card.code || `GC-${card.id}`}</h3>
                            <Badge variant={card.status === 'active' ? 'default' : 'secondary'}>
                              {card.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${card.amount} saldo
                          </p>
                          {card.recipient_email && (
                            <p className="text-xs text-muted-foreground">Para: {card.recipient_email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {card.status !== 'cancelled' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleUpdateGcStatus(card.id, 'cancelled')}
                          >
                            Cancelar Tarjeta
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleUpdateGcStatus(card.id, 'active')}
                          >
                            Reactivar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {activeTab === 'templates' ? 'No tienes plantillas creadas. ¡Crea una para que tus clientes puedan regalar!' : 'Aún no se han vendido tarjetas de regalo.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
