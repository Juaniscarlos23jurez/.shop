"use client"

import React, { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  locationPhone?: string
  locationName?: string
}

export function CartDrawer({ open, onClose, locationPhone, locationName }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'spei'>('cash')
  const isMobile = useIsMobile()

  const totalFormatted = useMemo(() => total.toFixed(2), [total])

  function formatPhoneToWhatsApp(phone?: string): string | undefined {
    if (!phone) return undefined
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('52')) return digits
    if (digits.startsWith('0')) return `52${digits.slice(1)}`
    return `52${digits}`
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    const waPhone = formatPhoneToWhatsApp(locationPhone)

    const lines: string[] = []
    lines.push(`Pedido de ${customerName || 'Cliente'}`)
    if (locationName) lines.push(`Sucursal: ${locationName}`)
    lines.push('')
    lines.push('Productos:')
    for (const item of items) {
      const subtotal = (item.price * item.quantity).toFixed(2)
      lines.push(`- ${item.name} x${item.quantity} • $${item.price.toFixed(2)} = $${subtotal}`)
    }
    lines.push('')
    lines.push(`Total: $${totalFormatted}`)
    lines.push(`Método de pago: ${paymentMethod === 'cash' ? 'Efectivo' : 'SPEI'}`)

    const message = encodeURIComponent(lines.join('\n'))
    const url = waPhone
      ? `https://wa.me/${waPhone}?text=${message}`
      : `https://wa.me/?text=${message}`
    
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
            <SheetTitle>Carrito de Compras</SheetTitle>
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
              {/* Buyer info */}
              <div className="space-y-2">
                <label htmlFor="customer-name" className="text-sm font-medium">
                  Nombre del cliente (opcional)
                </label>
                <Input
                  id="customer-name"
                  placeholder="Ej. Juan Pérez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de pago</label>
                <div className="grid grid-cols-2 gap-2">
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
                </div>
              </div>

              <div className="flex justify-between text-base font-medium">
                <p>Total</p>
                <p>${totalFormatted}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" 
                  onClick={handleCheckout}
                >
                  Proceder al Pago por WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}