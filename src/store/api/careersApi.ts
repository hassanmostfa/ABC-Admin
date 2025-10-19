import { apiSlice } from './apiSlice';

export interface CareerApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  applying_position: string;
  message: string;
  file_url: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export interface CareersResponse {
  success: boolean;
  message: string;
  data: CareerApplication[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface CareersQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export const careersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCareerApplications: builder.query<CareersResponse, CareersQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.per_page) searchParams.append('per_page', params.per_page.toString());
        if (params.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params.sort_order) searchParams.append('sort_order', params.sort_order);
        if (params.search) searchParams.append('search', params.search);
        
        const queryString = searchParams.toString();
        return `/admin/careers${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Careers'],
    }),

    deleteCareerApplication: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/careers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Careers'],
    }),
  }),
});

export const {
  useGetCareerApplicationsQuery,
  useDeleteCareerApplicationMutation,
} = careersApi;
