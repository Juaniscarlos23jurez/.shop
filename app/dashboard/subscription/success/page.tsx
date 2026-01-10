"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/contexts/CompanyContext";

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { refreshCompany } = useCompany();
    const [count, setCount] = useState(5);

    useEffect(() => {
        // Refresh company data to get the new plan status
        refreshCompany();

        // Optional: Redirect automatically after a few seconds
        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/dashboard/suscripcion/planes');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    ¡Suscripción Exitosa!
                </h1>

                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Tu plan ha sido actualizado correctamente. Ya puedes disfrutar de todos los beneficios de tu nueva suscripción.
                </p>

                <div className="space-y-4">
                    <Link href="/dashboard/suscripcion/planes" className="block w-full">
                        <Button className="w-full h-12 text-base font-bold bg-[#0f172a] hover:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            Ir a mis Planes <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>

                    <p className="text-xs text-gray-400">
                        Serás redirigido automáticamente en {count} segundos...
                    </p>
                </div>
            </div>
        </div>
    );
}
