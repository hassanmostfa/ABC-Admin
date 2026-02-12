import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';
import { logout } from '../slices/authSlice';

const API_BASE_URL = "https://api.abc-juice-kw.com/api";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/** Wraps baseQuery to handle 401 Unauthorized - logout and redirect to login */
const baseQueryWith401Logout: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch(logout());
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/auth2/login';
    }
  }

  return result;
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWith401Logout,
  tagTypes: ['Auth', 'Admins', 'Roles', 'Permissions', 'Customers' , 'Categories', 'Subcategories', 'Products', 'Charities', 'Countries', 'Governorates', 'Areas', 'Offers', 'ContactUs', 'SocialMediaLinks', 'Careers', 'Orders', 'Invoices', 'Settings', 'Sliders', 'ActivityLogs', 'Faqs', 'RefundRequests', 'Payments', 'TeamMembers', 'PointsTransactions', 'Statistics'],
  endpoints: (builder) => ({}),
});

