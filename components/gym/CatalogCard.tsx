"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
const { Package, Phone, Share2, X, ShoppingCart, Gift } = Lucide as any;
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/lib/cart-context";
import { PublicItem, PointRule } from "@/types/api";

interface CatalogCardProps {
  item: PublicItem;
  locationId: number;
  phone?: string;
  initialOpen?: boolean;
  pointRules?: PointRule[] | null;
  userPoints?: number | null;
  buttonColor?: string;
}

export function CatalogCard({ item, locationId, phone, initialOpen = false, pointRules, userPoints, buttonColor }: CatalogCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const isService = item.product_type === "service";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolvedPoints, setResolvedPoints] = useState<number | null | undefined>(userPoints);

  useEffect(() => {
    setResolvedPoints(userPoints);
  }, [userPoints]);

  useEffect(() => {
    if (initialOpen) {
      setIsModalOpen(true);
    }
  }, [initialOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent layout shift
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isModalOpen]);

  const currentCartItem = items.find((cartItem) => cartItem.id === String(item.id));
  const quantity = currentCartItem?.quantity ?? 0;

  const handleAdd = () => {
    const product = {
      id: String(item.id),
      name: item.name,
      description: item.description || "",
      price: typeof item.price === "number" ? item.price : (typeof item.price === "string" ? parseFloat(item.price) : 0),
      points: typeof item.points === "number" ? item.points : (typeof item.points === "string" ? parseFloat(item.points) : undefined), // Loyalty points value for redemption
      product_type: "made_to_order" as const,
      is_active: true,
      category: item.category || "",
      image_url: item.image_url,
      locations: [
        {
          id: locationId,
          is_available: true,
          stock: undefined,
        },
      ],
    };
    addItem(product as any);
    setIsModalOpen(false);
  };

  const handleContact = () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hola, me interesa el servicio: ${item.name}`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const parseNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const activeRule = useMemo((): PointRule | null => {
    if (!pointRules || pointRules.length === 0) return null;
    const now = new Date();
    const candidates = pointRules
      .filter((rule) => rule?.is_active !== false)
      .filter((rule) => {
        const startsOk = !rule.starts_at || new Date(rule.starts_at) <= now;
        const endsOk = !rule.ends_at || new Date(rule.ends_at) >= now;
        return startsOk && endsOk;
      })
      .map((rule) => {
        const spendAmount = parseNumber(rule.spend_amount);
        const pointsForRule = parseNumber(rule.points);
        if (!spendAmount || !pointsForRule || spendAmount <= 0 || pointsForRule <= 0) return null;
        return { rule, ratio: pointsForRule / spendAmount };
      })
      .filter(Boolean) as Array<{ rule: PointRule; ratio: number }>;

    if (!candidates.length) return null;

    return candidates.reduce((best, candidate) => (candidate.ratio > best.ratio ? candidate : best)).rule;
  }, [pointRules]);

  const estimatedPoints = useMemo(() => {
    if (!activeRule || isService) return 0;
    const spendAmount = parseNumber(activeRule.spend_amount);
    const pointsForRule = parseNumber(activeRule.points);
    if (!spendAmount || !pointsForRule || spendAmount <= 0 || pointsForRule <= 0) return 0;
    const subtotal = typeof item.price === "number" ? item.price : parseFloat(String(item.price));
    if (!subtotal || subtotal <= 0) return 0;
    return Math.round(((subtotal / spendAmount) * pointsForRule) * 10) / 10;
  }, [activeRule, isService, item.price]);

  const redeemPoints = useMemo(() =>
    typeof item.points === "number" && item.points > 0 ? item.points : null,
    [item.points]);

  const userLoyaltyPoints = useMemo(() =>
    typeof resolvedPoints === "number" && resolvedPoints >= 0 ? resolvedPoints : null,
    [resolvedPoints]);

  const progressPercent = useMemo(() =>
    redeemPoints && userLoyaltyPoints !== null && redeemPoints > 0
      ? Math.min(100, (userLoyaltyPoints / redeemPoints) * 100)
      : 0,
    [redeemPoints, userLoyaltyPoints]);

  const pointsNeeded = useMemo(() =>
    redeemPoints && userLoyaltyPoints !== null ? Math.max(0, redeemPoints - userLoyaltyPoints) : null,
    [redeemPoints, userLoyaltyPoints]);

  const canRedeem = useMemo(() =>
    redeemPoints !== null && userLoyaltyPoints !== null && userLoyaltyPoints >= redeemPoints,
    [redeemPoints, userLoyaltyPoints]);

  const renderRedemptionProgress = (variant: "card" | "modal" = "card") => {
    if (!redeemPoints || userLoyaltyPoints === null) return null;
    const wrapperClasses =
      variant === "card"
        ? "mt-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2 py-2 shadow-lg"
        : "mb-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 px-8 py-6 shadow-2xl relative overflow-hidden";
    const progressBg = variant === "card" ? "bg-zinc-800" : "bg-zinc-950";

    return (
      <div className={wrapperClasses}>
        <div className="flex items-center gap-1.5 text-blue-400 font-black text-[10px] uppercase tracking-tight">
          <Gift className="h-3 w-3" />
          <span>{redeemPoints} pts</span>
        </div>
        <div className="mt-1.5">
          <div className={`h-1.5 rounded-full ${progressBg} overflow-hidden border border-zinc-800/50`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        {!canRedeem && pointsNeeded && (
          <p className="text-[9px] mt-1.5 text-zinc-500 font-bold tracking-tighter uppercase">
            Faltan {pointsNeeded}
          </p>
        )}
        {canRedeem && (
          <p className="text-[9px] mt-1.5 text-blue-400 font-black tracking-widest leading-none animate-pulse uppercase">
            ¡DÉ LO GRATIS!
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Card
        className="overflow-hidden group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 cursor-pointer bg-zinc-900 border-zinc-800 rounded-2xl border-2"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-row h-full">
          <div className="relative w-44 sm:w-64 md:w-80 flex-shrink-0 bg-zinc-950 flex flex-col items-stretch p-2 sm:p-3 overflow-hidden">
            <div className="flex-1 flex items-center justify-center relative min-h-[140px] sm:min-h-[200px]">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110 rounded-lg"
                  style={{ maxHeight: "170px" }}
                  onLoad={() => {
                    console.log('✅ Card image loaded:', item?.image_url);
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-24 sm:h-32 flex items-center justify-center bg-zinc-900 rounded-lg">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-800" />
                </div>
              )}
              {item.category && (
                <div
                  className={`absolute top-0 left-0 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-2xl z-10 border border-white/10 ${!buttonColor ? 'bg-blue-600' : ''}`}
                  style={buttonColor ? { backgroundColor: buttonColor } : {}}
                >
                  {item.category}
                </div>
              )}
            </div>

            {renderRedemptionProgress("card")}
          </div>

          <div className="p-5 flex flex-col flex-1 justify-between min-w-0">
            <div className="flex-1">
              <h3 className="font-black text-lg md:text-xl mb-2 text-white uppercase tracking-tight line-clamp-2 group-hover:text-blue-400 transition-colors">{item.name}</h3>

              {!isService && (
                <div className="mb-3">
                  <span
                    className={`text-2xl md:text-3xl font-black tracking-tighter shadow-blue-500/20 drop-shadow-xl ${!buttonColor ? 'text-blue-500' : ''}`}
                    style={buttonColor ? { color: buttonColor } : {}}
                  >
                    {formatCurrency(typeof item.price === "number" ? item.price : 0)}
                  </span>
                </div>
              )}

              {item.description && (
                <p className="text-sm md:text-base text-zinc-500 font-medium leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/50">
              {isService ? (
                <Button
                  size="lg"
                  className={`w-full text-white font-black shadow-lg hover:shadow-xl transition-all gap-2 uppercase tracking-widest rounded-xl ${!buttonColor ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-90'}`}
                  style={buttonColor ? { backgroundColor: buttonColor } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact();
                  }}
                  disabled={!phone}
                >
                  <Phone className="h-5 w-5" />
                  CONSULTAR
                </Button>
              ) : quantity <= 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className={`w-full sm:flex-1 text-white font-black shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all uppercase tracking-widest rounded-xl ${!buttonColor ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-90'}`}
                    style={buttonColor ? { backgroundColor: buttonColor } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd();
                    }}
                  >
                    ENTRENAR
                  </Button>

                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-xl hover:bg-zinc-800 text-zinc-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(String(item.id), quantity - 1);
                    }}
                  >
                    -
                  </Button>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600">Plan</span>
                    <span className="text-lg font-black text-white">{quantity}</span>
                  </div>
                  <Button
                    size="icon"
                    className={`h-10 w-10 rounded-xl text-white shadow-lg ${!buttonColor ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-90'}`}
                    style={buttonColor ? { backgroundColor: buttonColor } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(String(item.id), quantity + 1);
                    }}
                  >
                    +
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500 pb-safe">
            <div className="bg-zinc-900 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[92vh] overflow-hidden flex flex-col border-t border-zinc-800">
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full" />
              </div>

              <div className="overflow-y-auto px-6 pb-10">
                <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md pt-2 pb-4 mb-6 border-b border-zinc-800 flex justify-between items-start z-10">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{item.name}</h2>
                    {item.category && (
                      <Badge
                        className={`w-fit mt-2 font-bold uppercase tracking-widest text-[10px] py-1 px-3 shadow-lg ${!buttonColor ? 'bg-blue-600' : ''}`}
                        style={buttonColor ? { backgroundColor: buttonColor } : {}}
                      >
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsModalOpen(false)}
                    className="-mr-2 -mt-2 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800"
                  >
                    <X className="h-7 w-7" />
                  </Button>
                </div>

                {item.image_url ? (
                  <div className="w-full flex items-center justify-center bg-zinc-950 rounded-[2rem] p-8 mb-8 border border-zinc-800 shadow-inner group-modal">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="max-w-full h-auto object-contain rounded-2xl transition-transform duration-500"
                      style={{ maxHeight: "540px" }}
                      onLoad={() => {
                        console.log('✅ Product image loaded successfully:', item?.image_url);
                      }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-72 flex items-center justify-center bg-zinc-950 rounded-[2rem] mb-8 border border-zinc-800">
                    <Package className="h-24 w-24 text-zinc-800" />
                  </div>
                )}

                {!isService && (
                  <div
                    className="text-center py-8 rounded-[2rem] mb-8 border-2 border-dashed border-zinc-800 group"
                    style={{ backgroundColor: buttonColor ? `${buttonColor}10` : 'rgba(37,99,235,0.05)' }}
                  >
                    <p className="text-xs text-zinc-500 mb-2 font-black uppercase tracking-[0.2em]">Costo de Membresía / Producto</p>
                    <p
                      className={`text-5xl font-black tracking-tighter ${!buttonColor ? 'text-blue-500' : ''}`}
                      style={buttonColor ? { color: buttonColor } : {}}
                    >
                      {formatCurrency(typeof item.price === "number" ? item.price : 0)}
                    </p>
                  </div>
                )}

                {item.description && (
                  <div className="mb-8">
                    <h4 className="font-black text-xl mb-4 text-white uppercase tracking-tight flex items-center gap-2">
                      <span className="w-2 h-8 bg-blue-600 rounded-full inline-block" />
                      Descripción
                    </h4>
                    <p className="text-lg text-zinc-400 leading-relaxed whitespace-pre-line font-medium">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Points earning for this purchase */}
                {!isService && estimatedPoints > 0 && (
                  <div className="mb-8 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 px-8 py-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 -mr-8 -mt-8">
                      <Gift className="h-32 w-32 text-blue-400 rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 text-blue-400 font-black text-sm uppercase tracking-widest relative z-10">
                      <ShoppingCart className="h-5 w-5" />
                      <span>+{estimatedPoints} Puntos de Poder</span>
                    </div>
                    <div className="mt-4 relative z-10">
                      <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <p className="text-sm mt-4 text-zinc-400 font-medium relative z-10 leading-relaxed">
                      🎁 Sumarás <strong>{estimatedPoints} puntos</strong> a tu perfil de atleta con esta adquisición.
                    </p>
                  </div>
                )}

                {typeof item.points === "number" && item.points > 0 && (
                  <div className="mb-4">
                    {renderRedemptionProgress("modal")}
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-6">
                  {isService ? (
                    <Button
                      size="lg"
                      className={`w-full text-white font-black shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)] transition-all gap-3 h-16 text-xl rounded-2xl uppercase tracking-widest ${!buttonColor ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-95'}`}
                      style={buttonColor ? { backgroundColor: buttonColor } : {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact();
                      }}
                      disabled={!phone}
                    >
                      <Phone className="h-6 w-6" />
                      Contactar por WhatsApp
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className={`w-full text-white font-black shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)] transition-all h-16 text-xl rounded-2xl uppercase tracking-widest ${!buttonColor ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-95'}`}
                      style={buttonColor ? { backgroundColor: buttonColor } : {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd();
                      }}
                    >
                      Añadir al Plan
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 text-sm font-black uppercase tracking-widest rounded-2xl border-2 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center gap-2 group/share"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof window === "undefined") return;
                        const baseUrl = window.location.href.split("#")[0].split("?")[0];
                        const productUrl = `${baseUrl}?product=${encodeURIComponent(String(item.id))}`;
                        const parts: string[] = [];
                        parts.push(item.name);
                        if (item.description) {
                          parts.push(`- ${item.description}`);
                        }
                        const text = parts.join(" ");

                        const shareData: ShareData = {
                          title: item.name,
                          text,
                          url: productUrl,
                        };

                        if (navigator && (navigator as any).share) {
                          (navigator as any).share(shareData).catch(() => {
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(text).catch(() => {
                                const textarea = document.createElement("textarea");
                                textarea.value = text;
                                document.body.appendChild(textarea);
                                textarea.select();
                                try {
                                  document.execCommand("copy");
                                } finally {
                                  document.body.removeChild(textarea);
                                }
                              });
                            }
                          });
                        } else if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(text).catch(() => {
                            const textarea = document.createElement("textarea");
                            textarea.value = text;
                            document.body.appendChild(textarea);
                            textarea.select();
                            try {
                              document.execCommand("copy");
                            } finally {
                              document.body.removeChild(textarea);
                            }
                          });
                        }
                      }}
                    >
                      <Share2 className="h-5 w-5 group-hover/share:text-blue-400 transition-colors" />
                      <span>Compartir</span>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="h-14 text-sm font-black uppercase tracking-widest rounded-2xl border-2 border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    >
                      Regresar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
