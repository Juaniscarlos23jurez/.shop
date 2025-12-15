"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Lucide from "lucide-react";
const {
  MessageCircle,
  Star,
  StarHalf,
  Sparkles,
  Filter,
  Download,
  Reply,
  Smartphone,
  Globe,
  Clock4,
  MapPin,
  TrendingUp,
  Loader2,
  RefreshCcw,
} = Lucide as Record<string, React.ComponentType<any>>;
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { CompanyReview, CompanyReviewStats, ReviewStatus } from "@/types/api";
import { useToast } from "@/components/ui/use-toast";

const statusLabels: Record<ReviewStatus, string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
};

const statusColors: Record<ReviewStatus, string> = {
  pending: "border-amber-200 text-amber-600 bg-amber-50",
  approved: "border-emerald-200 text-emerald-600 bg-emerald-50",
  rejected: "border-rose-200 text-rose-600 bg-rose-50",
};

const channelInfo: Record<
  string,
  { label: string; icon: React.ComponentType<any>; accent: string }
> = {
  app: { label: "App", icon: Smartphone, accent: "border-violet-200 text-violet-700" },
  web: { label: "Web", icon: Globe, accent: "border-slate-200 text-slate-600" },
  store: { label: "Tienda", icon: MapPin, accent: "border-slate-200 text-slate-600" },
};

const recalcStats = (list: CompanyReview[]): CompanyReviewStats => {
  const total = list.length;
  const approved = list.filter((r) => r.status === "approved").length;
  const pending = list.filter((r) => r.status === "pending").length;
  const rejected = list.filter((r) => r.status === "rejected").length;
  const average_rating = total
    ? list.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
    : 0;
  return {
    total,
    approved,
    pending,
    rejected,
    average_rating,
  };
};

