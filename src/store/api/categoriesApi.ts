import { apiSlice } from './apiSlice';
import { RootState } from '../store';

export interface Category {
  id: number;
  name_en: string;
  name_ar: string;
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

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
  pagination: Pagination;
  filters?: Filters;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CreateCategoryRequest {
  name_en: string;
  name_ar: string;
  image?: File;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name_en?: string;
  name_ar?: string;
  image?: File;
  is_active?: boolean;
}

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoriesResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/categories',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Categories'],
    }),

    getAllCategories: builder.query<CategoriesResponse, void>({
      query: () => '/utils/categories',
      providesTags: ['Categories'],
    }),

    getCategoryById: builder.query<CategoryResponse, number>({
      query: (id) => `/admin/categories/${id}`,
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation<CategoryResponse, FormData>({
      query: (formData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<CategoryResponse, { id: number; formData: FormData }>({
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
          
          console.log('Update category FormData contents:');
          for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
          }
          
          const response = await fetch(`https://abc.ghazlaapp.com/api/admin/categories/${id}`, {
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
      invalidatesTags: ['Categories'],
    }),

    deleteCategory: builder.mutation<{ success: boolean; message: string }, number>({
      query: (categoryId) => ({
        url: `/admin/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const { 
  useGetCategoriesQuery, 
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;