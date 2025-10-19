import { apiSlice } from './apiSlice';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  points: number;
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

export interface CustomersResponse {
  success: boolean;
  message: string;
  data: Customer[];
  pagination: Pagination;
  filters?: Filters;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface UpdateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export const customersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomersResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }>({
      query: ({ search, page = 1, sort_by, sort_order }) => ({
        url: '/admin/customers',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
        },
      }),
      providesTags: ['Customers'],
    }),

    getCustomerById: builder.query<CustomerResponse, number>({
      query: (id) => `/admin/customers/${id}`,
      providesTags: ['Customers'],
    }),

    createCustomer: builder.mutation<CustomerResponse, CreateCustomerRequest>({
      query: (data) => ({
        url: '/admin/customers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Customers'],
    }),

    updateCustomer: builder.mutation<CustomerResponse, { id: number; data: UpdateCustomerRequest }>({
      query: ({ id, data }) => ({
        url: `/admin/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Customers'],
    }),

    deleteCustomer: builder.mutation<{ success: boolean; message: string }, number>({
      query: (customerId) => ({
        url: `/admin/customers/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
});

export const { 
  useGetCustomersQuery, 
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation 
} = customersApi;
