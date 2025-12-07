import { apiSlice } from './apiSlice';

export interface Slider {
  id: number;
  image: string;
  is_published: boolean;
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

export interface SlidersResponse {
  success: boolean;
  message: string;
  data: Slider[];
  pagination: Pagination;
}

export interface SliderResponse {
  success: boolean;
  message: string;
  data: Slider;
}

export interface CreateSliderRequest {
  image: File;
  is_published: boolean;
}

export interface UpdateSliderRequest {
  image?: File;
  is_published: boolean;
}

export const slidersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSliders: builder.query<SlidersResponse, void>({
      query: () => ({
        url: '/admin/sliders',
      }),
      providesTags: ['Sliders'],
    }),

    createSlider: builder.mutation<SliderResponse, CreateSliderRequest>({
      query: (sliderData) => {
        const formData = new FormData();
        formData.append('image', sliderData.image);
        formData.append('is_published', sliderData.is_published ? '1' : '0');
        
        return {
          url: '/admin/sliders',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Sliders'],
    }),

    updateSlider: builder.mutation<SliderResponse, { id: number; sliderData: UpdateSliderRequest }>({
      query: ({ id, sliderData }) => {
        const formData = new FormData();
        if (sliderData.image) {
          formData.append('image', sliderData.image);
        }
        formData.append('is_published', sliderData.is_published ? '1' : '0');
        
        return {
          url: `/admin/sliders/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Sliders'],
    }),

    deleteSlider: builder.mutation<SliderResponse, number>({
      query: (id) => ({
        url: `/admin/sliders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sliders'],
    }),
  }),
});

export const {
  useGetSlidersQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = slidersApi;

