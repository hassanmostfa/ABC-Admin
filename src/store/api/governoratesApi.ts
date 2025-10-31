import { apiSlice } from './apiSlice';
import { RootState } from '../store';

export interface Country {
  id: number;
  name_en: string;
  name_ar: string;
}

export interface Governorate {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  country: Country;
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

export interface GovernoratesResponse {
  success: boolean;
  message: string;
  data: Governorate[];
  pagination: Pagination;
}

export interface GovernorateResponse {
  success: boolean;
  message: string;
  data: Governorate;
}

export interface CreateGovernorateRequest {
  name_ar: string;
  name_en: string;
  is_active: boolean;
  country_id: number;
}

export interface UpdateGovernorateRequest {
  name_ar?: string;
  name_en?: string;
  is_active?: boolean;
  country_id?: number;
}

export const governoratesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getGovernorates: builder.query<GovernoratesResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/governorates',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Governorates'],
    }),
    getAllGovernorates: builder.query<GovernoratesResponse, void>({
      query: () => ({
        url: '/admin/governorates',
        params: {
          get_all: 1,
        },
      }),
      providesTags: ['Governorates'],
    }),
    getGovernoratesByCountry: builder.query<GovernoratesResponse, number>({
      query: (countryId) => ({
        url: `/admin/governorates/country/${countryId}`,
      }),
      providesTags: ['Governorates'],
    }),
    getGovernorateById: builder.query<GovernorateResponse, number>({
      query: (id) => `/admin/governorates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Governorates', id }],
    }),
    createGovernorate: builder.mutation<GovernorateResponse, CreateGovernorateRequest>({
      query: (governorateData) => ({
        url: '/admin/governorates',
        method: 'POST',
        body: governorateData,
      }),
      invalidatesTags: ['Governorates'],
    }),
    updateGovernorate: builder.mutation<GovernorateResponse, { id: number; governorateData: UpdateGovernorateRequest }>({
      query: ({ id, governorateData }) => ({
        url: `/admin/governorates/${id}`,
        method: 'PUT',
        body: governorateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Governorates', id }, 'Governorates'],
    }),
    deleteGovernorate: builder.mutation<GovernorateResponse, number>({
      query: (id) => ({
        url: `/admin/governorates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Governorates'],
    }),
  }),
});

export const {
  useGetGovernoratesQuery,
  useGetAllGovernoratesQuery,
  useGetGovernoratesByCountryQuery,
  useGetGovernorateByIdQuery,
  useCreateGovernorateMutation,
  useUpdateGovernorateMutation,
  useDeleteGovernorateMutation,
} = governoratesApi;
