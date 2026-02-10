import { apiSlice } from './apiSlice';

export interface PaymentCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface PaymentOrderCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface PaymentOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_type?: string;
  customer: PaymentOrderCustomer | null;
}

export interface PaymentInvoice {
  id: number;
  invoice_number: string;
  amount_due: number;
  status: string;
  order: PaymentOrder | null;
}

export interface Payment {
  id: number;
  invoice_id: number | null;
  customer_id: number | null;
  reference: string | null;
  type: string;
  payment_number: string;
  amount: number;
  bonus_amount: number;
  total_amount: number | null;
  method: string;
  status: string;
  paid_at: string | null;
  receipt_id: string | null;
  customer: PaymentCustomer | null;
  invoice: PaymentInvoice | null;
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

export interface PaymentsResponse {
  success: boolean;
  message: string;
  data: Payment[];
  pagination: Pagination;
}

export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<
      PaymentsResponse,
      { page?: number; per_page?: number; status?: string; type?: string; method?: string }
    >({
      query: ({ page = 1, per_page = 15, status, type, method }) => ({
        url: '/admin/payments',
        params: {
          page,
          per_page,
          ...(status && { status }),
          ...(type && { type }),
          ...(method && { method }),
        },
      }),
      providesTags: ['Payments'],
    }),
  }),
});

export const { useGetPaymentsQuery } = paymentsApi;
