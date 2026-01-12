"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";

interface Payment {
    id: number | string;
    amount: number | string;
    currency: string;
    status: string;
    description: string;
    created_at: string;
    paid_at?: string;
    receipt_url?: string;
    plan?: {
        name: string;
    }
}

export function PaymentHistory({ companyId }: { companyId: number | string }) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token || !companyId) return;
            try {
                const response = await api.subscriptions.getPaymentHistory(companyId, token);
                if (response.success) {
                    setPayments(response.data.data || response.data || []);
                }
            } catch (error) {
                console.error("Error fetching payment history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token, companyId]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        Historial de pagos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 text-sm text-center py-4">No se encontraron pagos registrados.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-100 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Historial de pagos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-gray-600 font-bold">Fecha</TableHead>
                                <TableHead className="text-gray-600 font-bold">Concepto</TableHead>
                                <TableHead className="text-gray-600 font-bold text-right">Monto</TableHead>
                                <TableHead className="text-gray-600 font-bold text-center">Estado</TableHead>
                                <TableHead className="text-gray-600 font-bold text-right">Recibo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => {
                                // Parse amount because it can be "2700.00" string
                                const displayAmount = typeof payment.amount === 'string'
                                    ? parseFloat(payment.amount)
                                    : payment.amount;

                                // Priority to paid_at, fallback to created_at
                                const displayDate = payment.paid_at || payment.created_at;

                                return (
                                    <TableRow key={payment.id} className="group transition-colors hover:bg-gray-50/50">
                                        <TableCell className="text-sm text-gray-600">
                                            {displayDate ? format(new Date(displayDate), "d 'de' MMMM, yyyy", { locale: es }) : '---'}
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-medium text-gray-900">
                                                {payment.plan?.name ? `Suscripción ${payment.plan.name}` : (payment.description || "Suscripción")}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-gray-900">
                                            ${new Intl.NumberFormat().format(displayAmount)} {payment.currency?.toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`
                                                ${payment.status === 'succeeded' || payment.status === 'paid'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-100'}
                                                border-none font-bold uppercase text-[10px]
                                            `}>
                                                {payment.status === 'succeeded' || payment.status === 'paid' ? 'Exitoso' : 'Fallido'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {payment.receipt_url ? (
                                                <a
                                                    href={payment.receipt_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-bold underline decoration-2 underline-offset-4 decoration-green-200 hover:decoration-green-600 transition-all font-inter"
                                                >
                                                    Ver factura
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">Procesando...</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
