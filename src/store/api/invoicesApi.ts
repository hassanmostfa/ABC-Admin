import { apiSlice } from './apiSlice';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface Charity {
  id: number;
  name_ar: string;
  name_en: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  variant_id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_offer: boolean;
}

export interface Delivery {
  id: number;
  delivery_address: string;
  delivery_status: string;
  payment_method: string;
}

export interface Order {
  id: number;
  order_number: string;
  payment_method: string;
  status: string;
  total_amount: number;
  delivery_type: string;
  customer?: Customer;
  charity?: Charity;
  items?: OrderItem[];
  delivery?: Delivery;
  created_at: string;
}

export interface Payment {
  id?: number;
  amount?: number;
  payment_method?: string;
  paid_at?: string;
}

export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  total_before_discounts: number;
  amount_due: number;
  tax_amount: number;
  offer_discount: number;
  used_points: number;
  points_discount: number;
  total_discount: number;
  status: string;
  paid_at: string | null;
  order: Order;
  payments?: Payment[];
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

export interface InvoicesResponse {
  success: boolean;
  message: string;
  data: Invoice[];
  pagination: Pagination;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}

export interface InvoicesParams {
  page?: number;
  search?: string;
  status?: string;
  order_id?: number;
  date_from?: string;
  date_to?: string;
}

export const invoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoicesResponse, InvoicesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.order_id) queryParams.append('order_id', params.order_id.toString());
        if (params.date_from) queryParams.append('date_from', params.date_from);
        if (params.date_to) queryParams.append('date_to', params.date_to);
        
        return {
          url: `/admin/invoices?${queryParams.toString()}`,
        };
      },
      providesTags: ['Invoices'],
    }),
    getInvoiceById: builder.query<InvoiceResponse, number>({
      query: (id) => ({
        url: `/admin/invoices/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Invoices', id }],
    }),
    updateInvoiceStatus: builder.mutation<InvoiceResponse, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/invoices/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Invoices'],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceStatusMutation,
} = invoicesApi;

