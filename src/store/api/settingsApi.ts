import { apiSlice } from './apiSlice';

export interface SettingTranslations {
  en?: string;
  ar?: string;
}

export interface Setting {
  key: string;
  value: string | null;
  translations?: SettingTranslations;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data: Setting[];
}

export interface UpdateSettingItem {
  key: string;
  value?: string | null;
  translations?: SettingTranslations;
}

export interface UpdateSettingsRequest {
  settings: UpdateSettingItem[];
}

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
  data: Setting[];
}

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<SettingsResponse, void>({
      query: () => ({
        url: '/admin/settings',
      }),
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<UpdateSettingsResponse, UpdateSettingsRequest>({
      query: (settingsData) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi;