export default function ComentariosPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [stats, setStats] = useState<CompanyReviewStats | null>(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "app" | "web" | "store">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2">("all");
  const [sortOption, setSortOption] = useState<"recent" | "rating-desc" | "rating-asc">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<CompanyReview | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const companyId = user?.company_id ? String(user.company_id) : null;
  const hasAccess = Boolean(companyId && token);

  const fetchReviews = useCallback(async () => {
    if (!companyId || !token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.reviews.list(companyId, token);
      if (!response.success) {
        throw new Error(response.message || "No se pudieron cargar los comentarios");
      }

      const payload = response.data as any;
      const rawList =
        Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.reviews)
          ? payload.reviews
          : [];

      setReviews(rawList);

      if (payload?.stats || payload?.data?.stats || payload?.meta?.stats) {
        const incomingStats = payload.stats || payload.data?.stats || payload.meta?.stats;
        setStats(incomingStats as CompanyReviewStats);
      } else {
        setStats(recalcStats(rawList));
      }

      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      toast({
        variant: "destructive",
        title: "Error al cargar comentarios",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, token, toast]);

  useEffect(() => {
    if (!authLoading && hasAccess) {
      fetchReviews();
    } else if (!hasAccess) {
      setIsLoading(false);
    }
  }, [authLoading, hasAccess, fetchReviews]);

  const effectiveStats = useMemo(() => {
    const baseStats = stats || recalcStats(reviews);
    return {
      ...baseStats,
      average_rating: Number(baseStats.average_rating || 0),
    };
  }, [stats, reviews]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        const matchesSearch = [
          review.comment,
          review.customer_name,
          review.customer_handle,
          review.customer_email,
        ]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(search.toLowerCase()));

        const channelKey = (review.channel || "app").toLowerCase();
        const matchesChannel = channelFilter === "all" || channelKey === channelFilter;

        const matchesStatus = statusFilter === "all" || review.status === statusFilter;

        const matchesRating =
          ratingFilter === "all" || Math.floor(Number(review.rating || 0)) === Number(ratingFilter);

        return matchesSearch && matchesChannel && matchesStatus && matchesRating;
      })
      .sort((a, b) => {
        if (sortOption === "rating-desc") return Number(b.rating) - Number(a.rating);
        if (sortOption === "rating-asc") return Number(a.rating) - Number(b.rating);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reviews, search, channelFilter, statusFilter, ratingFilter, sortOption]);

  const appReviews = reviews.filter((review) => (review.channel || "app").toLowerCase() === "app");
  const webReviews = reviews.filter((review) => (review.channel || "web").toLowerCase() === "web");

  const handleOpenResponse = (review: CompanyReview) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
  };

  const handleCloseResponse = () => {
    setSelectedReview(null);
    setResponseText("");
    setIsSubmittingResponse(false);
  };

  const handleSubmitResponse = async () => {
    if (!companyId || !token || !selectedReview) return;
    if (!responseText.trim()) {
      toast({
        variant: "destructive",
        title: "Respuesta requerida",
        description: "Escribe una respuesta antes de enviar",
      });
      return;
    }
    setIsSubmittingResponse(true);
    try {
      const response = await api.reviews.respond(companyId, selectedReview.id, responseText.trim(), token);
      if (!response.success) {
        throw new Error(response.message || "No se pudo enviar la respuesta");
      }
      const nextReviews = reviews.map((review) =>
        review.id === selectedReview.id
          ? {
              ...review,
              response: responseText.trim(),
              responded_at: new Date().toISOString(),
            }
          : review
      );
      setReviews(nextReviews);
      setStats(recalcStats(nextReviews));
      toast({ title: "Respuesta enviada", description: "Se notificó al cliente" });
      handleCloseResponse();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al responder";
      toast({ variant: "destructive", title: "No se pudo responder", description: message });
      setIsSubmittingResponse(false);
    }
  };

  const handleStatusUpdate = async (reviewId: number, status: ReviewStatus) => {
    if (!companyId || !token) return;
    setStatusUpdatingId(reviewId);
    try {
      const response = await api.reviews.updateStatus(companyId, reviewId, status, token);
      if (!response.success) {
        throw new Error(response.message || "No se pudo actualizar el estado");
      }
      const nextReviews = reviews.map((review) =>
        review.id === reviewId ? { ...review, status } : review
      );
      setReviews(nextReviews);
      setStats(recalcStats(nextReviews));
      toast({ title: "Estado actualizado", description: "El comentario cambió de estado" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar";
      toast({ variant: "destructive", title: "Acción no completada", description: message });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const statusDistribution = [
    { key: "approved" as ReviewStatus, label: "Aprobados", color: "bg-emerald-400" },
    { key: "pending" as ReviewStatus, label: "Pendientes", color: "bg-amber-400" },
    { key: "rejected" as ReviewStatus, label: "Rechazados", color: "bg-rose-400" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
                Feedback en tiempo real
              </p>
              <h1 className="text-3xl font-bold leading-tight text-slate-900">Comentarios de clientes</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-slate-600">
            Monitorea la voz del cliente en todos tus canales, responde más rápido y detecta oportunidades de mejora.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" disabled={isLoading || !hasAccess} onClick={fetchReviews}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Actualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar reporte
          </Button>
          
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-violet-100">
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">Promedio general</p>
            <CardTitle className="flex items-center gap-2 text-3xl font-bold">
              {effectiveStats.average_rating.toFixed(1)}
              <Star className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Basado en {effectiveStats.total} reseñas
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">Tiempo de respuesta</p>
            <CardTitle className="text-3xl font-bold">
              {effectiveStats.total
                ? `${Math.round(((effectiveStats.total - effectiveStats.pending) / effectiveStats.total) * 100)}%`
                : "0%"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {effectiveStats.total - effectiveStats.pending} comentarios respondidos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <p className="text-sm text-slate-500">Origen App</p>
              <CardTitle className="text-3xl font-bold">{appReviews.length}</CardTitle>
            </div>
            <div className="rounded-full bg-slate-100 p-2">
              <Smartphone className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {reviews.length ? Math.round((appReviews.length / reviews.length) * 100) : 0}% del total
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <p className="text-sm text-slate-500">Origen Web</p>
              <CardTitle className="text-3xl font-bold">{webReviews.length}</CardTitle>
            </div>
            <div className="rounded-full bg-slate-100 p-2">
              <Globe className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {reviews.length ? Math.round((webReviews.length / reviews.length) * 100) : 0}% del total
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 bg-white/80 shadow-none backdrop-blur">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Buscar</p>
                <Input
                  placeholder="Usuario, comentario, etiqueta"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Canal</p>
                <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as any)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="store">Tienda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Rating</p>
                <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as any)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                    <SelectItem value="4">4 estrellas</SelectItem>
                    <SelectItem value="3">3 estrellas</SelectItem>
                    <SelectItem value="2">2 estrellas o menos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as any)}>
                <SelectTrigger className="h-11 w-44">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="rating-desc">Mejor calificados</SelectItem>
                  <SelectItem value="rating-asc">Menor calificados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-11 gap-2">
                <Filter className="h-4 w-4" />
                Filtros avanzados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasAccess && (
        <Card className="border-dashed border-slate-300 bg-slate-50">
          <CardContent className="py-8 text-center text-slate-600">
            Conecta una compañía para administrar los comentarios de tus clientes.
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-rose-200 bg-rose-50 text-rose-700">
          <CardContent className="py-6 text-sm">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-100 bg-white shadow-lg/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-violet-600" />
              Conversaciones recientes
            </CardTitle>
            <p className="text-sm text-slate-500">
              {filteredReviews.length} resultados · Última actualización {lastUpdated ? lastUpdated.toLocaleTimeString("es-MX") : "—"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                <p className="text-sm text-slate-500">Sincronizando reseñas...</p>
              </div>
            )}

            {!isLoading && filteredReviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">
                  No hay comentarios con los filtros seleccionados
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ajusta los filtros o exporta el historial completo para analizar tendencias.
                </p>
              </div>
            )}

            {filteredReviews.map((review) => {
              const channelKey = (review.channel || "app").toLowerCase();
              const channel = channelInfo[channelKey] || channelInfo.app;
              const initials = (review.customer_name || "Cliente")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0]!.toUpperCase())
                .join("");

              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-violet-100 font-semibold text-violet-700">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{review.customer_name}</p>
                            <p className="text-xs text-slate-500">
                              {review.customer_email || "Cliente"}
                              {review.customer_handle ? ` · ${review.customer_handle}` : ""}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-xs", channel.accent)}
                        >
                          <channel.icon className="h-3 w-3" />
                          {channel.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("rounded-full px-3 py-1 text-xs", statusColors[review.status])}
                        >
                          {statusLabels[review.status]}
                        </Badge>
                      </div>

                      <p className="text-base leading-relaxed text-slate-700">{review.comment}</p>

                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {review.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                       
                    </div>

                    <div className="flex min-w-[220px] flex-col items-start gap-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const ratingValue = Number(review.rating || 0);
                          const filled = ratingValue >= index + 1;
                          const half = !filled && ratingValue > index && ratingValue < index + 1;
                          if (filled) return <Star key={index} className="h-4 w-4 fill-current" />;
                          if (half) return <StarHalf key={index} className="h-4 w-4 fill-current" />;
                          return <Star key={index} className="h-4 w-4" />;
                        })}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusColors[review.status])}
                      >
                        {statusLabels[review.status]}
                      </Badge>
                      <Select
                        value={review.status}
                        onValueChange={(value) => handleStatusUpdate(review.id, value as ReviewStatus)}
                        disabled={statusUpdatingId === review.id}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="w-full gap-2" size="sm" onClick={() => handleOpenResponse(review)} disabled={!hasAccess}>
                        <Reply className="h-4 w-4" />
                        {review.response ? "Editar respuesta" : "Responder"}
                      </Button>
                      {review.response && (
                        <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <p className="font-semibold text-slate-700">Respuesta del equipo</p>
                          <p className="mt-1 text-slate-600">{review.response}</p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {review.responded_at
                              ? new Date(review.responded_at).toLocaleString("es-MX", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "Hace un momento"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        
      </div>

      <Dialog open={Boolean(selectedReview)} onOpenChange={(open) => !open && handleCloseResponse()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder comentario</DialogTitle>
            <DialogDescription>
              Esta respuesta será visible para {selectedReview?.customer_name || "la persona"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{selectedReview?.customer_name}</p>
              <p className="mt-2 text-slate-600">{selectedReview?.comment}</p>
            </div>
            <Textarea
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
              placeholder="Gracias por tu comentario..."
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseResponse}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitResponse} disabled={isSubmittingResponse}>
              {isSubmittingResponse && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
