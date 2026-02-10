"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect } from "react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    whatsappUrl?: string;
    salesEmail?: string;
    calendlyUrl?: string;
}

export function ContactModal({
    isOpen,
    onClose,
    whatsappUrl = 'https://wa.me/522381638747',
    salesEmail = 'info@fynlink.shop',
    calendlyUrl = 'https://calendly.com/juancarlosjuarez26/30min'
}: ContactModalProps) {
    useEffect(() => {
        console.log('ContactModal isOpen changed:', isOpen);
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-3xl font-black text-[#0f172a]">
                        Conecta con nuestro equipo
                    </DialogTitle>
                    <p className="text-[#64748b] text-lg mt-2">
                        Elige el canal que prefieras. Respondemos rápido.
                    </p>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-4">
                    {/* WhatsApp Card */}
                    <Card className="p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-[#25D366] shadow-md flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">WhatsApp</h3>
                                <p className="text-base text-gray-600 mb-3">Escríbenos y te atendemos al instante.</p>
                                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                                    <Button className="w-full bg-[#22c55e] hover:bg-green-600 text-white">
                                        Abrir WhatsApp
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Email Card */}
                    <Card className="p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-[#0f172a]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M4 6H20C21.1046 6 22 6.89543 22 8V16C22 17.1046 21.1046 18 20 18H4C2.89543 18 2 17.1046 2 16V8C2 6.89543 2.89543 6 4 6Z"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M4 8L11.1056 12.737C11.6686 13.1121 12.3314 13.1121 12.8944 12.737L20 8"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">Email</h3>
                                <p className="text-base text-gray-600 mb-3">Cuéntanos sobre tu negocio y te contactamos.</p>
                                <Link href={`mailto:${salesEmail}`} onClick={onClose}>
                                    <Button variant="outline" className="w-full">
                                        Enviar correo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Calendly Card */}
                    <Card className="p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-[#0f172a]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            x="4"
                                            y="5"
                                            width="16"
                                            height="15"
                                            rx="2"
                                            ry="2"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        />
                                        <path
                                            d="M8 3V7M16 3V7M4 9H20"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <rect x="8" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">Agendar demo</h3>
                                <p className="text-base text-gray-600 mb-3">Reserva una demo de 30 minutos.</p>
                                <Link href={calendlyUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                                    <Button variant="outline" className="w-full">
                                        Ver disponibilidad
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
