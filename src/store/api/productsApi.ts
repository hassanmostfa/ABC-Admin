import { apiSlice } from './apiSlice';
import { RootState } from '../store';

export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
}

export interface Subcategory {
  id: number;
  name_ar: string;
  name_en: string;
  category_id: number;
}

export interface ProductVariant {
  id?: number;
  image?: File | string;
  size: string;
  sku: string;
  short_item: string;
  quantity: number;
  price: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name_en: string;
  name_ar: string;
  quantity: number;
  price: number;
  size: string;
  category_id: number;
  subcategory_id: number;
  description_en: string;
  description_ar: string;
  sku: string;
  short_item: string;
  is_active: boolean;
  category?: Category;
  subcategory?: Subcategory;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface Filters {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: Pagination;
  filters?: Filters;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface CreateProductRequest {
  name_en: string;
  name_ar: string;
  quantity: number;
  price: number;
  size: string;
  category_id: number;
  subcategory_id: number;
  description_en: string;
  description_ar: string;
  sku: string;
  short_item: string;
  is_active: boolean;
  variants: ProductVariant[];
}

export interface UpdateProductRequest {
  name_en?: string;
  name_ar?: string;
  quantity?: number;
  price?: number;
  size?: string;
  category_id?: number;
  subcategory_id?: number;
  description_en?: string;
  description_ar?: string;
  sku?: string;
  short_item?: string;
  is_active?: boolean;
  variants?: ProductVariant[];
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; category_id?: number; subcategory_id?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, category_id, subcategory_id }) => ({
        url: '/admin/products',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(category_id && { category_id }),
          ...(subcategory_id && { subcategory_id }),
        },
      }),
      providesTags: ['Products'],
    }),

    getProductById: builder.query<ProductResponse, number>({
      query: (id) => `/admin/products/${id}`,
      providesTags: ['Products'],
    }),

    createProduct: builder.mutation<ProductResponse, FormData>({
      query: (formData) => ({
        url: '/admin/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation<ProductResponse, { id: number; formData: FormData }>({
      queryFn: async ({ id, formData }, { getState }) => {
        try {
          // Get token from Redux state
          const token = (getState() as RootState).auth.token;
          
          // Create headers
          const headers: HeadersInit = {};
          if (token) {
            headers['authorization'] = `Bearer ${token}`;
          }
          
          // Remove _method field if it exists (server doesn't support method spoofing)
          if (formData.has('_method')) {
            formData.delete('_method');
          }
          
          console.log('Update product FormData contents:');
          for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
          }
          
          const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
            method: 'POST',
            headers,
            body: formData,
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Products'],
    }),

    deleteProduct: builder.mutation<{ success: boolean; message: string }, number>({
      query: (productId) => ({
        url: `/admin/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const { 
  useGetProductsQuery, 
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
