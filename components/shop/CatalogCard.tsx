"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
const { Package, Phone, Share2 } = Lucide as any;
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/lib/cart-context";
import { PublicItem } from "@/types/api";

interface CatalogCardProps {
  item: PublicItem;
  locationId: number;
  phone?: string;
  initialOpen?: boolean;
}

export function CatalogCard({ item, locationId, phone, initialOpen = false }: CatalogCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const isService = item.product_type === "service";
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialOpen) {
      setIsModalOpen(true);
    }
  }, [initialOpen]);

  const currentCartItem = items.find((cartItem) => cartItem.id === String(item.id));
  const quantity = currentCartItem?.quantity ?? 0;

  const handleAdd = () => {
    const product = {
      id: String(item.id),
      name: item.name,
      description: item.description || "",
      price: typeof item.price === "number" ? item.price : 0,
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

  return (
    <>
      <Card
        className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-row h-full">
          <div className="relative w-48 md:w-56 flex-shrink-0 bg-gray-100 flex items-center justify-center p-3">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-lg"
                style={{ maxHeight: "200px" }}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                <Package className="h-16 w-16 text-gray-300" />
              </div>
            )}
            {item.category && (
              <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg z-10">
                {item.category}
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col flex-1 justify-between min-w-0">
            <div className="flex-1">
              <h3 className="font-bold text-lg md:text-xl mb-2 text-gray-900 line-clamp-2">{item.name}</h3>

              {!isService && (
                <div className="mb-3">
                  <span className="text-2xl md:text-3xl font-bold text-emerald-600">
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all gap-2"
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
                    className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd();
                    }}
                  >
                    Agregar al carrito
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof window === "undefined") return;
                      const baseUrl = window.location.href.split("#")[0];
                      const productUrl = `${baseUrl}?product=${encodeURIComponent(String(item.id))}`;
                      const parts: string[] = [];
                      parts.push(item.name);
                      if (item.description) {
                        parts.push(`- ${item.description}`);
                      }
                      parts.push(productUrl);
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
                    <span>Compartir Tienda</span>
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
                    className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
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

          <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="overflow-y-auto px-6 pb-6">
                <div className="sticky top-0 bg-white pt-2 pb-4 mb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
                  {item.category && (
                    <Badge className="w-fit bg-emerald-600 mt-2">
                      {item.category}
                    </Badge>
                  )}
                </div>

                {item.image_url ? (
                  <div className="w-full flex items-center justify-center bg-gray-50 rounded-2xl p-6 mb-6">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="max-w-full h-auto object-contain rounded-xl"
                      style={{ maxHeight: "350px" }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                    <Package className="h-24 w-24 text-gray-300" />
                  </div>
                )}

                {!isService && (
                  <div className="text-center py-5 bg-emerald-50 rounded-2xl mb-6">
                    <p className="text-sm text-gray-600 mb-1 font-medium">Precio</p>
                    <p className="text-4xl font-bold text-emerald-600">
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

                <div className="flex flex-col gap-3 pt-4 pb-2">
                  {isService ? (
                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all gap-2 h-14 text-lg rounded-xl"
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all h-14 text-lg rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd();
                      }}
                    >
                      Agregar al carrito
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 text-base rounded-xl border-2 flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof window === "undefined") return;
                      const baseUrl = window.location.href.split("#")[0];
                      const productUrl = `${baseUrl}?product=${encodeURIComponent(String(item.id))}`;
                      const parts: string[] = [];
                      parts.push(item.name);
                      if (item.description) {
                        parts.push(`- ${item.description}`);
                      }
                      parts.push(productUrl);
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
                    <span>Compartir Tienda</span>
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
