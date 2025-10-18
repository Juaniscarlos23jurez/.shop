'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Small helper to generate IDs for UI fallback and mapping
const cryptoRandomId = (): string => {
  try {
    // @ts-ignore - crypto may be available in browser
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  return Math.random().toString(36).slice(2);
};

export default function AnunciosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, user } = useAuth();

  const [title, setTitle] = useState('Gran Promoción');
  const [subtitle, setSubtitle] = useState('Sólo por tiempo limitado');
  const [text, setText] = useState('Aprovecha descuentos exclusivos en tu próxima compra.');
  const [link, setLink] = useState('https://tu-sitio.com/promo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [startsAt, setStartsAt] = useState<string>(''); // datetime-local
  const [endsAt, setEndsAt] = useState<string>('');

  type UiAd = {
    id: string;
    title: string;
    subtitle: string;
    text: string;
    link: string;
    imageUrl: string | null;
    isActive?: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
    updatedAt: string;
  };
  const [items, setItems] = useState<UiAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | undefined>(user?.company_id ? String(user.company_id) : undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const canPreview = useMemo(() => !!(title || subtitle || text || imageUrl), [title, subtitle, text, imageUrl]);

  const onPickImage = () => fileInputRef.current?.click();

  // Load announcements from API if available
  useEffect(() => {
    const load = async () => {
      if (!token) return; // without auth we keep UI-only mode
      try {
        setLoading(true);
        let cid = resolvedCompanyId;
        if (!cid) {
          const r = await api.userCompanies.get(token);
          const data = r.data;
          cid = String(
            data?.id ||
            data?.company_id ||
            data?.company?.id ||
            data?.company?.company_id ||
            data?.data?.id ||
            data?.data?.company_id ||
            data?.data?.company?.id ||
            ''
          );
          if (cid && cid !== 'undefined') setResolvedCompanyId(cid);
        }
        if (!cid) return;

        const res = await api.companies.listAnnouncements(cid, token, { per_page: 50 });
        const raw = (res.data as any)?.data ?? res.data ?? [];
        const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const mapped: UiAd[] = arr.map((a: any) => ({
          id: String(a.id ?? cryptoRandomId()),
          title: a.title ?? '',
          subtitle: a.subtitle ?? '',
          text: a.text ?? '',
          link: a.link_url ?? '',
          imageUrl: a.image_url ?? null,
          isActive: Boolean(a.is_active ?? true),
          startsAt: a.starts_at ?? null,
          endsAt: a.ends_at ?? null,
          updatedAt: a.updated_at ?? new Date().toISOString(),
        }));
        setItems(mapped);
      } catch (e) {
        console.error('Error loading announcements', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If API context is available, try to create via API
    if (token) {
      try {
        setLoading(true);
        let cid = resolvedCompanyId;
        if (!cid) {
          const r = await api.userCompanies.get(token);
          const data = r.data;
          cid = String(
            data?.id || data?.company_id || data?.company?.id || data?.data?.id || ''
          );
          if (cid && cid !== 'undefined') setResolvedCompanyId(cid);
        }
        if (!cid) throw new Error('No se pudo resolver la compañía');

        const toIso = (v: string) => (v ? new Date(v).toISOString() : null);

        // 1) Subir imagen a Firebase Storage si el usuario seleccionó un archivo
        let imageUrlToUse: string | null = imageUrlInput.trim() || null;
        if (imageFile) {
          const safeName = imageFile.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'banner.jpg';
          const path = `companies/${cid}/announcements/banner_${Date.now()}_${safeName}`;
          const fileRef = storageRef(storage, path);
          const uploadTask = uploadBytes(fileRef, imageFile, { contentType: imageFile.type });
          await uploadTask;
          imageUrlToUse = await getDownloadURL(fileRef);
        }

        const payload = {
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          text: text.trim() || null,
          link_url: link.trim() || null,
          image_url: imageUrlToUse,
          is_active: isActive,
          starts_at: toIso(startsAt),
          ends_at: toIso(endsAt)
        };
        const res = await api.companies.createAnnouncement(cid, payload, token);
        if (!res.success) throw new Error(res.message || 'Error creando anuncio');

        toast({ title: 'Anuncio creado', description: 'Se creó correctamente.' });
        // refresh list
        const list = await api.companies.listAnnouncements(cid, token, { per_page: 50 });
        const raw = (list.data as any)?.data ?? list.data ?? [];
        const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const mapped: UiAd[] = arr.map((a: any) => ({
          id: String(a.id ?? cryptoRandomId()),
          title: a.title ?? '',
          subtitle: a.subtitle ?? '',
          text: a.text ?? '',
          link: a.link_url ?? '',
          imageUrl: a.image_url ?? null,
          isActive: Boolean(a.is_active ?? true),
          startsAt: a.starts_at ?? null,
          endsAt: a.ends_at ?? null,
          updatedAt: a.updated_at ?? new Date().toISOString(),
        }));
        setItems(mapped);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: (err as Error).message });
      } finally {
        setLoading(false);
      }
    } else {
      // UI-only fallback
      const id = cryptoRandomId();
      const now = new Date().toISOString();
      const persistedImageUrl = imageUrlInput || (imageFile ? URL.createObjectURL(imageFile) : imageUrl);
      setItems((prev) => [
        {
          id,
          title: title.trim(),
          subtitle: subtitle.trim(),
          text: text.trim(),
          link: link.trim(),
          imageUrl: persistedImageUrl || null,
          isActive,
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          updatedAt: now,
        },
        ...prev,
      ]);
      toast({ title: 'Anuncio agregado (UI)', description: 'Se añadió a la tabla local.' });
    }

    // Clear form after either path
    setTitle('');
    setSubtitle('');
    setText('');
    setLink('');
    setImageFile(null);
    setImageUrl(null);
    setImageUrlInput('');
    setIsActive(true);
    setStartsAt('');
    setEndsAt('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Anuncios</h1>
          <p className="text-slate-600 mt-1">Crea banners para el carrusel del home en la app</p>
        </div>
      </div>

      {/* Tabla de anuncios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Anuncios</CardTitle>
              <CardDescription>
                {token ? 'Listado desde API (si hay permisos)' : 'Listado en memoria, sin persistencia'}
              </CardDescription>
            </div>
            <span className="text-xs text-slate-500">{loading ? 'Cargando…' : `${items.length} total`}</span>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-slate-500 py-6 text-center">Aún no hay anuncios. Crea uno con el formulario.</div>
          ) : (
            <div className="overflow-hidden border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Imagen</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Subtítulo</TableHead>
                    <TableHead className="hidden md:table-cell">Activo</TableHead>
                    <TableHead className="hidden md:table-cell">Link</TableHead>
                    <TableHead className="hidden lg:table-cell">Vigencia</TableHead>
                    <TableHead className="hidden md:table-cell">Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="w-[100px] h-[56px] overflow-hidden rounded border bg-slate-100">
                          {it.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Sin imagen</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{it.title || '-'}</TableCell>
                      <TableCell className="text-slate-600">{it.subtitle || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {it.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Activo</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Inactivo</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-600 truncate max-w-[220px]">{it.link || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-600 text-xs">
                        {(it.startsAt || it.endsAt) ? (
                          <span>{it.startsAt ? new Date(it.startsAt).toLocaleString() : '—'} → {it.endsAt ? new Date(it.endsAt).toLocaleString() : '—'}</span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-500 text-xs">
                        {new Date(it.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Rellena el formulario para "editar" (UI)
                              setTitle(it.title);
                              setSubtitle(it.subtitle);
                              setText(it.text);
                              setLink(it.link);
                              setImageFile(null);
                              setImageUrl(it.imageUrl);
                            }}
                          >
                            Editar (UI)
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (token && resolvedCompanyId) {
                                try {
                                  setLoading(true);
                                  await api.companies.deleteAnnouncement(resolvedCompanyId, it.id, token);
                                  setItems((prev) => prev.filter((x) => x.id !== it.id));
                                } catch (e) {
                                  toast({ title: 'Error', description: 'No se pudo eliminar' });
                                } finally {
                                  setLoading(false);
                                }
                              } else {
                                setItems((prev) => prev.filter((x) => x.id !== it.id));
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del anuncio</CardTitle>
              <CardDescription>Define los textos y el enlace del banner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="space-y-1">
                  <Label className="text-sm">Activo</Label>
                  <p className="text-xs text-slate-500">Controla si el banner aparece en el carrusel</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Gran Promoción" maxLength={80} />
                <p className="text-xs text-slate-500">Máximo 80 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ej: Sólo por tiempo limitado" maxLength={120} />
                <p className="text-xs text-slate-500">Máximo 120 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Texto</Label>
                <Textarea id="text" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensaje descriptivo" maxLength={240} />
                <p className="text-xs text-slate-500">Máximo 240 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link o Deep Link</Label>
                <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://tu-sitio.com o myapp://ruta" />
                <p className="text-xs text-slate-500">Se abrirá cuando el usuario toque el banner</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Fecha inicio (opcional)</Label>
                  <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">Fecha fin (opcional)</Label>
                  <Input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imagen</CardTitle>
              <CardDescription>Sube una imagen ancha (ratio recomendado 16:9)</CardDescription>
            </CardHeader>
            <CardContent>
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
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={onPickImage}>Seleccionar imagen</Button>
                  {imageFile && (
                    <Button type="button" variant="ghost" onClick={() => { setImageFile(null); setImageUrl(null); }}>Quitar</Button>
                  )}
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-slate-50 flex items-center justify-center">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-slate-400 text-sm">Sin imagen</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrlInput">URL de imagen (para API)</Label>
                  <Input id="imageUrlInput" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="https://cdn.tu-dominio.com/banner.jpg" />
                  <p className="text-xs text-slate-500">Para guardar por API, pega aquí una URL pública. La carga de archivos no está conectada aún.</p>
                </div>
                <p className="text-xs text-slate-500">Formatos soportados: JPG, PNG, WEBP. Tamaño recomendado 1600x900.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">{token ? (loading ? 'Guardando…' : 'Guardar (API)') : 'Guardar (UI)'}</Button>
          </div>
        </form>

        <Card className="lg:sticky lg:top-6 h-fit">
          <CardHeader>
            <CardTitle>Previsualización (carrusel)</CardTitle>
            <CardDescription>Así podría verse en el home de la app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-xl border">
              <div className="aspect-[16/9] w-full flex items-center justify-center bg-black/5">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Banner" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                    <span className="text-slate-400">Previsualización sin imagen</span>
                  </div>
                )}
              </div>

              {/* Overlay text */}
              {(title || subtitle || text) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              )}

              <div className="absolute inset-0 p-6 flex flex-col justify-end gap-1 pointer-events-none">
                {subtitle && (
                  <p className="text-white/90 text-xs md:text-sm font-medium drop-shadow">{subtitle}</p>
                )}
                {title && (
                  <h3 className="text-white text-lg md:text-2xl font-bold tracking-tight drop-shadow">{title}</h3>
                )}
                {text && (
                  <p className="text-white/90 text-xs md:text-sm max-w-xl drop-shadow">{text}</p>
                )}
                {link && (
                  <span className="mt-2 inline-flex items-center gap-2 text-white/90 text-xs bg-white/10 backdrop-blur px-2 py-1 rounded">
                    {link}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Esta es una simulación visual. El carrusel real de la app puede aplicar estilos propios.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
