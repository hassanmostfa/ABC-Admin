import { apiSlice } from './apiSlice';
import { RootState } from '../store';

export interface Country {
  id: number;
  name_en: string;
  name_ar: string;
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

export interface CountriesResponse {
  success: boolean;
  message: string;
  data: Country[];
  pagination: Pagination;
}

export interface CountryResponse {
  success: boolean;
  message: string;
  data: Country;
}

export interface CreateCountryRequest {
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

export interface UpdateCountryRequest {
  name_ar?: string;
  name_en?: string;
  is_active?: boolean;
}

export const countriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<CountriesResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/countries',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Countries'],
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
    getCountryById: builder.query<CountryResponse, number>({
      query: (id) => `/admin/countries/${id}`,
      providesTags: (result, error, id) => [{ type: 'Countries', id }],
    }),
    createCountry: builder.mutation<CountryResponse, CreateCountryRequest>({
      query: (countryData) => ({
        url: '/admin/countries',
        method: 'POST',
        body: countryData,
      }),
      invalidatesTags: ['Countries'],
    }),
    updateCountry: builder.mutation<CountryResponse, { id: number; countryData: UpdateCountryRequest }>({
      query: ({ id, countryData }) => ({
        url: `/admin/countries/${id}`,
        method: 'PUT',
        body: countryData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Countries', id }, 'Countries'],
    }),
    deleteCountry: builder.mutation<CountryResponse, number>({
      query: (id) => ({
        url: `/admin/countries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Countries'],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetAllCountriesQuery,
  useGetCountryByIdQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} = countriesApi;
