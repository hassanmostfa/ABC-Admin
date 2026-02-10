import { apiSlice } from './apiSlice';

export interface TeamMember {
  id: number;
  name: string;
  image: string;
  job_title: string;
  level: string;
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

export interface TeamMembersResponse {
  success: boolean;
  message: string;
  data: TeamMember[];
  pagination: Pagination;
}

export interface TeamMemberResponse {
  success: boolean;
  message: string;
  data: TeamMember;
}

export interface CreateTeamMemberRequest {
  name: string;
  image: File;
  job_title: string;
  level: string;
}

export interface UpdateTeamMemberRequest {
  name: string;
  image?: File;
  job_title: string;
  level: string;
}

export const teamMembersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeamMembers: builder.query<
      TeamMembersResponse,
      { page?: number; per_page?: number }
    >({
      query: ({ page = 1, per_page = 15 }) => ({
        url: '/admin/team-members',
        params: { page, per_page },
      }),
      providesTags: ['TeamMembers'],
    }),

    getTeamMemberById: builder.query<TeamMemberResponse, number>({
      query: (id) => `/admin/team-members/${id}`,
      providesTags: ['TeamMembers'],
    }),

    createTeamMember: builder.mutation<TeamMemberResponse, CreateTeamMemberRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('image', data.image);
        formData.append('job_title', data.job_title);
        formData.append('level', data.level);
        return {
          url: '/admin/team-members',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['TeamMembers'],
    }),

    updateTeamMember: builder.mutation<TeamMemberResponse, { id: number; data: UpdateTeamMemberRequest }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('job_title', data.job_title);
        formData.append('level', data.level);
        if (data.image) formData.append('image', data.image);
        return {
          url: `/admin/team-members/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['TeamMembers'],
    }),

    deleteTeamMember: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/team-members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeamMembers'],
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useGetTeamMemberByIdQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamMembersApi;
