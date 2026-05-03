'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, X, Check, Megaphone, Calendar, AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AnuncioFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function AnuncioForm({ initialData, isEditing = false }: AnuncioFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { token, user } = useAuth();

  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [text, setText] = useState(initialData?.text || '');
  const [link, setLink] = useState(initialData?.link_url || initialData?.link || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || initialData?.imageUrl || null);
  const [isActive, setIsActive] = useState<boolean>(initialData?.is_active ?? initialData?.isActive ?? true);
  const [startsAt, setStartsAt] = useState<string>(
    initialData?.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : 
    initialData?.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : ''
  );
  const [endsAt, setEndsAt] = useState<string>(
    initialData?.ends_at ? new Date(initialData.ends_at).toISOString().slice(0, 16) : 
    initialData?.endsAt ? new Date(initialData.endsAt).toISOString().slice(0, 16) : ''
  );
  
  const [loading, setLoading] = useState(false);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | undefined>(user?.company_id ? String(user.company_id) : undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const onPickImage = () => fileInputRef.current?.click();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({ title: 'Error', description: 'No tienes sesión activa', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      let cid = resolvedCompanyId;
      if (!cid) {
        const r = await api.userCompanies.get(token);
        const data = r.data;
        cid = String(data?.id || data?.company_id || data?.company?.id || data?.data?.id || '');
        if (cid && cid !== 'undefined') setResolvedCompanyId(cid);
      }
      if (!cid) throw new Error('No se pudo resolver la compañía');

      const toIso = (v: string) => (v ? new Date(v).toISOString() : null);

      let finalImageUrl = imageUrl;
      if (imageFile) {
        const safeName = imageFile.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'banner.jpg';
        const path = `companies/${cid}/announcements/banner_${Date.now()}_${safeName}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, imageFile, { contentType: imageFile.type });
        finalImageUrl = await getDownloadURL(fileRef);
      }

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        text: text.trim() || null,
        link_url: link.trim() || null,
        image_url: finalImageUrl,
        is_active: isActive,
        starts_at: toIso(startsAt),
        ends_at: toIso(endsAt)
      };

      if (isEditing && initialData?.id) {
        const res = await api.companies.updateAnnouncement(cid, initialData.id, payload, token);
        if (!res.success) throw new Error(res.message || 'Error actualizando anuncio');
        toast({ title: 'Anuncio actualizado', description: 'Los cambios se guardaron correctamente.' });
      } else {
        const res = await api.companies.createAnnouncement(cid, payload, token);
        if (!res.success) throw new Error(res.message || 'Error creando anuncio');
        toast({ title: 'Anuncio creado', description: 'Se creó correctamente.' });
      }

      router.push('/dashboard/anuncios');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          </h1>
          <p className="text-slate-600 mt-1">Configura los detalles visuales y el enlace del banner</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card className={isEditing ? 'border-blue-200' : ''}>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Define los textos y el estado del anuncio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border rounded-xl p-4 bg-slate-50/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Estado del Anuncio</Label>
                  <p className="text-xs text-slate-500">¿Debe mostrarse en el carrusel?</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título Principal</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: ¡2x1 en toda la tienda!" maxLength={80} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
                <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ej: Válido sólo el fin de semana" maxLength={120} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Descripción Corta</Label>
                <Textarea id="text" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Agrega más detalles aquí..." maxLength={240} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Enlace de Destino (URL o Deep Link)</Label>
                <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Fecha de Inicio</Label>
                  <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">Fecha de Expiración</Label>
                  <Input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imagen del Anuncio</CardTitle>
              <CardDescription>Usa una relación de aspecto 16:9 para un ajuste perfecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                }}
              />
              <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed bg-slate-50 flex items-center justify-center relative group">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button type="button" variant="secondary" onClick={onPickImage} className="rounded-xl">
                        Cambiar Imagen
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button type="button" variant="ghost" onClick={onPickImage} className="flex flex-col items-center gap-2 text-slate-400 h-full w-full">
                    <Plus className="w-8 h-8 opacity-20" />
                    <span className="text-sm font-medium">Seleccionar imagen</span>
                  </Button>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Guía de medidas
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Tamaño óptimo: <strong>1200x675px</strong>. Mantén el texto alejado de los 80px inferiores.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-10">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="rounded-xl px-8">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-10">
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Anuncio'}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6">
             <CardHeader>
              <CardTitle>Previsualización</CardTitle>
              <CardDescription>Cómo se verá el carrusel en la App</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
                <div className="aspect-[16/9] w-full flex items-center justify-center bg-slate-200">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Megaphone className="w-10 h-10 opacity-20" />
                      <span className="text-xs font-medium">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end gap-1 pointer-events-none">
                  {subtitle && (
                    <p className="text-white/90 text-xs md:text-sm font-medium drop-shadow-sm">{subtitle}</p>
                  )}
                  {title && (
                    <h3 className="text-white text-lg md:text-2xl font-bold tracking-tight drop-shadow-md leading-tight">{title}</h3>
                  )}
                  {text && (
                    <p className="text-white/80 text-xs md:text-sm max-w-xl drop-shadow-sm line-clamp-2">{text}</p>
                  )}
                  {link && (
                    <div className="mt-2 inline-flex items-center text-white/60 text-[10px] bg-white/10 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full w-fit">
                      {link}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Mockup de Carrusel App</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
