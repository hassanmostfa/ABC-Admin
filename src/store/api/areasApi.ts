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
  country: Country;
}

export interface Area {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  governorate: Governorate;
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

export interface AreasResponse {
  success: boolean;
  message: string;
  data: Area[];
  pagination: Pagination;
}

export interface GovernoratesResponse {
  success: boolean;
  message: string;
  data: Governorate[];
  pagination: Pagination;
}

export interface AreaResponse {
  success: boolean;
  message: string;
  data: Area;
}

export interface CreateAreaRequest {
  name_ar: string;
  name_en: string;
  is_active: boolean;
  governorate_id: number;
}

export interface UpdateAreaRequest {
  name_ar?: string;
  name_en?: string;
  is_active?: boolean;
  governorate_id?: number;
}

export const areasApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAreas: builder.query<AreasResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/areas',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Areas'],
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
    getAreasByGovernorate: builder.query<AreasResponse, number>({
      query: (governorateId) => ({
        url: `/admin/areas/governorate/${governorateId}`,
      }),
      providesTags: ['Areas'],
    }),
    getAreaById: builder.query<AreaResponse, number>({
      query: (id) => `/admin/areas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Areas', id }],
    }),
    createArea: builder.mutation<AreaResponse, CreateAreaRequest>({
      query: (areaData) => ({
        url: '/admin/areas',
        method: 'POST',
        body: areaData,
      }),
      invalidatesTags: ['Areas'],
    }),
    updateArea: builder.mutation<AreaResponse, { id: number; areaData: UpdateAreaRequest }>({
      query: ({ id, areaData }) => ({
        url: `/admin/areas/${id}`,
        method: 'PUT',
        body: areaData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Areas', id }, 'Areas'],
    }),
    deleteArea: builder.mutation<AreaResponse, number>({
      query: (id) => ({
        url: `/admin/areas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Areas'],
    }),
  }),
});

export const {
  useGetAreasQuery,
  useGetAllGovernoratesQuery,
  useGetAreasByGovernorateQuery,
  useGetAreaByIdQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
} = areasApi;
