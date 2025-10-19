import { apiSlice } from './apiSlice';

// Define types for the login request and response
export interface LoginRequest {
  login: string;
  password: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginResponse {
  success: boolean;
  data: {
    admin: Admin;
    token: string;
    token_type: string;
  };
  message: string;
}

// Inject auth endpoints into the API slice
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/admin/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

// Export hooks for usage in components
export const { useLoginMutation, useLogoutMutation } = authApi;

