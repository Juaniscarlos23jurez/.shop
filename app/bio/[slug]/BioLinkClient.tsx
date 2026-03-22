"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Globe, Loader2 } from "lucide-react";



interface SocialLink {
  id: string;
  label: string;
  url: string;
  bgColor?: string;
  textColor?: string;
}

interface BioData {
  companyName: string;
  companyLogo: string;
  settings: {
    links?: SocialLink[] | string;
    primaryColor?: string;
    buttonTextColor?: string;
    globalTextColor?: string;
    backgroundColor?: string;
    bioDescription?: string;
  } | null;
}

export default function BioLinkClient({ slug }: { slug: string }) {
  const [bioData, setBioData] = useState<BioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBio = async () => {
      try {
        // Añadimos un timestamp para evitar cualquier tipo de caché en el navegador o la red
        const res = await fetch(`/api/bio/${encodeURIComponent(slug)}?t=${Date.now()}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        console.log("📊 Bio Data Received:", data);
        if (!data.success) {
          setNotFound(true);
          return;
        }
        setBioData(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBio();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !bioData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Globe className="h-12 w-12 text-slate-300" />
        <h1 className="text-2xl font-bold text-slate-700">Página no encontrada</h1>
        <p className="text-slate-400 text-sm">Este Bio Link no existe o no está disponible.</p>
      </div>
    );
  }

  const { companyName, companyLogo, settings } = bioData;
  const primaryColor = settings?.primaryColor || "#10b981";
  const buttonTextColor = settings?.buttonTextColor || "#ffffff";
  const backgroundColor = settings?.backgroundColor || "#f8fafc";
  const globalTextColor = settings?.globalTextColor || "#0f172a";
  
  // Safe link parsing (handles both Array and JSON String)
  let links: SocialLink[] = [];
  try {
    const rawLinks = settings?.links;
    if (Array.isArray(rawLinks)) {
      links = rawLinks;
    } else if (typeof rawLinks === 'string') {
      links = JSON.parse(rawLinks);
    }
  } catch (err) {
    console.error("❌ Error parsing links:", err);
  }

  const bioDescription =
    settings?.bioDescription ||
    "¡Bienvenidos a nuestra página oficial! Encuentra todos nuestros enlaces aquí.";

  // Calculate background styles
  const bgStyle = {
    backgroundColor: backgroundColor,
    backgroundImage: `radial-gradient(circle at top right, ${primaryColor}10, transparent), radial-gradient(circle at bottom left, ${primaryColor}05, transparent)`,
    minHeight: "100vh",
  };

  return (
    <div style={bgStyle} className="flex flex-col items-center px-6 py-16 font-sans text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-md flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Avatar / Logo Section */}
        <div className="relative mb-6">
          <div 
            className="absolute -inset-1 blur-2xl opacity-20 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="relative w-28 h-28 rounded-full border-4 shadow-2xl overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-1"
            style={{ borderColor: primaryColor }}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl font-black rounded-full"
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
              >
                {companyName[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Business Header */}
        <div className="text-center space-y-2 mb-10 w-full px-4">
          <h1 
            className="text-3xl font-black tracking-tight leading-tight"
            style={{ color: globalTextColor }}
          >
            {companyName}
          </h1>
          <p 
            className="text-sm font-medium leading-relaxed opacity-70 max-w-[280px] mx-auto"
            style={{ color: globalTextColor }}
          >
            {bioDescription}
          </p>
        </div>

        {/* Links Grid */}
        <div className="w-full space-y-4">
          {links.length > 0 ? (
            links.map((link, idx) => (
              <a
                key={link.id || idx}
                href={link.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl overflow-hidden border border-white/10"
                style={{
                  backgroundColor: link.bgColor || "#ffffff",
                  color: link.textColor || primaryColor,
                }}
              >
                {/* Subtle highlight effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <span className="relative font-bold text-base tracking-tight">
                  {link.label || "Explorar Enlace"}
                </span>
                <ExternalLink
                  className="relative w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  style={{ color: link.textColor || primaryColor }}
                />
              </a>
            ))
          ) : (
             <div className="flex flex-col items-center gap-4 py-16 text-center opacity-40" style={{ color: globalTextColor }}>
              <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center border-current">
                <Globe className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">No se han añadido enlaces todavía</p>
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <div 
          className="mt-20 flex items-center gap-2 opacity-30 hover:opacity-60 transition-opacity cursor-default animate-pulse duration-[3000ms]"
          style={{ color: globalTextColor }}
        >
          <div className="w-4 h-px bg-current opacity-30" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Realizado con {companyName}
          </span>
          <div className="w-4 h-px bg-current opacity-30" />
        </div>
      </div>
    </div>
  );
}
