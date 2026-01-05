"use client";
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { NotificationToast, useNotificationToast } from "@/components/notifications/NotificationToast";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const isMobile = useIsMobile(); // Use useIsMobile hook

  const router = useRouter();
  const pathname = usePathname();
  const { token, loading, userRole } = useAuth();
  const [companyGateChecked, setCompanyGateChecked] = useState(false);

  // Moved notification logic here for global access
  const { notifications, dismissNotification } = useNotificationToast();

  useEffect(() => {
    // Wait until AuthContext finished loading
    if (loading) return;

    // If not authenticated, redirect to login
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    // Employees do not require company onboarding; POS should stay accessible
    if (userRole && userRole.startsWith('employee_')) {
      setCompanyGateChecked(true);
      return;
    }
    if (pathname?.startsWith('/dashboard/pos')) {
      setCompanyGateChecked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.userCompanies.get(token);
        const hasCompany = Boolean((res as any)?.data?.data?.id);
        if (!cancelled) {
          if (!hasCompany) {
            router.replace('/onboarding/compania');
            return;
          }
          setCompanyGateChecked(true);
        }
      } catch {
        if (!cancelled) {
          router.replace('/onboarding/compania');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, token, userRole, pathname, router]);

  if (!companyGateChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <span className="text-lg animate-pulse">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <CompanyProvider>
        {/* Top Bar - Spans full width */}
        <TopBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <div className="flex flex-1 overflow-hidden relative">
          {isMobile ? (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden absolute top-4 left-4 z-50 bg-white shadow-md border border-slate-200"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6H20M4 12H20M4 18H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar
                  isCollapsed={false} // Always show full sidebar in mobile sheet
                  setIsCollapsed={setIsMobileMenuOpen} // Close sheet when an item is clicked
                />
              </SheetContent>
            </Sheet>
          ) : (
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          )}

          <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
            {children}
          </main>
        </div>

        {/* Global Notifications */}
        <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
      </CompanyProvider>
    </div>
  )
}

