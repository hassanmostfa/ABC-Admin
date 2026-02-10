import { apiSlice } from './apiSlice';

export interface ActivityLog {
  timestamp: string;
  admin_id: number;
  admin_name: string;
  admin_email: string;
  action: string;
  model: string;
  model_id: number;
  ip_address: string;
  user_agent: string;
  url: string;
  method: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ActivityLogsResponse {
  success: boolean;
  message: string;
  data: ActivityLog[];
  pagination: Pagination;
}

export const activityLogsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query<
      ActivityLogsResponse,
      { page?: number; per_page?: number }
    >({
      query: ({ page = 1, per_page = 15 }) => ({
        url: '/admin/activity-logs',
        params: { page, per_page },
      }),
      providesTags: ['ActivityLogs'],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogsApi;
