import { apiSlice } from './apiSlice';

export interface OrderByStatus {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

export interface OrdersStats {
  total: number;
  by_status: OrderByStatus;
}

export interface StatisticsLatestOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_offer: boolean;
}

export interface StatisticsLatestOrder {
  id: number;
  customer_id: number;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_type: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
    points: number;
    is_active: boolean;
  };
  items: StatisticsLatestOrderItem[];
  invoice?: {
    id: number;
    invoice_number: string;
    amount_due: number;
    status: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface StatisticsResponse {
  success: boolean;
  message: string;
  data: {
    orders?: OrdersStats;
    total_revenue?: number;
    customers_count: number;
    charities_count: number;
    products_count: number;
    offers_count: number;
    categories_count: number;
    latest_orders: StatisticsLatestOrder[];
  };
}

export const statisticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStatistics: builder.query<StatisticsResponse, void>({
      query: () => ({
        url: '/admin/statistics',
      }),
      providesTags: ['Statistics'],
    }),
  }),
});

export const { useGetStatisticsQuery } = statisticsApi;
