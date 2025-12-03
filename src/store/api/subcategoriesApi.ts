import { apiSlice } from './apiSlice';
import { RootState } from '../store';

export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  category: Category;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  is_active: boolean;
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

export interface SubcategoriesResponse {
  success: boolean;
  message: string;
  data: Subcategory[];
  pagination: Pagination;
  filters?: Filters;
}

export interface SubcategoryResponse {
  success: boolean;
  message: string;
  data: Subcategory;
}

export interface CreateSubcategoryRequest {
  category_id: number;
  name_en: string;
  name_ar: string;
  image?: File;
  is_active?: boolean;
}

export interface UpdateSubcategoryRequest {
  category_id?: number;
  name_en?: string;
  name_ar?: string;
  image?: File;
  is_active?: boolean;
}

export const subcategoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubcategories: builder.query<SubcategoriesResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; category_id?: number; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, category_id, per_page }) => ({
        url: '/admin/subcategories',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(category_id && { category_id }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Subcategories'],
    }),

    getSubcategoriesByCategory: builder.query<SubcategoriesResponse, number>({
      query: (categoryId) => `/utils/categories/${categoryId}/subcategories`,
      providesTags: ['Subcategories'],
    }),

    getSubcategoryById: builder.query<SubcategoryResponse, number>({
      query: (id) => `/admin/subcategories/${id}`,
      providesTags: ['Subcategories'],
    }),

    createSubcategory: builder.mutation<SubcategoryResponse, FormData>({
      query: (formData) => ({
        url: '/admin/subcategories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Subcategories'],
    }),

    updateSubcategory: builder.mutation<SubcategoryResponse, { id: number; formData: FormData }>({
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
          
          console.log('Update subcategory FormData contents:');
          for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
          }
          
          const response = await fetch(`https://api.abc-juice-kw.com/api/admin/subcategories/${id}`, {
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
      invalidatesTags: ['Subcategories'],
    }),

    deleteSubcategory: builder.mutation<{ success: boolean; message: string }, number>({
      query: (subcategoryId) => ({
        url: `/admin/subcategories/${subcategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcategories'],
    }),
  }),
});

export const { 
  useGetSubcategoriesQuery, 
  useGetSubcategoriesByCategoryQuery,
  useGetSubcategoryByIdQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subcategoriesApi;
