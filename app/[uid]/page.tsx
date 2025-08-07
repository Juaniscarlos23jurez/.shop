'use client'

import { useEffect, useState, use } from 'react'
import { getUserProducts, type Product } from '@/lib/api/products'
import { ProductCard } from '@/components/catalog/product-card'
import { CartProvider } from '@/lib/cart-context'
import { FloatingCartButton } from '@/components/cart/floating-cart-button'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Params {
  uid: string
}

interface Props {
  params: {
    uid: string
  }
}

export default function UserCatalog(props: Props) {
  const { uid } = use(props.params) as Params
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      const userProducts = await getUserProducts(uid)
      setProducts(userProducts)
    }
    loadProducts()
  }, [uid])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mt-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>

        <FloatingCartButton onClick={() => setIsCartOpen(true)} />
        <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  )
}
