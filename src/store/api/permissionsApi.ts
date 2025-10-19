import { apiSlice } from './apiSlice';

// Define types for permissions
export interface PermissionItem {
  id: number;
  permission_category_id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PermissionCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  permission_items: PermissionItem[];
}

export interface PermissionsResponse {
  success: boolean;
  data: PermissionCategory[];
  message: string;
}

export interface CreateRoleRequest {
  name: string;
  permissions: {
    [slug: string]: {
      view: number;
      add: number;
      edit: number;
      delete: number;
    };
  };
}

export interface CreateRoleResponse {
  success: boolean;
  data: any;
  message: string;
}

// Inject permissions endpoints into the API slice
export const permissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionsResponse, void>({
      query: () => '/admin/roles/permissions-structure',
      providesTags: ['Permissions'],
    }),
    
    createRole: builder.mutation<CreateRoleResponse, CreateRoleRequest>({
      query: (roleData) => ({
        url: '/admin/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

// Export hooks for usage in components
export const { useGetPermissionsQuery, useCreateRoleMutation } = permissionsApi;

