"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Globe,
    Plus,
    ExternalLink,
    ShieldCheck,
    Server,
    ArrowRight,
    Crown,
    Info,
    CheckCircle2,
    Copy,
    RefreshCw,
    AlertCircle
} from "lucide-react";

export default function DominiosPage() {
    const [domain, setDomain] = useState("");

    const handleCopyIP = () => {
        navigator.clipboard.writeText("76.76.21.21");
        // Simplified toast alternative
        alert("IP copiada: 76.76.21.21");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gesti&oacute;n de Dominios</h2>
                    <p className="text-muted-foreground">Configura y personaliza la direcci&oacute;n web de tu negocio</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Actualizar Estado
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        Configurar Nuevo
                    </Button>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dominio Primario</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">fynlink.shop/mi-tienda</div>
                        <p className="text-xs text-muted-foreground">Subdominio predeterminado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SSL Status</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">Secure</div>
                        <p className="text-xs text-muted-foreground">Certificado activo</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">DNS Propagaci&oacute;n</CardTitle>
                        <Server className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-xs text-muted-foreground">Globalmente disponible</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900">Custom Domain</CardTitle>
                        <Crown className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">Premium</div>
                        <p className="text-xs text-emerald-700">Función activable</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Config Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Domain Info */}
                    <Card>
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg">Dominio Actual</CardTitle>
                            <CardDescription>La direcci&oacute;n donde tus clientes te encuentran hoy</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">fynlink.shop/mi-tienda</p>
                                        <span className="text-xs text-slate-500">Predeterminado del sistema</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 underline">
                                    Visitar sitio
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connect Existing Domain */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Plus className="h-5 w-5 text-indigo-500" />
                                <CardTitle className="text-lg font-bold">Conectar dominio existente</CardTitle>
                            </div>
                            <CardDescription>Configura los registros DNS en tu proveedor actual (GoDaddy, Namecheap, etc.)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg border border-slate-100 mt-4">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">Tipo</th>
                                            <th className="px-6 py-3">Nombre / Host</th>
                                            <th className="px-6 py-3">Valor / Apunta a</th>
                                            <th className="px-6 py-3 text-right">Acci&oacute;n</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-900">A</td>
                                            <td className="px-6 py-4 font-mono text-sm">@</td>
                                            <td className="px-6 py-4 font-mono text-sm text-blue-600">76.76.21.21</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={handleCopyIP}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-900">CNAME</td>
                                            <td className="px-6 py-4 font-mono text-sm">www</td>
                                            <td className="px-6 py-4 font-mono text-sm text-blue-600">cname.fynlink.shop</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/30 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 italic mt-2 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Los cambios pueden tardar hasta 24h en reflejarse globalmente.
                            </p>
                        </CardFooter>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Buy Domain Section */}
                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md">Comprar Dominio</CardTitle>
                            <CardDescription>Busca una direcci&oacute;n m&aacute;s amigable</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="mi-tienda.com"
                                        className="pl-10 h-10 border-slate-200"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                    Buscar Disponibilidad
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help/Explanation Card */}
                    <Card className="bg-slate-50 border-none">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="h-5 w-5 text-slate-400" />
                                <CardTitle className="text-sm font-bold">Personalizaci&oacute;n</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Un dominio personalizado (<span className="text-indigo-600 font-bold">tutienda.com</span>) aumenta la confianza de tus clientes y mejora el posicionamiento SEO de tu marca de forma directa.
                            </p>
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Certificado SSL Gratuito
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Renovaci&oacute;n Autom&aacute;tica
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Redirecci&oacute;n Segura
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
