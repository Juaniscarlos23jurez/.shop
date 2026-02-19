"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
const { Package, Phone, Share2, X, ShoppingCart, Gift } = Lucide as any;
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/lib/cart-context";
import { PublicItem, PointRule } from "@/types/api";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface CatalogCardProps {
  item: PublicItem;
  locationId: number;
  phone?: string;
  initialOpen?: boolean;
  pointRules?: PointRule[] | null;
  userPoints?: number | null;
  buttonColor?: string;
}

export const CatalogCard = memo(({ item, locationId, phone, initialOpen = false, pointRules, userPoints, buttonColor }: CatalogCardProps) => {
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

  // Scroll lock is now handled by Drawer component
  // We can remove this effect as it might conflict with vaul/radix-ui's implementation
  const isMobile = useIsMobile();

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
        ? "mt-2 rounded-xl border border-purple-100 bg-white/80 px-2 py-2 shadow-sm"
        : "mb-6 rounded-2xl border border-purple-100 bg-purple-50 px-6 py-4";
    const progressBg = variant === "card" ? "bg-gray-100" : "bg-white/70";

    return (
      <div className={wrapperClasses}>
        <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[10px] uppercase tracking-tight">
          <Gift className="h-3 w-3" />
          <span>{redeemPoints} pts</span>
        </div>
        <div className="mt-1.5">
          <div className={`h-1.5 rounded-full ${progressBg} overflow-hidden`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        {!canRedeem && pointsNeeded && (
          <p className="text-[9px] mt-1 text-gray-500 font-medium leading-none">
            Faltan {pointsNeeded}
          </p>
        )}
        {canRedeem && (
          <p className="text-[9px] mt-1 text-emerald-600 font-bold leading-none animate-pulse">
            ¡DÉ LO GRATIS!
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Card
        className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-row h-full">
          <div className="relative w-44 sm:w-64 md:w-80 flex-shrink-0 bg-gray-100 flex flex-col items-stretch overflow-hidden">
            <div className="flex-1 flex items-center justify-center relative min-h-[140px] sm:min-h-[200px]">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: "200px" }}
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-24 sm:h-32 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                </div>
              )}
              {item.category && (
                <div
                  className={`absolute top-0 left-0 text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shadow-lg z-10 ${!buttonColor ? 'bg-emerald-600' : ''}`}
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
              <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900 line-clamp-2">{item.name}</h3>

              {!isService && (
                <div className="mb-3">
                  <span
                    className={`text-2xl md:text-3xl font-bold ${!buttonColor ? 'text-emerald-600' : ''}`}
                    style={buttonColor ? { color: buttonColor } : {}}
                  >
                    {formatCurrency(typeof item.price === "number" ? item.price : 0)}
                  </span>
                </div>
              )}

              {item.description && (
                <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3">
              {isService ? (
                <Button
                  size="lg"
                  className={`w-full text-white font-semibold shadow-md hover:shadow-lg transition-all gap-2 ${!buttonColor ? 'bg-green-600 hover:bg-green-700' : 'hover:opacity-90'}`}
                  style={buttonColor ? { backgroundColor: buttonColor } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact();
                  }}
                  disabled={!phone}
                >
                  <Phone className="h-5 w-5" />
                  WhatsApp
                </Button>
              ) : quantity <= 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className={`w-full sm:flex-1 text-white font-semibold shadow-md hover:shadow-lg transition-all ${!buttonColor ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:opacity-90'}`}
                    style={buttonColor ? { backgroundColor: buttonColor } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd();
                    }}
                  >
                    Agregar
                  </Button>

                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full border-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(String(item.id), quantity - 1);
                    }}
                  >
                    -
                  </Button>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs uppercase tracking-wide text-gray-500">Cantidad</span>
                    <span className="text-lg font-semibold text-gray-900">{quantity}</span>
                  </div>
                  <Button
                    size="icon"
                    className={`h-10 w-10 rounded-full text-white shadow-md hover:shadow-lg ${!buttonColor ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:opacity-90'}`}
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

      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DrawerContent className="max-h-[90vh] border-none bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          <div className="overflow-y-auto px-6 pb-6 pt-2">
            <div className="sticky top-0 bg-white pt-2 pb-4 mb-4 border-b flex justify-between items-start z-10">
              <div>
                <DrawerTitle className="text-2xl font-bold text-gray-900">{item.name}</DrawerTitle>
                <DrawerDescription className="sr-only">
                  Detalles del producto {item.name}
                </DrawerDescription>
                {item.category && (
                  <Badge
                    className={`w-fit mt-2 ${!buttonColor ? 'bg-emerald-600' : ''}`}
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
                className="-mr-2 -mt-2 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {item.image_url ? (
              <div className="w-full flex items-center justify-center bg-gray-50 rounded-2xl mb-6 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "550px" }}
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                <Package className="h-24 w-24 text-gray-300" />
              </div>
            )}

            {!isService && (
              <div
                className="text-center py-5 rounded-2xl mb-6"
                style={{ backgroundColor: buttonColor ? `${buttonColor}15` : '#ecfdf5' }} // 15% opacity for bg
              >
                <p className="text-sm text-gray-600 mb-1 font-medium">Precio</p>
                <p
                  className={`text-4xl font-bold ${!buttonColor ? 'text-emerald-600' : ''}`}
                  style={buttonColor ? { color: buttonColor } : {}}
                >
                  {formatCurrency(typeof item.price === "number" ? item.price : 0)}
                </p>
              </div>
            )}

            {item.description && (
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-3 text-gray-900">Descripción</h4>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            )}

            {/* Points earning for this purchase */}
            {!isService && estimatedPoints > 0 && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                  <ShoppingCart className="h-4 w-4" />
                  <span>+{estimatedPoints} puntos al comprar</span>
                </div>
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <p className="text-sm mt-3 text-amber-800">
                  🎁 Gana <strong>{estimatedPoints} puntos</strong> de lealtad con esta compra
                </p>
              </div>
            )}

            {typeof item.points === "number" && item.points > 0 && (
              <>

                {renderRedemptionProgress("modal")}
              </>
            )}

            <div className="flex flex-col gap-3 pt-4 pb-2">
              {isService ? (
                <Button
                  size="lg"
                  className={`w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all gap-2 h-14 text-lg rounded-xl ${!buttonColor ? 'bg-green-600 hover:bg-green-700' : 'hover:opacity-90'}`}
                  style={buttonColor ? { backgroundColor: buttonColor } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact();
                  }}
                  disabled={!phone}
                >
                  <Phone className="h-5 w-5" />
                  WhatsApp
                </Button>
              ) : (
                <Button
                  size="lg"
                  className={`w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all h-14 text-lg rounded-xl ${!buttonColor ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:opacity-90'}`}
                  style={buttonColor ? { backgroundColor: buttonColor } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd();
                  }}
                >
                  Agregar
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base rounded-xl border-2 flex items-center justify-center gap-2"
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
                <Share2 className="h-5 w-5" />
                <span>Compartir Producto</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full h-12 text-base rounded-xl border-2"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
});
