'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnuncioForm } from '@/components/anuncios/anuncio-form';
import { api } from '@/lib/api/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditAnuncioPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAd = async () => {
       if (!token || !id) return;
       try {
         setLoading(true);
         setError(null);
         
         // 1. Resolver compañia de forma exhaustiva
         let cid = user?.company_id ? String(user.company_id) : undefined;
         
         // Si no viene en el 'user', buscamos en el perfil
         if (!cid || cid === 'undefined') {
           try {
             const r = await api.userCompanies.get(token);
             const data = r.data;
             // Buscamos en todas las profundidades posibles según la API
             cid = String(
               data?.id || 
               data?.company_id || 
               data?.company?.id || 
               data?.data?.id || 
               data?.data?.company_id ||
               ''
             );
           } catch (err) {
             console.error('Error fetching company:', err);
           }
         }

         if (!cid || cid === '' || cid === 'undefined') {
           setError('No se pudo determinar tu negocio. Reintenta iniciando sesión.');
           setLoading(false);
           return;
         }

         // 2. Intentar cargar el anuncio específico
         try {
           const res = await api.companies.getAnnouncement(cid, id as string, token);
           if (res.success && res.data) {
             const raw = (res.data as any)?.data ?? res.data;
             setAd(raw);
             return;
           }
         } catch (adErr) {
           console.warn('getAnnouncement failed, trying fallback from list...', adErr);
         }

         // 3. Fallback: Si falló el GET directo, lo buscamos en la lista (que sabemos que funciona)
         const listRes = await api.companies.listAnnouncements(cid, token, { per_page: 100 });
         const list = (listRes.data as any)?.data ?? listRes.data ?? [];
         const found = Array.isArray(list) ? list.find((item: any) => String(item.id) === String(id)) : null;

         if (found) {
           setAd(found);
         } else {
           setError('No pudimos encontrar este anuncio en tu listado.');
         }
       } catch (e) {
         console.error('Final Error loading announcement:', e);
         setError('Ocurrió un error inesperado al conectar con el servidor.');
       } finally {
         setLoading(false);
       }
    };
    loadAd();
  }, [id, token, user]);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Cargando información del anuncio...</p>
    </div>
  );

  if (error || !ad) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <p className="text-red-500 font-medium">{error || 'No se pudo cargar el anuncio.'}</p>
      <Button onClick={() => router.push('/dashboard/anuncios')} variant="outline" className="rounded-xl">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al listado
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <AnuncioForm key={ad.id} initialData={ad} isEditing={true} />
    </div>
  );
}
