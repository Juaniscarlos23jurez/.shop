export type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  product_type: 'physical' | 'made_to_order' | 'service';
  track_stock?: boolean;
  is_active: boolean;
  category: string;
  image_url?: string;
  points?: number;
  locations: ProductLocation[];
  created_at?: string;
  updated_at?: string;
};

export type ProductLocation = {
  id: number;
  is_available: boolean;
  stock?: number;  // Only for physical products
};

export type ProductListResponse = {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
};

export type ProductResponse = {
  product: Product;
};

export type ProductCreateInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;
