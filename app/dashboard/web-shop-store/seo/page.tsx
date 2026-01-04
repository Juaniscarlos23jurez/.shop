"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Image as ImageIcon,
    Globe,
    Code,
    ShieldCheck,
    TrendingUp,
    Layout,
    ExternalLink,
    Crown,
    CheckCircle2,
    RefreshCw
} from "lucide-react";

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
    </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.05.4-.05.81-.01 1.21.03 1.02.49 2.03 1.25 2.7.92.81 2.21 1.09 3.39.73 1.06-.32 1.93-1.12 2.37-2.11.23-.46.34-.98.35-1.5-.03-4.02 0-8.04-.01-12.06z" />
    </svg>
);

export default function SEOPage() {
    const [isPublic, setIsPublic] = useState(true);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">SEO y Seguimientos</h2>
                    <p className="text-muted-foreground">Optimiza tu presencia en buscadores y redes sociales</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Restablecer
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        Guardar cambios
                    </Button>
                </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visibilidad Index</CardTitle>
                        <Globe className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isPublic ? "Activada" : "Desactivada"}</div>
                        <p className="text-xs text-muted-foreground">Estado en motores de b&uacute;squeda</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Seguimiento</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3 Activos</div>
                        <p className="text-xs text-muted-foreground">GA4, FB Pixel, TikTok</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                        <Search className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85/100</div>
                        <p className="text-xs text-muted-foreground">Optimización de metadatos</p>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-50 border-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900">Plan Premium</CardTitle>
                        <Crown className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">Requerido</div>
                        <p className="text-xs text-indigo-700">Para funciones avanzadas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Configuraci&oacute;n General</CardTitle>
                            <CardDescription>Visibilidad y presencia en el directorio</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Directorio p&uacute;blico y buscadores</Label>
                                    <p className="text-xs text-slate-500">Permitir que la tienda aparezca en el directorio p&uacute;blico y resultados de b&uacute;squeda</p>
                                </div>
                                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Nombre en el directorio (Slug)</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                        <span className="text-slate-400 font-medium">fynlink.shop/</span>
                                        <input
                                            className="bg-transparent border-none outline-none flex-1 p-0 text-slate-900 font-semibold"
                                            placeholder="nombre-de-tu-tienda"
                                        />
                                    </div>
                                    <Button variant="outline" size="icon">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Metadatos SEO</CardTitle>
                            <CardDescription>Define c&oacute;mo se presenta tu tienda ante los buscadores</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">T&iacute;tulo de la p&aacute;gina principal</Label>
                                <Input placeholder="Ej: Mi Tienda | Los mejores productos" className="bg-slate-50/50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Meta descripci&oacute;n</Label>
                                <Textarea
                                    placeholder="Ingresa una descripci&oacute;n para obtener un mejor posicionamiento en motores de b&uacute;squeda."
                                    className="min-h-[100px] bg-slate-50/50 resize-none"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>L&iacute;mite sugerido: 160 caracteres</span>
                                    <span>0 / 160</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Head Code */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Code className="h-5 w-5 text-slate-400" /> C&oacute;digo Personalizado
                            </CardTitle>
                            <CardDescription>A&ntilde;ade meta etiquetas manuales en la cabecera (&lt;head&gt;)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Etiquetas Meta HTML</Label>
                                <Textarea
                                    placeholder="<meta name='google-site-verification' content='...' />"
                                    className="font-mono text-xs min-h-[100px] bg-slate-900 text-slate-200 border-slate-800"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Se aplican autom&aacute;ticamente al cargar la tienda.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Visuals & Tracking */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Visual Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Medios Visuales</CardTitle>
                            <CardDescription>Multimedia para redes y pesta&ntilde;as</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Imagen de compartir (OG)</Label>
                                <div className="aspect-video rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group">
                                    <div className="text-center">
                                        <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2 group-hover:text-slate-400" />
                                        <p className="text-[10px] text-slate-400">1200x630px recomendado</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Favicon</Label>
                                <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-100">
                                    <div className="h-10 w-10 rounded border border-slate-200 bg-white flex items-center justify-center">
                                        <ImageIcon className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <Button variant="outline" size="sm" className="text-xs h-8">
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GA4 */}
                    <Card>
                        <CardHeader className="pb-3 px-6 pt-6">
                            <div className="flex items-center gap-2">
                                <GoogleIcon className="h-5 w-5" />
                                <CardTitle className="text-sm font-bold">Google Analytics</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase">ID de Medici&oacute;n</Label>
                                <Input placeholder="G-XXXXXXXXXX" className="h-9 font-mono text-sm bg-slate-50" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pixels */}
                    <Card>
                        <CardHeader className="pb-3 px-6 pt-6">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-indigo-500" /> P&iacute;xeles de Seguimiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <FacebookIcon className="h-4 w-4" />
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase">Facebook Pixel ID</Label>
                                </div>
                                <Input placeholder="ID de P&iacute;xel..." className="h-9 text-sm bg-slate-50" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <TikTokIcon className="h-4 w-4" />
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase">TikTok Pixel ID</Label>
                                </div>
                                <Input placeholder="ID de TikTok Pixel..." className="h-9 text-sm bg-slate-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
