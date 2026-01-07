import React from 'react';
import { Separator } from "@/components/ui/separator";

interface TicketPreviewProps {
    data: {
        companyName: string;
        companyAddress?: string;
        locationName?: string;
        items: { name: string; quantity: number; price: number }[];
        total: number;
        date: string;
        saleId?: string | number;
        paymentMethod?: string;
        customerName?: string;
    };
}


export const TicketPreview: React.FC<TicketPreviewProps> = ({ data }) => {
    return (
        <div className="w-[300px] bg-white text-black p-4 font-mono text-xs shadow-lg mx-auto border border-gray-200">
            <div className="text-center mb-4">
                <h2 className="font-bold text-lg mb-1">{data.companyName}</h2>
                {data.locationName && <p className="font-semibold">{data.locationName}</p>}
                {data.companyAddress && <p>{data.companyAddress}</p>}
                <p className="mt-2 font-bold uppercase border-b border-black inline-block">Ticket de Venta</p>

                <div className="mt-2 text-left">
                    {data.saleId && <p>Folio: #{data.saleId}</p>}
                    <p>Fecha: {data.date}</p>
                    {data.customerName && <p>Cliente: {data.customerName}</p>}
                </div>
            </div>

            <div className="border-b border-black border-dashed my-2" />

            <div className="grid grid-cols-[auto_1fr_auto] gap-2 mb-2 font-bold">
                <span>CANT</span>
                <span>PRODUCTO</span>
                <span>IMPORTE</span>
            </div>

            <div className="border-b border-black border-dashed my-2" />

            <div className="space-y-1 mb-4">
                {data.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[auto_1fr_auto] gap-2">
                        <span className="w-8">{item.quantity}</span>
                        <span className="truncate">{item.name.substring(0, 18)}</span>
                        <span className="text-right w-16">
                            ${(item.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="border-b border-black border-dashed my-2" />

            <div className="flex justify-end font-bold text-sm mb-1">
                <span>TOTAL: ${data.total.toFixed(2)}</span>
            </div>

            {data.paymentMethod && (
                <div className="text-right text-xs mb-4">
                    Metodo: {data.paymentMethod}
                </div>
            )}

            <div className="text-center mt-8 space-y-4">
                <p>Gracias por su compra!</p>
                <div className="border-b border-black border-dashed w-3/4 mx-auto" />
            </div>
        </div>
    );
};
