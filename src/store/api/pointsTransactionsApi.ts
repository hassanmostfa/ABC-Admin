import { apiSlice } from './apiSlice';

export interface PointsTransactionCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface PointsTransaction {
  id: number;
  type: string;
  type_label: string;
  amount: number;
  points: number;
  description: string | null;
  reference_id: number | null;
  reference_type: string | null;
  metadata: Record<string, unknown> | null;
  customer: PointsTransactionCustomer | null;
  created_at: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PointsTransactionsResponse {
  success: boolean;
  message: string;
  data: PointsTransaction[];
  pagination: Pagination;
}

export const pointsTransactionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPointsTransactions: builder.query<
      PointsTransactionsResponse,
      { page?: number; per_page?: number; type?: string }
    >({
      query: ({ page = 1, per_page = 15, type }) => ({
        url: '/admin/points-transactions',
        params: {
          page,
          per_page,
          ...(type && { type }),
        },
      }),
      providesTags: ['PointsTransactions'],
    }),
  }),
});

export const { useGetPointsTransactionsQuery } = pointsTransactionsApi;
