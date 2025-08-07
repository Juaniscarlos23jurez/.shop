"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"

import { Product as ApiProduct } from '@/lib/api/products'

interface Product extends Omit<ApiProduct, 'imageUrl'> {
  image: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <Card className="group overflow-hidden bg-white hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1">
      <div className="relative aspect-[4/3]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={() => addItem(product)}
            className="bg-white text-black hover:bg-white/90 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-medium text-base text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="text-lg font-bold text-black whitespace-nowrap">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
      </CardContent>
    </Card>
  )
}
