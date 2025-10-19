import { apiSlice } from './apiSlice';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactUsResponse {
  success: boolean;
  message: string;
  data: ContactMessage[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters: {
    sort_by: string;
    sort_order: string;
  };
}

export interface ContactUsQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  is_read?: boolean;
}

export const contactUsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query<ContactUsResponse, ContactUsQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.per_page) searchParams.append('per_page', params.per_page.toString());
        if (params.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params.sort_order) searchParams.append('sort_order', params.sort_order);
        if (params.search) searchParams.append('search', params.search);
        if (params.is_read !== undefined) searchParams.append('is_read', params.is_read.toString());
        
        const queryString = searchParams.toString();
        return `/admin/contact-us${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['ContactUs'],
    }),

    markContactAsRead: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/contact-us/${id}/mark-read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ContactUs'],
    }),

    deleteContactMessage: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/contact-us/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContactUs'],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useMarkContactAsReadMutation,
  useDeleteContactMessageMutation,
} = contactUsApi;
