"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function GA4PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.gtag) return;

    const search = searchParams?.toString();
    const page_path = search ? `${pathname}?${search}` : pathname || "/";
    const page_location = typeof window !== "undefined" ? window.location.href : undefined;
    const page_title = document.title || undefined;

    window.gtag("event", "page_view", {
      page_path,
      page_location,
      page_title,
    });
  }, [pathname, searchParams]);

  return null;
}
