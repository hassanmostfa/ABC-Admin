import { apiSlice } from './apiSlice';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  points: number;
  is_active: boolean;
}

export interface Charity {
  id: number;
  name_ar: string;
  name_en: string;
  phone: string;
}

export interface Offer {
  id: number;
  reward_type: string;
  points: number;
  offer_start_date: string;
  offer_end_date: string;
  is_active: boolean;
}

export interface ProductVariant {
  product_id: number;
  product_name_ar: string;
  product_name_en: string;
  product_sku: string;
  variant_id: number;
  variant_size: string;
  variant_sku: string;
  variant_price: number;
  variant_is_active: boolean;
}

export interface OrderItem {
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
  product_variant: ProductVariant;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  total_before_discounts: number;
  tax_amount: number;
  offer_discount: number;
  used_points: number;
  points_discount: number;
  total_discount: number;
  amount_due: number;
  status: string;
  paid_at: string | null;
  payment_link?: string;
}

export interface Delivery {
  id: number;
  payment_method: string;
  delivery_address: string;
  block: string;
  street: string;
  house_number: string;
  delivery_datetime: string;
  received_datetime: string | null;
  delivery_status: string;
  notes: string | null;
}

export interface Order {
  id: number;
  customer_id: number | null;
  charity_id: number | null;
  type: 'customer' | 'charity';
  payment_method: 'cash' | 'wallet' | 'card' | 'online_link';
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | null;
  total_amount: number;
  offer_id: number | null;
  offer_snapshot: any | null;
  delivery_type: 'pickup' | 'delivery';
  customer: Customer | null;
  charity: Charity | null;
  offer: Offer | null;
  items?: OrderItem[];
  invoice?: Invoice;
  delivery?: Delivery;
  payment_link?: string;
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

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: Pagination;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersResponse, { 
      search?: string; 
      page?: number; 
      status?: string;
      payment_method?: string;
      delivery_type?: string;
      date_from?: string;
      date_to?: string;
      sort_by?: string; 
      sort_order?: 'asc' | 'desc' 
    }>({
      query: ({ search, page = 1, status, payment_method, delivery_type, date_from, date_to, sort_by, sort_order }) => ({
        url: '/admin/orders',
        params: {
          ...(search && { search }),
          page,
          ...(status && { status }),
          ...(payment_method && { payment_method }),
          ...(delivery_type && { delivery_type }),
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
        },
      }),
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query<OrderResponse, number>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: ['Orders'],
    }),

    updateOrderStatus: builder.mutation<OrderResponse, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),

    createOrder: builder.mutation<OrderResponse, {
      customer_id?: number;
      charity_id?: number;
      customer_address_id?: number;
      payment_method: 'cash' | 'wallet' | 'online_link';
      delivery_type: 'pickup' | 'delivery';
      offers?: Array<{ offer_id: number; quantity: number }>;
      used_points?: number;
      items?: Array<{ variant_id: number; quantity: number }>;
      delivery?: {
        delivery_address: string;
        block: string;
        street: string;
        house_number: string;
        delivery_datetime: string;
        delivery_status: string;
        notes?: string;
      };
    }>({
      query: (data) => ({
        url: '/admin/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCreateOrderMutation,
} = ordersApi;

