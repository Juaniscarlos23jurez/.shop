"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCard, ProductList, CouponCard, GeneratedImageCard } from "@/components/ai/generated-ui";

export default function AIAssistantPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        initialMessages: [
            {
                id: "welcome",
                role: "assistant",
                content: "¡Hola! Soy tu Asistente IA. ¿En qué puedo ayudarte hoy? Puedo analizar tus ventas, recomendar productos o crear cupones.",
            },
        ],
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Asistente IA</h1>
                    <p className="text-sm text-muted-foreground">
                        Potenciado por Vercel AI SDK
                    </p>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {m.role === "assistant" && (
                                    <Avatar className="w-8 h-8 border bg-background">
                                        <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                                        <AvatarImage src="/bot-avatar.png" />
                                    </Avatar>
                                )}

                                <div
                                    className={`flex flex-col gap-2 rounded-lg px-4 py-3 max-w-[80%] ${m.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-white border text-foreground shadow-sm"
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>

                                    {/* Tool Invocations - Generative UI */}
                                    {m.toolInvocations?.map((toolInvocation) => {
                                        const toolCallId = toolInvocation.toolCallId;
                                        const addResult = (result: any) => (
                                            <div key={toolCallId} className="w-full">
                                                {toolInvocation.toolName === 'getStats' && (
                                                    <StatsCard data={result} />
                                                )}
                                                {toolInvocation.toolName === 'recommendProducts' && (
                                                    <ProductList products={result} />
                                                )}
                                                {toolInvocation.toolName === 'generateCoupon' && (
                                                    <CouponCard coupon={result} />
                                                )}
                                                {toolInvocation.toolName === 'generateImage' && (
                                                    <GeneratedImageCard data={result} />
                                                )}
                                            </div>
                                        );

                                        // Render based on state
                                        if ('result' in toolInvocation) {
                                            return addResult(toolInvocation.result);
                                        }
                                        return (
                                            <div key={toolCallId} className="mt-2 text-xs text-muted-foreground italic flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" /> {toolInvocation.toolName}...
                                            </div>
                                        );
                                    })}
                                </div>

                                {m.role === "user" && (
                                    <Avatar className="w-8 h-8 border bg-background">
                                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        <AvatarImage src="/user-avatar.png" />
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start gap-3">
                                <Avatar className="w-8 h-8 border bg-background">
                                    <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-white border rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Pensando...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 bg-background border-t">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Escribe tu mensaje aquí..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !(input || '').trim()}>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
