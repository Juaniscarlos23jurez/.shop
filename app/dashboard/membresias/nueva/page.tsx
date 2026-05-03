'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Plus, X, Check, Loader2, Package, DollarSign, 
  Upload, Image as ImageIcon, Clock, Percent, User, 
  CheckSquare as CheckIcon 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from '@/components/ui/use-toast';
import { MembershipCard } from '@/components/membresias/MembershipCard';

// Valid benefit types according to the API
type ValidBenefitType = 'shipping' | 'discount' | 'custom';

type Benefit = {
  id: string;
  text: string;
  type: ValidBenefitType;
  value?: number;
  description?: string;
};

export default function NewMembershipPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '1',
    durationUnit: 'months' as 'months' | 'years',
    isRecurring: true,
    welcomeGift: false,
    birthdayGift: false,
    earlyRenewalDiscount: '',
    maxUsers: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    // Design
    imageUrl: '',
    backgroundImageUrl: '',
    cardColorHex: '#ffffff',
    accentColorHex: '#10b981',
    textColorHex: '#0f172a',
    badgeText: '',
    isPopular: false,
    isActive: true,
  });

  // Previews & Files
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    if (type === 'image') {
      setImagePreview(url);
      setSelectedImageFile(file);
    } else {
      setBgPreview(url);
      setSelectedBgFile(file);
    }
  };

  const uploadFile = async (file: File, type: 'logo' | 'background', mTempId: string) => {
    const path = `memberships/new_${mTempId}/${type}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const addBenefit = (type: ValidBenefitType = 'custom', text: string = '') => {
    const benefit: Benefit = {
      id: Date.now().toString(),
      text: text || newBenefit,
      type: type,
    };

    if (type === 'discount') {
      benefit.value = 10;
      benefit.description = 'Descuento en productos seleccionados';
    } else if (type === 'shipping') {
      benefit.text = 'Envío gratuito';
      benefit.description = 'Envío gratuito en todos los pedidos';
    }

    setBenefits([...benefits, benefit]);
    if (type === 'custom') setNewBenefit('');
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      addBenefit('custom', newBenefit);
    }
  };

  const removeBenefit = (benefitId: string) => {
    setBenefits(benefits.filter(b => b.id !== benefitId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!token) throw new Error('No estás autenticado');

      const companyResponse = await api.userCompanies.get(token);
      const companyId = companyResponse.data.data.id;

      const tempId = Math.random().toString(36).substring(7);
      let finalImageUrl = formData.imageUrl;
      let finalBgUrl = formData.backgroundImageUrl;

      // Upload files to Firebase if selected
      if (selectedImageFile) {
        finalImageUrl = await uploadFile(selectedImageFile, 'logo', tempId);
      }
      if (selectedBgFile) {
        finalBgUrl = await uploadFile(selectedBgFile, 'background', tempId);
      }

      const membershipData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 1,
        duration_unit: formData.durationUnit,
        is_recurring: formData.isRecurring,
        welcome_gift: formData.welcomeGift,
        birthday_gift: formData.birthdayGift,
        early_renewal_discount: formData.earlyRenewalDiscount ? parseInt(formData.earlyRenewalDiscount) : null,
        max_users: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        is_active: formData.isActive,
        benefits: benefits
          .filter(b => b.text.trim() !== '')
          .map(b => ({
            text: b.text,
            type: b.type,
            description: b.description || ''
          })),
        image_url: finalImageUrl || null,
        background_image_url: finalBgUrl || null,
        card_color_hex: formData.cardColorHex || null,
        accent_color_hex: formData.accentColorHex || null,
        text_color_hex: formData.textColorHex || null,
        badge_text: formData.badgeText || null,
        is_popular: formData.isPopular
      };

      // Backend requires valid_from to be a valid date
      membershipData.valid_from = formData.validFrom 
        ? `${formData.validFrom} 00:00:00` 
        : `${new Date().toISOString().split('T')[0]} 00:00:00`;
        
      if (formData.validUntil) {
        membershipData.valid_until = `${formData.validUntil} 23:59:59`;
      }

      const response = await api.memberships.createMembership(companyId.toString(), membershipData, token);
      
      if (!response.success) throw new Error(response.message || 'Error al crear');
      
      toast({
        title: "¡Éxito!",
        description: "La membresía se ha creado correctamente.",
      });
      
      router.push('/dashboard/membresias');
    } catch (err) {
      console.error('Error creating:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la membresía');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al crear la membresía",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva membresía</h1>
        <p className="text-muted-foreground">Crea un nuevo plan y personaliza su apariencia</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold text-sm">Error: </strong>
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-12">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ej: Platinum Rewards" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio (MXN)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input id="price" name="price" type="number" step="0.01" className="pl-8" value={formData.price} onChange={handleInputChange} required placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={2} required placeholder="Describe los beneficios..." />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="isActive">Membresía activa (visible para clientes)</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración y Beneficios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración</Label>
                      <div className="flex gap-2">
                        <Input id="duration" name="duration" type="number" value={formData.duration} onChange={handleInputChange} className="w-24" required />
                        <select
                          name="durationUnit"
                          value={formData.durationUnit}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="months">Meses</option>
                          <option value="years">Años</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="earlyRenewalDiscount">Descuento renovación anticipada (%)</Label>
                      <Input id="earlyRenewalDiscount" name="earlyRenewalDiscount" type="number" value={formData.earlyRenewalDiscount} onChange={handleInputChange} placeholder="0" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Válido Desde (Requerido)</Label>
                      <Input id="validFrom" name="validFrom" type="date" value={formData.validFrom || new Date().toISOString().split('T')[0]} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validUntil">Válido Hasta (Opcional)</Label>
                      <Input id="validUntil" name="validUntil" type="date" value={formData.validUntil} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="isRecurring" name="isRecurring" checked={formData.isRecurring} onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})} className="h-4 w-4 rounded" />
                      <Label htmlFor="isRecurring">Recurrente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="welcomeGift" name="welcomeGift" checked={formData.welcomeGift} onChange={(e) => setFormData({...formData, welcomeGift: e.target.checked})} className="h-4 w-4 rounded" />
                      <Label htmlFor="welcomeGift">Regalo Bienvenida</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="birthdayGift" name="birthdayGift" checked={formData.birthdayGift} onChange={(e) => setFormData({...formData, birthdayGift: e.target.checked})} className="h-4 w-4 rounded" />
                      <Label htmlFor="birthdayGift">Regalo Cumpleaños</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Beneficios</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => addBenefit('shipping')} disabled={benefits.some(b => b.type === 'shipping')}>
                          <Package className="h-4 w-4 mr-1"/> Envío
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => addBenefit('discount')} disabled={benefits.some(b => b.type === 'discount')}>
                          <DollarSign className="h-4 w-4 mr-1"/> Descuento
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Nuevo beneficio..." value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())} />
                      <Button type="button" onClick={handleAddBenefit} disabled={!newBenefit.trim()} variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {benefits.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-2 bg-muted rounded-md group">
                          <span className="text-sm">{b.text}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeBenefit(b.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diseño Premium</CardTitle>
                  <CardDescription>Personaliza la apariencia visual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Illustrative Image Upload */}
                    <div className="space-y-2">
                      <Label>Imagen Ilustrativa / Icono</Label>
                      <div 
                        className="relative group aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all hover:bg-slate-50 cursor-pointer overflow-hidden border-slate-200"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Illustrative" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Upload className="text-white h-8 w-8" />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                            <p className="text-xs text-slate-500 font-medium">Subir imagen</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={imageInputRef} 
                          onChange={(e) => handleFileChange(e, 'image')}
                          accept="image/*"
                        />
                      </div>
                      <Input 
                        placeholder="O usa una URL externa..." 
                        name="imageUrl" 
                        value={formData.imageUrl} 
                        onChange={handleInputChange} 
                        className="text-xs"
                      />
                    </div>

                    {/* Background Texture Upload */}
                    <div className="space-y-2">
                      <Label>Fondo (Textura/Patrón)</Label>
                      <div 
                        className="relative group aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all hover:bg-slate-50 cursor-pointer overflow-hidden border-slate-200"
                        onClick={() => bgInputRef.current?.click()}
                      >
                        {bgPreview ? (
                          <>
                            <img src={bgPreview} className="absolute inset-0 w-full h-full object-cover" alt="Background" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <Upload className="text-white h-8 w-8" />
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-slate-400 mb-2" />
                            <p className="text-xs text-slate-500 font-medium">Subir textura</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={bgInputRef} 
                          onChange={(e) => handleFileChange(e, 'background')}
                          accept="image/*"
                        />
                      </div>
                      <Input 
                        placeholder="O usa una URL externa..." 
                        name="backgroundImageUrl" 
                        value={formData.backgroundImageUrl} 
                        onChange={handleInputChange} 
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Color Tarjeta</Label>
                      <div className="flex gap-2">
                        <Input name="cardColorHex" type="color" value={formData.cardColorHex} onChange={handleInputChange} className="w-10 p-1 h-10 border-none rounded-full overflow-hidden" />
                        <Input name="cardColorHex" value={formData.cardColorHex} onChange={handleInputChange} className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Color Texto</Label>
                      <div className="flex gap-2">
                        <Input name="textColorHex" type="color" value={formData.textColorHex} onChange={handleInputChange} className="w-10 p-1 h-10 border-none rounded-full overflow-hidden" />
                        <Input name="textColorHex" value={formData.textColorHex} onChange={handleInputChange} className="flex-1" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="badgeText">Insignia</Label>
                      <Input id="badgeText" name="badgeText" value={formData.badgeText} onChange={handleInputChange} placeholder="Ej: NUEVO" />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <input type="checkbox" id="isPopular" name="isPopular" checked={formData.isPopular} onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} className="h-4 w-4 rounded" />
                      <Label htmlFor="isPopular" className="font-bold text-emerald-600">Plan Popular</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <CardFooter className="flex justify-end gap-3 px-0">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/membresias')} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Crear membresía
                </Button>
              </CardFooter>
            </div>
          </form>
        </div>

        {/* Live Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckIcon className="text-emerald-500 h-5 w-5" />
              Vista Previa en Tiempo Real
            </h3>
            
            <MembershipCard
              name={formData.name}
              description={formData.description}
              price={formData.price}
              duration={formData.duration}
              durationUnit={formData.durationUnit}
              badgeText={formData.badgeText}
              isPopular={formData.isPopular}
              maxUsers={formData.maxUsers}
              welcomeGift={formData.welcomeGift}
              birthdayGift={formData.birthdayGift}
              benefits={benefits}
              cardColorHex={formData.cardColorHex}
              textColorHex={formData.textColorHex}
              accentColorHex={formData.accentColorHex}
              backgroundImageUrl={bgPreview || formData.backgroundImageUrl}
              imageUrl={imagePreview || formData.imageUrl}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                <strong>💡 Tip:</strong> Usa el Color de Acento para resaltar el icono y la insignia. Asegúrate de que el Color de Texto tenga buen contraste con el Color de la Tarjeta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
