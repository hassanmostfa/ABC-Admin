import { apiSlice } from './apiSlice';

export interface SocialMediaLink {
  id: number;
  icon_url: string;
  title_en: string | null;
  title_ar: string | null;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaLinksResponse {
  success: boolean;
  message: string;
  data: SocialMediaLink[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface SocialMediaLinkResponse {
  success: boolean;
  message: string;
  data: SocialMediaLink;
}

export interface SocialMediaLinkQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  is_active?: boolean;
}

export interface CreateSocialMediaLinkData {
  icon: File;
  title_en: string;
  title_ar: string;
  url: string;
  is_active: boolean;
}

export interface UpdateSocialMediaLinkData {
  icon?: File;
  title_en: string;
  title_ar: string;
  url: string;
  is_active: boolean;
}

export const socialMediaLinksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSocialMediaLinks: builder.query<SocialMediaLinksResponse, SocialMediaLinkQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.per_page) searchParams.append('per_page', params.per_page.toString());
        if (params.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params.sort_order) searchParams.append('sort_order', params.sort_order);
        if (params.search) searchParams.append('search', params.search);
        if (params.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
        
        const queryString = searchParams.toString();
        return `/admin/social-media-links${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['SocialMediaLinks'],
    }),

    getSocialMediaLink: builder.query<SocialMediaLinkResponse, number>({
      query: (id) => `/admin/social-media-links/${id}`,
      providesTags: (result, error, id) => [{ type: 'SocialMediaLinks', id }],
    }),

    createSocialMediaLink: builder.mutation<SocialMediaLinkResponse, CreateSocialMediaLinkData>({
      query: (data) => {
        const formData = new FormData();
        formData.append('icon', data.icon);
        formData.append('title_en', data.title_en);
        formData.append('title_ar', data.title_ar);
        formData.append('url', data.url);
        formData.append('is_active', data.is_active ? '1' : '0');
        
        return {
          url: '/admin/social-media-links',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['SocialMediaLinks'],
    }),

    updateSocialMediaLink: builder.mutation<SocialMediaLinkResponse, { id: number; data: UpdateSocialMediaLinkData }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        if (data.icon) formData.append('icon', data.icon);
        formData.append('title_en', data.title_en);
        formData.append('title_ar', data.title_ar);
        formData.append('url', data.url);
        formData.append('is_active', data.is_active ? '1' : '0');
        
        return {
          url: `/admin/social-media-links/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        'SocialMediaLinks',
        { type: 'SocialMediaLinks', id },
      ],
    }),

    deleteSocialMediaLink: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/social-media-links/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialMediaLinks'],
    }),
  }),
});

export const {
  useGetSocialMediaLinksQuery,
  useGetSocialMediaLinkQuery,
  useCreateSocialMediaLinkMutation,
  useUpdateSocialMediaLinkMutation,
  useDeleteSocialMediaLinkMutation,
} = socialMediaLinksApi;
