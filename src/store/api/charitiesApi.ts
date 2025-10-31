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
}

export interface Area {
  id: number;
  name_en: string;
  name_ar: string;
}

export interface Charity {
  id: number;
  name_ar: string;
  name_en: string;
  phone: string;
  country: Country | null;
  governorate: Governorate | null;
  area: Area | null;
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

export interface Filters {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CharitiesResponse {
  success: boolean;
  message: string;
  data: Charity[];
  pagination: Pagination;
  search_applied?: string | null;
}

export interface CountriesResponse {
  success: boolean;
  message: string;
  data: Country[];
  pagination: Pagination;
}

export interface GovernoratesResponse {
  success: boolean;
  message: string;
  data: Governorate[];
  pagination: Pagination;
}

export interface AreasResponse {
  success: boolean;
  message: string;
  data: Area[];
  pagination: Pagination;
}

export interface CharityResponse {
  success: boolean;
  message: string;
  data: Charity;
}

export interface CreateCharityRequest {
  name_ar: string;
  name_en: string;
  phone: string;
  country_id: number;
  governorate_id: number;
  area_id: number;
}

export interface UpdateCharityRequest {
  name_ar?: string;
  name_en?: string;
  phone?: string;
  country_id?: number;
  governorate_id?: number;
  area_id?: number;
}

export const charitiesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCharities: builder.query<CharitiesResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/charities',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Charities'],
    }),

    getAllCountries: builder.query<CountriesResponse, void>({
      query: () => ({
        url: '/admin/countries',
        params: {
          get_all: 1,
        },
      }),
      providesTags: ['Countries'],
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

    getAllAreas: builder.query<AreasResponse, void>({
      query: () => ({
        url: '/admin/areas',
        params: {
          get_all: 1,
        },
      }),
      providesTags: ['Areas'],
    }),

    getGovernoratesByCountry: builder.query<GovernoratesResponse, number>({
      query: (countryId) => ({
        url: `/admin/governorates/country/${countryId}`,
      }),
      providesTags: ['Governorates'],
    }),

    getAreasByGovernorate: builder.query<AreasResponse, number>({
      query: (governorateId) => ({
        url: `/admin/areas/governorate/${governorateId}`,
      }),
      providesTags: ['Areas'],
    }),

    getCharityById: builder.query<CharityResponse, number>({
      query: (id) => `/admin/charities/${id}`,
      providesTags: ['Charities'],
    }),

    createCharity: builder.mutation<CharityResponse, CreateCharityRequest>({
      query: (charityData) => ({
        url: '/admin/charities',
        method: 'POST',
        body: charityData,
      }),
      invalidatesTags: ['Charities'],
    }),

    updateCharity: builder.mutation<CharityResponse, { id: number; charityData: UpdateCharityRequest }>({
      query: ({ id, charityData }) => ({
        url: `/admin/charities/${id}`,
        method: 'PUT',
        body: charityData,
      }),
      invalidatesTags: ['Charities'],
    }),

    deleteCharity: builder.mutation<{ success: boolean; message: string }, number>({
      query: (charityId) => ({
        url: `/admin/charities/${charityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charities'],
    }),
  }),
});

export const { 
  useGetCharitiesQuery, 
  useGetAllCountriesQuery,
  useGetAllGovernoratesQuery,
  useGetAllAreasQuery,
  useGetGovernoratesByCountryQuery,
  useGetAreasByGovernorateQuery,
  useGetCharityByIdQuery,
  useCreateCharityMutation,
  useUpdateCharityMutation,
  useDeleteCharityMutation,
} = charitiesApi;
