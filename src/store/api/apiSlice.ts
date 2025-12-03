import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE_URL = "https://api.abc-juice-kw.com/api";

// Define base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint, extra }) => {
    // Get token from Redux state
    const token = (getState() as RootState).auth.token;
    
    // If we have a token, include it in the headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'Admins', 'Roles', 'Permissions', 'Customers' , 'Categories', 'Subcategories', 'Products', 'Charities', 'Countries', 'Governorates', 'Areas', 'Offers', 'ContactUs', 'SocialMediaLinks', 'Careers', 'Orders', 'Invoices', 'Settings'],
  endpoints: (builder) => ({}),
});

