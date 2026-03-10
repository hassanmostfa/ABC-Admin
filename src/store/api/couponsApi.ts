import { apiSlice } from "./apiSlice";

export type CouponDiscountType = "fixed" | "percentage";
export type CouponType = "general" | "product_variant";

export interface CouponProductVariant {
  id: number;
  product_id: number;
  size: string;
  short_item: string;
  sku: string;
  quantity: number;
  price: number;
  image?: string;
  is_active: boolean;
  product?: {
    id: number;
    name_en: string;
    name_ar: string;
    sku: string;
    is_active: boolean;
  };
}

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  discount_type: CouponDiscountType;
  discount_value: number;
  minimum_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  customer_id: number | null;
  product_variant_ids: number[];
  product_variants?: CouponProductVariant[];
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface CouponsResponse {
  success: boolean;
  message: string;
  data: Coupon[];
  pagination: Pagination;
  filters?: unknown[];
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface CreateCouponRequest {
  code: string;
  type: CouponType;
  discount_type: CouponDiscountType;
  discount_value: number;
  minimum_order_amount?: number;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  product_variant_ids?: number[];
}

export interface UpdateCouponRequest extends Partial<Omit<CreateCouponRequest, "code">> {
  code?: string;
  is_active?: boolean;
}

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<
      CouponsResponse,
      { search?: string; page?: number; per_page?: number; sort_by?: string; sort_order?: "asc" | "desc" }
    >({
      query: ({ search, page = 1, per_page = 15, sort_by = "created_at", sort_order = "desc" }) => ({
        url: "/admin/coupons",
        params: {
          ...(search && { search }),
          page,
          per_page,
          sort_by,
          sort_order,
        },
      }),
      providesTags: ["Coupons"],
    }),

    getCouponById: builder.query<CouponResponse, number>({
      query: (id) => `/admin/coupons/${id}`,
      providesTags: ["Coupons"],
    }),

    createCoupon: builder.mutation<CouponResponse, CreateCouponRequest>({
      query: (data) => ({
        url: "/admin/coupons",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupons"],
    }),

    updateCoupon: builder.mutation<CouponResponse, { id: number; data: UpdateCouponRequest }>({
      query: ({ id, data }) => ({
        url: `/admin/coupons/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Coupons"],
    }),

    deleteCoupon: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons"],
    }),

    toggleCouponActive: builder.mutation<CouponResponse, number>({
      query: (id) => ({
        url: `/admin/coupons/${id}/toggle-active`,
        method: "PATCH",
      }),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponActiveMutation,
} = couponsApi;
