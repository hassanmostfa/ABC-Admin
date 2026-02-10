import { apiSlice } from "./apiSlice";

export interface Faq {
  id: number;
  question_en: string | null;
  question_ar: string | null;
  answer_en: string | null;
  answer_ar: string | null;
  is_active: boolean;
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

export interface FaqsResponse {
  success: boolean;
  message: string;
  data: Faq[];
  pagination?: Pagination;
}

export interface FaqResponse {
  success: boolean;
  message: string;
  data: Faq;
}

export interface CreateFaqRequest {
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_active: boolean;
}

export interface UpdateFaqRequest extends CreateFaqRequest {}

export const faqsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<
      FaqsResponse,
      { search?: string; page?: number; per_page?: number; sort_by?: string; sort_order?: "asc" | "desc" }
    >({
      query: ({ search, page = 1, per_page = 15, sort_by = "created_at", sort_order = "desc" }) => ({
        url: "/admin/faqs",
        params: {
          ...(search && { search }),
          page,
          per_page,
          sort_by,
          sort_order,
        },
      }),
      providesTags: ["Faqs"],
    }),

    getFaqById: builder.query<FaqResponse, number>({
      query: (id) => `/admin/faqs/${id}`,
      providesTags: ["Faqs"],
    }),

    createFaq: builder.mutation<FaqResponse, CreateFaqRequest>({
      query: (data) => ({
        url: "/admin/faqs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Faqs"],
    }),

    updateFaq: builder.mutation<FaqResponse, { id: number; data: UpdateFaqRequest }>({
      query: ({ id, data }) => ({
        url: `/admin/faqs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Faqs"],
    }),

    deleteFaq: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faqs"],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqsApi;

