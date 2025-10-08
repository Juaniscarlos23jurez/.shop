export interface Category {
  id: number;
  company_id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  order?: number;
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {}

export interface CategoryResponse {
  status: string;
  message?: string;
  data: Category;
}

export interface CategoryListResponse {
  status: string;
  data: Category[];
}
