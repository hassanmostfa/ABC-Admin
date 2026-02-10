import { apiSlice } from './apiSlice';

export interface RefundRequestOrder {
  id: number;
  order_number: string;
  status: string;
}

export interface RefundRequestCustomer {
  id: number;
  name: string;
  phone: string;
}

export interface RefundRequest {
  id: number;
  order_id: number;
  invoice_id: number;
  customer_id: number;
  amount: number;
  status: string;
  reason: string | null;
  admin_notes: string | null;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  order: RefundRequestOrder;
  customer: RefundRequestCustomer;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface RefundRequestsResponse {
  success: boolean;
  message: string;
  data: RefundRequest[];
  pagination: Pagination;
}

export interface RefundRequestActionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const refundRequestsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRefundRequests: builder.query<
      RefundRequestsResponse,
      { page?: number; per_page?: number; status?: string }
    >({
      query: ({ page = 1, per_page = 15, status }) => ({
        url: '/admin/refund-requests',
        params: { page, per_page, ...(status && { status }) },
      }),
      providesTags: ['RefundRequests'],
    }),

    approveRefundRequest: builder.mutation<RefundRequestActionResponse, number>({
      query: (id) => ({
        url: `/admin/refund-requests/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['RefundRequests'],
    }),

    rejectRefundRequest: builder.mutation<RefundRequestActionResponse, number>({
      query: (id) => ({
        url: `/admin/refund-requests/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['RefundRequests'],
    }),
  }),
});

export const {
  useGetRefundRequestsQuery,
  useApproveRefundRequestMutation,
  useRejectRefundRequestMutation,
} = refundRequestsApi;
