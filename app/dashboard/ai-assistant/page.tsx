"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles, Loader2, History, PlusCircle, MessageSquare, ArrowRight, Zap, TrendingUp, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCard, ProductList, CouponCard, GeneratedImageCard } from "@/components/ai/generated-ui";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const SUGGESTED_ACTIONS = [
    {
        icon: TrendingUp,
        label: "Analizar Rendimiento",
        subLabel: "Estadísticas de ventas reales",
        prompt: "Analiza el rendimiento de mi negocio. Muéstrame las estadísticas de ventas de los últimos 30 días y dame insights sobre cómo mejorar."
    },
    {
        icon: Zap,
        label: "Recomendar Productos",
        subLabel: "Basado en ventas reales",
        prompt: "¿Qué producto nuevo crees que pueda agregar a mi catálogo? Analiza mis ventas actuales y dame recomendaciones estratégicas."
    },
    {
        icon: ImageIcon,
        label: "Estrategia de Inventario",
        subLabel: "Optimizar stock",
        prompt: "Revisa mis ventas recientes y recomiéndame una estrategia de inventario para los productos más vendidos."
    },
    {
        icon: Sparkles,
        label: "Análisis de Tendencias",
        subLabel: "Patrones de compra",
        prompt: "Analiza los patrones de compra de mi negocio y sugiere acciones para aumentar las ventas."
    }
];

export default function AIAssistantPage() {
    const { token, user } = useAuth();

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: () => ({
                token: token, // Send token from AuthContext
            }),
        }),
    });

    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSuggestionClick = async (prompt: string) => {
        try {
            await sendMessage({ text: prompt });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
        }
    };

    return (
        <div className="flex h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)] overflow-hidden bg-slate-50/50">
            {/* Sidebar History (Desktop) */}
            {isHistoryOpen && (
                <div className="hidden md:flex flex-col w-64 border-r bg-white animate-in slide-in-from-left duration-300">
                    <div className="p-4 border-b flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-2">
                            <History className="w-4 h-4" /> Historial
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PlusCircle className="w-4 h-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                        <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground px-2 mb-2">Hoy</div>
                            <Button variant="secondary" className="w-full justify-start text-xs h-9 font-normal overflow-hidden text-ellipsis mb-1">
                                <MessageSquare className="w-3 h-3 mr-2 opacity-70" />
                                Análisis de ventas Q3
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs h-9 font-normal overflow-hidden text-ellipsis">
                                <MessageSquare className="w-3 h-3 mr-2 opacity-70" />
                                Campaña Navidad
                            </Button>
                        </div>
                    </ScrollArea>

                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative">
                {/* Header */}
                <div className="h-14 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                            <History className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-1.5 rounded-lg shadow-sm">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-sm leading-none">Asistente de Negocio</h1>
                                <p className="text-[11px] text-muted-foreground leading-none mt-1">Soporte Inteligente</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full p-4 md:p-8" ref={scrollRef}>
                        <div className="max-w-3xl mx-auto space-y-6 pb-4">

                            {messages.length === 0 && (
                                <div className="mt-10 md:mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center space-y-2">
                                        <div className="mx-auto bg-white p-4 rounded-2xl shadow-sm border w-16 h-16 flex items-center justify-center mb-4 text-emerald-500">
                                            <Sparkles className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900">¿Cómo puedo ayudarte hoy?</h2>
                                        <p className="text-slate-500 max-w-md mx-auto">
                                            Analizo tus datos para darte insights, crear campañas y cupones.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {SUGGESTED_ACTIONS.map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestionClick(action.prompt)}
                                                className="group text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                                            >
                                                <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                                                    <action.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-slate-900 group-hover:text-emerald-700">
                                                        {action.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {action.subLabel}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((m: any) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {m.role === "assistant" && (
                                        <Avatar className="w-8 h-8 border bg-white shadow-sm mt-1">
                                            <AvatarFallback><Bot className="w-4 h-4 text-emerald-600" /></AvatarFallback>
                                            <AvatarImage src="/bot-avatar.png" />
                                        </Avatar>
                                    )}

                                    <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                                        {/* Render message parts */}
                                        {m.parts?.map((part: any, index: number) => {
                                            // Text part
                                            if (part.type === 'text') {
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${m.role === "user"
                                                            ? "bg-slate-900 text-white rounded-br-sm"
                                                            : "bg-white border text-slate-800 rounded-bl-sm"
                                                            }`}
                                                    >
                                                        <div className="whitespace-pre-wrap">{part.text}</div>
                                                    </div>
                                                );
                                            }

                                            // Tool invocation part
                                            if (part.type === 'tool-invocation') {
                                                return (
                                                    <div key={index} className="w-full mt-2">
                                                        {!part.result && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                                                                <Loader2 className="w-3 h-3 animate-spin" /> Procesando...
                                                            </div>
                                                        )}
                                                        {part.result && (
                                                            <>
                                                                {part.toolName === 'getStats' && <StatsCard data={part.result} />}
                                                                {part.toolName === 'recommendProducts' && <ProductList products={part.result} />}
                                                                {part.toolName === 'generateCoupon' && <CouponCard coupon={part.result} />}
                                                                {part.toolName === 'generateImage' && <GeneratedImageCard data={part.result} />}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>

                                    {m.role === "user" && (
                                        <Avatar className="w-8 h-8 border bg-white shadow-sm mt-1">
                                            <AvatarFallback><User className="w-4 h-4 text-slate-600" /></AvatarFallback>
                                            <AvatarImage src="/user-avatar.png" />
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {status !== 'ready' && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex justify-start gap-4">
                                    <Avatar className="w-8 h-8 border bg-white shadow-sm">
                                        <AvatarFallback><Bot className="w-4 h-4 text-emerald-600" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl rounded-bl-sm border shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="shrink-0 p-4 bg-white border-t">
                    <form
                        onSubmit={handleFormSubmit}
                        className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-50 border rounded-xl overflow-hidden px-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500"
                    >
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground h-10 w-10">
                            <PlusCircle className="w-5 h-5" />
                        </Button>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje aquí..."
                            className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-3 text-base outline-none"
                            disabled={status !== 'ready'}
                        />
                        <Button
                            type="submit"
                            disabled={status !== 'ready'}
                            className="h-10 w-10 rounded-lg shrink-0 transition-colors bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
                            size="icon"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </form>
                    <div className="max-w-3xl mx-auto mt-2 text-center text-[10px] text-muted-foreground">
                        La IA puede cometer errores. Verifica la información importante.
                    </div>
                </div>
            </div>
        </div>
    );
}