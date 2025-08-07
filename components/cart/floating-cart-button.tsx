"use client"

import { ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from '@/lib/cart-context'

interface FloatingCartButtonProps {
  onClick: () => void
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { itemCount } = useCart()

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 !p-0 rounded-full bg-black hover:bg-gray-800 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ease-in-out hover:scale-110"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
    </Button>
  )
}
