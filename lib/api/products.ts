import { db } from '@/lib/firebase'
import { ref, get } from 'firebase/database'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  imageUrl?: string
  category?: string
  isAvailable: boolean
  createdAt: number
  updatedAt: number
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  const productsRef = ref(db, `products/${userId}`)
  const snapshot = await get(productsRef)
  
  if (!snapshot.exists()) {
    return []
  }

  const products: Product[] = []
  snapshot.forEach((childSnapshot) => {
    const product = childSnapshot.val()
    products.push({
      id: childSnapshot.key!,
      ...product
    })
  })

  return products.filter(product => product.isAvailable)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}
