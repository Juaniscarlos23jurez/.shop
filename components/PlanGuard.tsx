'use client';

import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Rocket, ShieldAlert, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function PlanGuard({ children }: { children: React.ReactNode }) {
    const { company, loading } = useCompany();
    const { userRole, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);

    // If it's an employee, they don't need a plan check (usually)
    // or if they are in the subscription pages already
    const isEmployee = userRole && userRole.startsWith('employee_');
    const isSubscriptionPage = pathname?.includes('/dashboard/suscripcion');

    useEffect(() => {
        if (loading) return;

        if (!isEmployee && !isSubscriptionPage) {
            const isActive = company?.company_plan_status === 'active' || company?.is_active;
            if (!isActive) {
                setShowModal(true);
            } else {
                setShowModal(false);
            }
        } else {
            setShowModal(false);
        }
    }, [company, loading, isEmployee, isSubscriptionPage, pathname]);

    if (loading) {
        return <>{children}</>;
    }

    return (
        <>
            {/* If blocked, we still render children but they are covered by the modal or blurred */}
            <div className={`flex flex-col w-full h-full overflow-hidden ${showModal ? "blur-sm pointer-events-none select-none" : ""}`}>
                {children}
            </div>

            <Dialog open={showModal} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[500px] border-t-8 border-t-emerald-500">
                    <DialogHeader className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center text-slate-900">
                            Suscripción Requerida
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-500 text-base">
                            Para acceder a las funciones de su dashboard y gestionar su negocio, necesita activar un plan de suscripción.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 my-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                                <Rocket className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 leading-tight">Acceso Ilimitado</p>
                                <p className="text-xs text-slate-500">Desbloquea todas las herramientas de venta y gestión.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 leading-tight">Pagos Seguros</p>
                                <p className="text-xs text-slate-500">Gestión de suscripción transparente vía Stripe.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="w-full sm:flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar sesión
                        </Button>
                        <Button
                            onClick={() => router.push('/onboarding/plan')}
                            className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                        >
                            Ver Planes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
