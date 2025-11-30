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
    getCustomers: builder.query<CustomersResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/customers',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Customers'],
    }),

    getAllCustomers: builder.query<CustomersResponse, void>({
      query: () => ({
        url: '/admin/customers',
        params: {
          get_all: 1,
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

    searchCustomerByPhone: builder.query<CustomerResponse, string>({
      query: (phone) => ({
        url: '/admin/customers',
        params: {
          search: phone,
          per_page: 1,
        },
      }),
      transformResponse: (response: CustomersResponse): CustomerResponse => {
        if (response.data && response.data.length > 0) {
          return {
            success: true,
            message: response.message,
            data: response.data[0],
          };
        }
        throw new Error('Customer not found');
      },
    }),

    getCustomerAddresses: builder.query<{ success: boolean; message: string; data: any[] }, number>({
      query: (customerId) => ({
        url: `/admin/customer-addresses/customer/${customerId}`,
      }),
    }),

    createCustomerAddress: builder.mutation<{ success: boolean; message: string; data: any }, { customerId: number; address: any }>({
      query: ({ customerId, address }) => ({
        url: `/admin/customer-addresses`,
        method: 'POST',
        body: {
          ...address,
          customer_id: customerId,
        },
      }),
    }),
  }),
});

export const { 
  useGetCustomersQuery, 
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useSearchCustomerByPhoneQuery,
  useLazySearchCustomerByPhoneQuery,
  useGetCustomerAddressesQuery,
  useCreateCustomerAddressMutation,
} = customersApi;
