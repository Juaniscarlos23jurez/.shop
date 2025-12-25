export type Product = {
  id: number | string;
  name: string;
  description: string;
  price: number | string;
  product_type: 'physical' | 'made_to_order' | 'service';
  track_stock?: boolean;
  is_active: boolean;
  category: string;
  image_url?: string;
  points?: number;
  locations: ProductLocation[];
  created_at?: string;
  updated_at?: string;
  sku?: string;
  lead_time_days?: number;
};

export type ProductLocation = {
  id: number;
  is_available: boolean;
  stock?: number;  // Only for physical products
};

export type ProductListResponse = {
  products: Product[];
  products_pagination: {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
  };
  categories: any[];
  point_rule: any;
};

export type ProductResponse = {
  product: Product;
};

export type ProductCreateInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;
