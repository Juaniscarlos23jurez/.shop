"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} = Lucide as Record<string, React.ComponentType<any>>;
import { cn } from "@/lib/utils";

type CommentChannel = "app" | "web" | "email";
type CommentStatus = "responded" | "pending" | "resolved";

interface CommentEntry {
  id: string;
  userName: string;
  userRole?: string;
  userHandle?: string;
  channel: CommentChannel;
  platform: string;
  rating: number;
  comment: string;
  tags: string[];
  location: string;
  createdAt: string;
  status: CommentStatus;
  responseTime?: string;
  sentiment: "positive" | "neutral" | "negative";
}

const COMMENTS_DATA: CommentEntry[] = [
  {
    id: "cmt-001",
    userName: "Ana Torres",
    userRole: "Cliente recurrente",
    userHandle: "@ana.t",
    channel: "app",
    platform: "iOS • iPhone 15",
    rating: 5,
    comment:
      "Me encantó la nueva experiencia de ordenar desde la app. Todo rápido y sin errores ✨",
    tags: ["Experiencia", "UX"],
    location: "CDMX · Condesa",
    createdAt: "2025-12-12T14:30:00Z",
    status: "responded",
    responseTime: "1h 24m",
    sentiment: "positive",
  },
  {
    id: "cmt-002",
    userName: "Carlos Pérez",
    userRole: "Cliente nuevo",
    userHandle: "@carlospz",
    channel: "web",
    platform: "Chrome • Windows",
    rating: 3,
    comment:
      "El formulario pide demasiados datos, podrían simplificarlo o guardar mi información para futuros pedidos.",
    tags: ["Checkout", "Fricción"],
    location: "Monterrey · Centro",
    createdAt: "2025-12-11T18:05:00Z",
    status: "pending",
    responseTime: "—",
    sentiment: "neutral",
  },
  {
    id: "cmt-003",
    userName: "Patricia Gómez",
    userRole: "Miembro VIP",
    userHandle: "@paty.g",
    channel: "app",
    platform: "Android • Pixel 9",
    rating: 4,
    comment:
      "Amo los recordatorios push para mis cupones, pero a veces llegan muy tarde en la noche.",
    tags: ["Notificaciones"],
    location: "Guadalajara · Providencia",
    createdAt: "2025-12-10T09:42:00Z",
    status: "responded",
    responseTime: "45m",
    sentiment: "positive",
  },
  {
    id: "cmt-004",
    userName: "Luis Hernández",
    userRole: "Cliente web",
    userHandle: "@lhernandez",
    channel: "web",
    platform: "Safari • macOS",
    rating: 2,
    comment:
      "El chat de soporte nunca respondió. Tuve que llamar para resolver mi duda sobre envíos.",
    tags: ["Soporte", "Urgente"],
    location: "Querétaro · Centro",
    createdAt: "2025-12-08T21:10:00Z",
    status: "pending",
    responseTime: "—",
    sentiment: "negative",
  },
];

const sentimentColors: Record<CommentEntry["sentiment"], string> = {
  positive: "text-emerald-600 bg-emerald-50 border-emerald-100",
  neutral: "text-amber-600 bg-amber-50 border-amber-100",
  negative: "text-rose-600 bg-rose-50 border-rose-100",
};

