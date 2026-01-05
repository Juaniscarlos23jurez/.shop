import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export const useLockedPlan = () => {
    const { toast } = useToast();
    const router = useRouter();

    const showLockedToast = () => {
        toast({
            title: "Acceso Restringido",
            description: "Actualiza tu plan para desbloquear esta función.",
            variant: "default",
            className: "bg-emerald-600 text-white border-emerald-700",
            action: (
                <ToastAction
                    altText="Ver planes"
                    onClick={() => router.push("/dashboard/configuracion")}
                    className="bg-white text-emerald-600 hover:bg-emerald-50 border-none"
                >
                    Ver planes
                </ToastAction>
            ),
        });
    };

    return { showLockedToast };
};
