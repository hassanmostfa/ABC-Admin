import { apiSlice } from './apiSlice';

// Define types for admins
export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface AdminsResponse {
  success: boolean;
  data: Admin[];
  pagination: Pagination;
  message: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
  is_active: boolean;
}

export interface UpdateAdminRequest {
  name: string;
  email: string;
  phone: string;
  role_id: number;
  is_active: boolean;
}

export interface AdminResponse {
  success: boolean;
  data: any;
  message: string;
}

// Inject admins endpoints into the API slice
export const adminsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<AdminsResponse, { search?: string; page?: number }>({
      query: ({ search, page = 1 }) => ({
        url: '/admin/admins',
        params: {
          ...(search && { search }),
          page,
        },
      }),
      providesTags: ['Admins'],
    }),
    
    getAdminById: builder.query<AdminResponse, number>({
      query: (adminId) => `/admin/admins/${adminId}`,
      providesTags: ['Admins'],
    }),
    
    createAdmin: builder.mutation<AdminResponse, CreateAdminRequest>({
      query: (adminData) => ({
        url: '/admin/admins',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admins'],
    }),
    
    updateAdmin: builder.mutation<AdminResponse, { adminId: number; data: UpdateAdminRequest }>({
      query: ({ adminId, data }) => ({
        url: `/admin/admins/${adminId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Admins'],
    }),
    
    deleteAdmin: builder.mutation<{ success: boolean; message: string }, number>({
      query: (adminId) => ({
        url: `/admin/admins/${adminId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admins'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAdminsQuery,
  useGetAdminByIdQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminsApi;