export default function ComentariosPage() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | CommentChannel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CommentStatus>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2">("all");
  const [sortOption, setSortOption] = useState<"recent" | "rating-desc" | "rating-asc">("recent");

  const filteredComments = useMemo(() => {
    return COMMENTS_DATA.filter((comment) => {
      const matchesSearch =
        comment.comment.toLowerCase().includes(search.toLowerCase()) ||
        comment.userName.toLowerCase().includes(search.toLowerCase()) ||
        (comment.userHandle?.toLowerCase() || "").includes(search.toLowerCase());
      const matchesChannel = channelFilter === "all" || comment.channel === channelFilter;
      const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
      const matchesRating =
        ratingFilter === "all" || Math.floor(comment.rating) === Number(ratingFilter);
      return matchesSearch && matchesChannel && matchesStatus && matchesRating;
    }).sort((a, b) => {
      if (sortOption === "rating-desc") return b.rating - a.rating;
      if (sortOption === "rating-asc") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [search, channelFilter, statusFilter, ratingFilter, sortOption]);

  const totalComments = COMMENTS_DATA.length;
  const responded = COMMENTS_DATA.filter((c) => c.status === "responded").length;
  const responseRate = totalComments ? Math.round((responded / totalComments) * 100) : 0;
  const avgRating =
    COMMENTS_DATA.reduce((acc, comment) => acc + comment.rating, 0) / (totalComments || 1);

  const mobileBreakdown = COMMENTS_DATA.filter((c) => c.channel === "app").length;
  const webBreakdown = totalComments - mobileBreakdown;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
                Feedback en tiempo real
              </p>
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                Comentarios de clientes
              </h1>
            </div>
          </div>
          <p className="text-slate-600 mt-3 max-w-2xl">
            Monitorea la voz del cliente en app y web. Prioriza las conversaciones críticas,
            mide tu tiempo de respuesta y detecta oportunidades de mejora en UX.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar reporte
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Sparkles className="h-4 w-4" />
            Inteligencia de sentimiento
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-violet-100">
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">Promedio general</p>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              {avgRating.toFixed(1)}
              <Star className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Basado en {totalComments} reseñas en los últimos 14 días
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">Tiempo de respuesta</p>
            <CardTitle className="text-3xl font-bold">{responseRate}%</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {responded} comentarios respondidos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Origen App</p>
              <CardTitle className="text-3xl font-bold">{mobileBreakdown}</CardTitle>
            </div>
            <div className="rounded-full bg-slate-100 p-2">
              <Smartphone className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {Math.round((mobileBreakdown / totalComments) * 100) || 0}% del total
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Origen Web</p>
              <CardTitle className="text-3xl font-bold">{webBreakdown}</CardTitle>
            </div>
            <div className="rounded-full bg-slate-100 p-2">
              <Globe className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {Math.round((webBreakdown / totalComments) * 100) || 0}% del total
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-none bg-white/80 backdrop-blur">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Buscar</p>
                <Input
                  placeholder="Usuario, comentario, etiqueta"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                    <SelectItem value="responded">Respondidos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-white shadow-lg/30 border-slate-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-violet-600" />
              Conversaciones recientes
            </CardTitle>
            <p className="text-sm text-slate-500">
              {filteredComments.length} resultados · Última actualización hace 3 min
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredComments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">
                  No hay comentarios con los filtros seleccionados
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Ajusta los filtros o exporta el historial completo para analizar tendencias.
                </p>
              </div>
            )}

            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-200 to-violet-100 text-violet-700 flex items-center justify-center font-semibold">
                          {comment.userName
                            .split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{comment.userName}</p>
                          <p className="text-xs text-slate-500">
                            {comment.userRole} · {comment.userHandle}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize border rounded-full px-3 py-1 text-xs flex items-center gap-1",
                          comment.channel === "app" ? "border-violet-200 text-violet-700" : "border-slate-200 text-slate-600"
                        )}
                      >
                        {comment.channel === "app" ? <Smartphone className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {comment.channel === "app" ? "App" : "Web"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-xs",
                          sentimentColors[comment.sentiment]
                        )}
                      >
                        {comment.sentiment === "positive"
                          ? "Sentimiento positivo"
                          : comment.sentiment === "neutral"
                          ? "Sentimiento neutral"
                          : "Sentimiento negativo"}
                      </Badge>
                    </div>

                    <p className="text-slate-700 text-base leading-relaxed">{comment.comment}</p>

                    <div className="flex flex-wrap items-center gap-2">
                      {comment.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock4 className="h-4 w-4" />
                        {new Date(comment.createdAt).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {comment.location}
                      </span>
                      <span>{comment.platform}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 min-w-[180px]">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const filled = comment.rating >= index + 1;
                        const half = !filled && comment.rating > index && comment.rating < index + 1;
                        if (filled) return <Star key={index} className="h-4 w-4 fill-current" />;
                        if (half) return <StarHalf key={index} className="h-4 w-4 fill-current" />;
                        return <Star key={index} className="h-4 w-4" />;
                      })}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        comment.status === "responded"
                          ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                          : "border-amber-200 text-amber-600 bg-amber-50"
                      )}
                    >
                      {comment.status === "responded" ? "Respondido" : "Pendiente"}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      SLA respuesta: <span className="font-semibold text-slate-700">{comment.responseTime}</span>
                    </p>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Reply className="h-4 w-4" />
                      {comment.status === "responded" ? "Ver respuesta" : "Responder ahora"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-violet-100 bg-gradient-to-b from-white to-violet-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-600" />
                Insights accionables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-violet-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Checkout con fricción</p>
                <p className="text-sm text-slate-500 mt-1">
                  32% de los comentarios web mencionan formularios extensos. Automatiza el autocompletado
                  con datos guardados para mejorar conversión.
                </p>
              </div>
              <div className="rounded-xl border border-violet-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Notificaciones nocturnas</p>
                <p className="text-sm text-slate-500 mt-1">
                  Ajusta la ventana de envíos push entre 8am y 9pm para mejorar la percepción en Android.
                </p>
              </div>
              <div className="rounded-xl border border-violet-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Soporte proactivo</p>
                <p className="text-sm text-slate-500 mt-1">
                  Crea respuestas automáticas cuando el chat no esté disponible y ofrece CTA directo a WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800">Distribución por sentimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["positive", "neutral", "negative"] as CommentEntry["sentiment"][]).map((sentiment) => {
                const count = COMMENTS_DATA.filter((c) => c.sentiment === sentiment).length;
                const percentage = Math.round((count / totalComments) * 100) || 0;
                return (
                  <div key={sentiment} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="capitalize">
                        {sentiment === "positive"
                          ? "Positivo"
                          : sentiment === "neutral"
                          ? "Neutral"
                          : "Negativo"}
                      </span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          sentiment === "positive"
                            ? "bg-emerald-400"
                            : sentiment === "neutral"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
