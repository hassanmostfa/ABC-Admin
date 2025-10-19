import { apiSlice } from './apiSlice';

// Define types for roles
export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  pagination?: Pagination;
  message: string;
}

export interface RolePermissions {
  [slug: string]: {
    view: number;
    add: number;
    edit: number;
    delete: number;
  };
}

export interface RoleDetailResponse {
  success: boolean;
  data: {
    role_id: number;
    role_name: string;
    role_description: string;
    is_active: boolean;
    permissions: RolePermissions;
  };
  message: string;
}

export interface UpdateRoleRequest {
  name: string;
  permissions: RolePermissions;
}

export interface UpdateRoleResponse {
  success: boolean;
  data: any;
  message: string;
}

export interface AllRolesResponse {
  success: boolean;
  data: Role[];
  message: string;
}

// Inject roles endpoints into the API slice
export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RolesResponse, { search?: string; page?: number }>({
      query: ({ search, page = 1 }) => ({
        url: '/admin/roles',
        params: {
          ...(search && { search }),
          page,
        },
      }),
      providesTags: ['Roles'],
    }),
    
    getAllRoles: builder.query<AllRolesResponse, void>({
      query: () => ({
        url: '/admin/roles',
        params: { all: 1 },
      }),
      providesTags: ['Roles'],
    }),
    
    getRoleById: builder.query<RoleDetailResponse, number>({
      query: (roleId) => `/admin/roles/${roleId}`,
      providesTags: ['Roles'],
    }),
    
    updateRole: builder.mutation<UpdateRoleResponse, { roleId: number; data: UpdateRoleRequest }>({
      query: ({ roleId, data }) => ({
        url: `/admin/roles/${roleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),
    
    deleteRole: builder.mutation<{ success: boolean; message: string }, number>({
      query: (roleId) => ({
        url: `/admin/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

// Export hooks for usage in components
export const { 
  useGetRolesQuery, 
  useGetAllRolesQuery,
  useGetRoleByIdQuery, 
  useUpdateRoleMutation, 
  useDeleteRoleMutation 
} = rolesApi;

