"use client"

import React, { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import * as Lucide from 'lucide-react'
const { Minus, Plus, Trash2, Share2, Gift } = Lucide as any
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  locationPhone?: string
  locationName?: string
  userPoints?: number | null
}

export function CartDrawer({ open, onClose, locationPhone, locationName, userPoints }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'spei' | 'points'>('cash')
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  const isMobile = useIsMobile()

  const totalFormatted = useMemo(() => total.toFixed(2), [total])

  // Calculate total points required for cart items
  const totalPointsRequired = useMemo(() => {
    const pts = items.reduce((acc, item) => {
      const itemPoints = typeof (item as any).points === 'number' ? (item as any).points : 0
      return acc + (itemPoints * item.quantity)
    }, 0)
    console.log('[CartDrawer] totalPointsRequired calculation:', {
      items: items.map(i => ({ name: i.name, points: (i as any).points, quantity: i.quantity })),
      calculatedTotal: pts
    });
    return pts
  }, [items])

  // Check if user can pay with points
  const canPayWithPoints = useMemo(() => {
    const result = totalPointsRequired > 0 &&
      typeof userPoints === 'number' &&
      userPoints >= totalPointsRequired

    console.log('[CartDrawer] canPayWithPoints check:', {
      totalPointsRequired,
      userPoints,
      userPointsType: typeof userPoints,
      result
    });
    return result
  }, [totalPointsRequired, userPoints])

  // Points remaining after payment
  const pointsAfterPayment = useMemo(() => {
    if (typeof userPoints !== 'number') return 0
    return userPoints - totalPointsRequired
  }, [userPoints, totalPointsRequired])

  function formatPhoneToWhatsApp(phone?: string): string | undefined {
    if (!phone) return undefined
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('52')) return digits
    if (digits.startsWith('0')) return `52${digits.slice(1)}`
    return `52${digits}`
  }

  const handleShareCart = () => {
    if (typeof window === 'undefined' || items.length === 0) return

    // Codificar items del carrito en la URL
    const cartData = items.map(item => ({
      id: item.id,
      q: item.quantity, // quantity abreviado para URL más corta
    }))
    const cartParam = encodeURIComponent(JSON.stringify(cartData))

    // Obtener URL base sin query params
    const baseUrl = window.location.href.split('#')[0].split('?')[0]
    const shareUrl = `${baseUrl}?cart=${cartParam}`

    const shareText = `Mira mi carrito de compras en ${locationName || 'esta tienda'} - Total: $${totalFormatted}`

    const shareData: ShareData = {
      title: `Carrito de ${locationName || 'Tienda'}`,
      text: shareText,
      url: shareUrl,
    }

    if (navigator && (navigator as any).share) {
      (navigator as any).share(shareData).catch(() => {
        // Si falla el share nativo, copiar al portapapeles
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        }
      })
    } else if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    const waPhone = formatPhoneToWhatsApp(locationPhone)

    const lines: string[] = []
    lines.push(`Hola! Quisiera realizar un pedido:`)
    lines.push('')
    lines.push(`*Cliente:* ${customerName || 'Cliente'}`)
    if (locationName) lines.push(`*Sucursal:* ${locationName}`)
    lines.push('')
    lines.push('*Productos:*')
    for (const item of items) {
      const subtotal = (item.price * item.quantity).toFixed(2)
      lines.push(`- ${item.name} x${item.quantity} - $${subtotal}`)
    }
    lines.push('')

    if (paymentMethod === 'points') {
      lines.push(`*Total:* ${totalPointsRequired} puntos`)
      lines.push(`*Metodo de pago:* Puntos de lealtad`)
    } else {
      lines.push(`*Total:* $${totalFormatted}`)
      lines.push(`*Metodo de pago:* ${paymentMethod === 'cash' ? 'Efectivo' : 'SPEI'}`)
    }
    lines.push(`*Tipo de entrega:* ${deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Envio a domicilio'}`)
    lines.push('')
    lines.push('Muchas gracias!')

    const text = lines.join('\r\n')
    const message = encodeURIComponent(text)
    const url = waPhone
      ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`

    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side={isMobile ? 'bottom' as const : 'right' as const}
        className={
          isMobile
            ? "w-full p-0 h-[85vh] max-h-[90vh] rounded-t-2xl overflow-hidden"
            : "w-full sm:max-w-lg p-0"
        }
        style={isMobile ? { paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}
      >
        <div className="h-full flex flex-col">
          <SheetHeader className={`px-6 pt-6 ${isMobile ? 'pb-2' : ''}`}>
            <div className="flex items-center justify-between pr-8">
              <SheetTitle>Carrito de Compras</SheetTitle>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShareCart}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Tu carrito está vacío
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.image_url || '/placeholder-logo.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-gray-500"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm font-medium">${item.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className={`border-t px-6 py-4 space-y-4 ${isMobile ? 'pb-[calc(env(safe-area-inset-bottom,0px)+16px)]' : ''}`}>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de pago</label>
                <div className={`grid gap-2 ${canPayWithPoints ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    className={paymentMethod === 'cash' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    Efectivo
                  </Button>
                  <Button
                    variant={paymentMethod === 'spei' ? 'default' : 'outline'}
                    className={paymentMethod === 'spei' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    onClick={() => setPaymentMethod('spei')}
                  >
                    SPEI
                  </Button>
                  {/* Debug Info for User - remove later */}
                  {(() => {
                    console.log('[CartDrawer Render] canPayWithPoints:', canPayWithPoints, {
                      totalPointsRequired,
                      userPoints,
                      paymentMethod,
                      itemsWithPoints: items.map(i => ({ name: i.name, points: (i as any).points }))
                    });
                    return null;
                  })()}
                  {canPayWithPoints && (
                    <Button
                      variant={paymentMethod === 'points' ? 'default' : 'outline'}
                      className={paymentMethod === 'points' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-300 text-purple-700'}
                      onClick={() => setPaymentMethod('points')}
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Puntos
                    </Button>
                  )}
                </div>
              </div>

              {/* Points payment info */}
              {paymentMethod === 'points' && canPayWithPoints && (
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold">
                    <Gift className="h-5 w-5" />
                    <span>Pago con Puntos</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tus puntos:</span>
                      <span className="font-semibold text-purple-600">{userPoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Puntos a usar:</span>
                      <span className="font-semibold text-purple-700">{totalPointsRequired} pts</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-200">
                      <span className="text-gray-600">Puntos restantes:</span>
                      <span className="font-semibold text-emerald-600">{pointsAfterPayment} pts</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    🎉 ¡Canjea tus puntos por este pedido!
                  </p>
                </div>
              )}

              {/* Show points option hint if user has points but not enough */}
              {(() => {
                const showHint = totalPointsRequired > 0 && typeof userPoints === 'number' && !canPayWithPoints && userPoints > 0;
                if (showHint) {
                  console.log('[CartDrawer Hint] User has points but not enough:', { userPoints, totalPointsRequired });
                }
                return showHint ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs text-amber-700">
                      💡 Te faltan <strong>{totalPointsRequired - (userPoints || 0)}</strong> puntos para pagar con puntos.
                      Tienes {userPoints} pts, necesitas {totalPointsRequired} pts.
                    </p>
                  </div>
                ) : null;
              })()}

              {/* Delivery method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={deliveryMethod === 'pickup' ? 'default' : 'outline'}
                    className={deliveryMethod === 'pickup' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    Recoger
                  </Button>
                  <Button
                    variant={deliveryMethod === 'delivery' ? 'default' : 'outline'}
                    className={deliveryMethod === 'delivery' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    Envío
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-base font-medium">
                <p>Total</p>
                {paymentMethod === 'points' ? (
                  <p className="text-purple-600">{totalPointsRequired} pts</p>
                ) : (
                  <p>${totalFormatted}</p>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  className={`w-full ${paymentMethod === 'points' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'click_proceder_pago_whatsapp', {
                        event_category: 'checkout',
                        event_label: paymentMethod === 'points' ? 'Pago con Puntos' : 'Proceder al Pago por WhatsApp',
                        value: paymentMethod === 'points' ? totalPointsRequired : total,
                      })
                    }
                    handleCheckout()
                  }}
                >
                  {paymentMethod === 'points'
                    ? `Canjear ${totalPointsRequired} Puntos por WhatsApp`
                    : 'Proceder al Pago por WhatsApp'}
                </Button>


              </div>
            </div>
          )}
        </div>
      </SheetContent >
    </Sheet >
  )
}