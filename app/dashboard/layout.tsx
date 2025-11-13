"use client";
import { Sidebar } from "@/components/layout/sidebar"
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components
import { Button } from "@/components/ui/button"; // Import Button component
import { Menu as MenuIcon } from "lucide-react"; // Import Menu icon

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const isMobile = useIsMobile(); // Use useIsMobile hook

  return (
    <div className="flex h-screen bg-slate-50">
      {isMobile ? (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden absolute top-4 left-4 z-50"
            >
              <MenuIcon className="h-6 w-6" />
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
  )
}
