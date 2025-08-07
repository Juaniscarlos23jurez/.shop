"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from 'lucide-react'
import { routes } from "@/lib/routes/web"
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { FloatingCartButton } from '@/components/cart/floating-cart-button'
import { ProductCard } from '@/components/catalog/product-card'

// Datos de ejemplo para el catálogo
const mockProducts = [
  {
    id: "1",
    name: "Camiseta Básica",
    price: 25.99,
    image: "/products/tshirt.jpg",
    description: "Camiseta de algodón 100% en varios colores",
    isAvailable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "2",
    name: "Jeans Clásicos",
    price: 59.99,
    image: "/products/jeans.jpg",
    description: "Jeans de corte recto en denim premium",
    isAvailable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "3",
    name: "Zapatillas Deportivas",
    price: 89.99,
    image: "/products/sneakers.jpg",
    description: "Zapatillas cómodas para uso diario",
    isAvailable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "4",
    name: "Chaqueta de Cuero",
    price: 199.99,
    image: "/products/jacket.jpg",
    description: "Chaqueta de cuero genuino con forro",
    isAvailable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "5",
    name: "Gorra de Béisbol",
    price: 19.99,
    image: "/products/cap.jpg",
    description: "Gorra ajustable con logo bordado",
    isAvailable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "6",
    name: "Bufanda de Lana",
    price: 29.99,
    image: "/products/scarf.jpg",
    description: "Bufanda suave y cálida para el invierno",
    isAvailable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export default function CatalogPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Barra de búsqueda */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="border h-10 w-10 !p-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mt-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Botón flotante del carrito */}
        <FloatingCartButton onClick={() => setIsCartOpen(true)} />

        {/* Drawer del carrito */}
        <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  )
}
