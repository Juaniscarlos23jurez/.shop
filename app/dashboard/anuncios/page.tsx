'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, X, Check, Megaphone, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';

export type UiAd = {
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

export default function AnunciosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, user } = useAuth();

  const [items, setItems] = useState<UiAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | undefined>(user?.company_id ? String(user.company_id) : undefined);

  // Función para verificar si un anuncio está caducado
  const isExpired = (endsAt: string | null) => {
    if (!endsAt) return false;
    return new Date(endsAt) < new Date();
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  }, [items]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        setLoading(true);
        let cid = resolvedCompanyId;
        if (!cid) {
          const r = await api.userCompanies.get(token);
          const data = r.data;
          cid = String(data?.id || data?.company_id || data?.company?.id || '');
          if (cid && cid !== 'undefined') setResolvedCompanyId(cid);
        }
        if (!cid) return;

        const res = await api.companies.listAnnouncements(cid, token, { per_page: 50 });
        const raw = (res.data as any)?.data ?? res.data ?? [];
        const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const mapped: UiAd[] = arr.map((a: any) => ({
          id: String(a.id),
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
  }, [token, resolvedCompanyId]);

  const handleDelete = async (it: UiAd) => {
    if (!confirm(`¿Estás seguro de eliminar el anuncio "${it.title}"?`)) return;
    
    if (token && resolvedCompanyId) {
      try {
        setLoading(true);
        await api.companies.deleteAnnouncement(resolvedCompanyId, it.id, token);
        setItems((prev) => prev.filter((x) => x.id !== it.id));
        toast({ title: 'Anuncio eliminado', description: 'El anuncio se eliminó correctamente.' });
      } catch (e) {
        toast({ title: 'Error', description: 'No se pudo eliminar el anuncio', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Anuncios</h1>
          <p className="text-slate-600 mt-1">Gestiona los banners del carrusel de la App</p>
        </div>
        <Button onClick={() => router.push('/dashboard/anuncios/new')} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Crear Anuncio
        </Button>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Banners</CardTitle>
              <CardDescription>Visualiza y gestiona el contenido del home</CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-50">{items.length} activos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center gap-2">
               <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
               <p className="text-sm text-slate-500 font-medium">Cargando anuncios...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed">
              <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-bold">Sin anuncios registrados</p>
              <p className="text-sm text-slate-500 mb-6">Empieza creando un banner para tu app.</p>
              <Button onClick={() => router.push('/dashboard/anuncios/new')} variant="outline" className="rounded-xl">
                Crear primer anuncio
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden border rounded-2xl">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[140px] pl-6">Preview</TableHead>
                    <TableHead>Contenido</TableHead>
                    <TableHead className="hidden md:table-cell">Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Temporalidad</TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((it) => (
                    <TableRow key={it.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="pl-6">
                        <div className="w-[120px] aspect-[16/9] overflow-hidden rounded-xl border bg-slate-100 relative group">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Sin imagen</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900">{it.title || 'Sin título'}</span>
                          <span className="text-xs text-slate-500 line-clamp-1">{it.subtitle || it.text || 'Sin descripción'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${it.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                           <span className="text-xs font-semibold text-slate-700">{it.isActive ? 'Activo' : 'Inactivo'}</span>
                           {isExpired(it.endsAt) && <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 text-[10px]">Expirado</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {(it.startsAt || it.endsAt) ? (
                          <div className="flex flex-col text-[11px] text-slate-500">
                            {it.startsAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(it.startsAt).toLocaleDateString()}</span>}
                            {it.endsAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(it.endsAt).toLocaleDateString()}</span>}
                          </div>
                        ) : <span className="text-xs text-slate-400">Indefinido</span>}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/anuncios/${it.id}/edit`)} className="h-9 w-9 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(it)} className="h-9 w-9 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
