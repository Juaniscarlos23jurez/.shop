"use client"

import { ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/utils/currency'

interface FloatingCartButtonProps {
  onClick: () => void
  isHidden?: boolean
  backgroundColor?: string
  iconColor?: string
}

export function FloatingCartButton({ onClick, isHidden = false, backgroundColor, iconColor }: FloatingCartButtonProps) {
  const { itemCount, total } = useCart()

  if (isHidden) return null

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`fixed z-[99999] h-14 sm:h-16 rounded-full text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ease-in-out px-5 sm:px-6 flex items-center gap-3 
        ${itemCount === 0 && !backgroundColor ? 'bg-gray-700 hover:bg-gray-700 opacity-90' : ''}
        ${itemCount > 0 && !backgroundColor ? 'bg-black hover:bg-gray-800 hover:scale-110' : ''}
        ${backgroundColor ? 'hover:scale-110' : ''}
        `}
      style={{
        touchAction: 'manipulation',
        backgroundColor: backgroundColor || (itemCount === 0 ? '#374151' : '#000000'),
        // Ensure visibility on iOS devices with notch/safe area
        // Use inline style to override Tailwind bottom/right when needed
        bottom: 'max(env(safe-area-inset-bottom, 0px), 110px)',
        right: 'max(env(safe-area-inset-right, 0px), 16px)'
      }}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: iconColor }} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-black">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium opacity-90">Ver carrito</span>
        <span className="text-base sm:text-lg font-bold">{formatCurrency(total)}</span>
      </div>
    </Button>
  )
}