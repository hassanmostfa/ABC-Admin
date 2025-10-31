import { apiSlice } from './apiSlice';

export interface OfferCondition {
  product_id: number;
  product_variant_id: number;
  quantity: number;
  is_active: boolean;
}

export interface OfferReward {
  product_id?: number;
  product_variant_id?: number;
  quantity?: number;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  is_active: boolean;
}

export interface Charity {
  id: number;
  name_ar: string;
  name_en: string;
}

export interface Offer {
  id: number;
  image: string;
  offer_start_date: string;
  offer_end_date: string;
  is_active: boolean;
  type: 'normal' | 'charity';
  points: number;
  reward_type: 'products' | 'discount';
  charity_id?: number;
  charity?: Charity;
  conditions: OfferCondition[];
  rewards: OfferReward[];
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

export interface Filters {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface OffersResponse {
  success: boolean;
  message: string;
  data: Offer[];
  pagination: Pagination;
  search_applied?: string | null;
}

export interface OfferResponse {
  success: boolean;
  message: string;
  data: Offer;
}

export interface CharitiesResponse {
  success: boolean;
  message: string;
  data: Charity[];
  pagination: Pagination;
}

export interface CreateOfferRequest {
  image: File;
  offer_start_date: string;
  offer_end_date: string;
  is_active: boolean;
  type: 'normal' | 'charity';
  points: number;
  reward_type: 'products' | 'discount';
  charity_id?: number;
  conditions: Omit<OfferCondition, 'is_active'>[];
  rewards: Omit<OfferReward, 'is_active'>[];
}

export interface UpdateOfferRequest {
  image?: File;
  offer_start_date?: string;
  offer_end_date?: string;
  is_active?: boolean;
  type?: 'normal' | 'charity';
  points?: number;
  reward_type?: 'products' | 'discount';
  charity_id?: number;
  conditions?: Omit<OfferCondition, 'is_active'>[];
  rewards?: Omit<OfferReward, 'is_active'>[];
}

export const offersApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOffers: builder.query<OffersResponse, { search?: string; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; per_page?: number }>({
      query: ({ search, page = 1, sort_by, sort_order, per_page }) => ({
        url: '/admin/offers',
        params: {
          ...(search && { search }),
          page,
          ...(sort_by && { sort_by }),
          ...(sort_order && { sort_order }),
          ...(per_page && { per_page }),
        },
      }),
      providesTags: ['Offers'],
    }),

    getAllCharities: builder.query<CharitiesResponse, void>({
      query: () => ({
        url: '/admin/charities',
        params: {
          get_all: 1,
        },
      }),
      providesTags: ['Charities'],
    }),

    getOfferById: builder.query<OfferResponse, number>({
      query: (id) => `/admin/offers/${id}`,
      providesTags: ['Offers'],
    }),

    createOffer: builder.mutation<OfferResponse, CreateOfferRequest>({
      query: (offerData) => {
        const formData = new FormData();
        
        // Append image file
        formData.append('image', offerData.image);
        
        // Append other fields
        formData.append('offer_start_date', offerData.offer_start_date);
        formData.append('offer_end_date', offerData.offer_end_date);
        formData.append('is_active', offerData.is_active ? '1' : '0');
        formData.append('type', offerData.type);
        formData.append('points', offerData.points.toString());
        formData.append('reward_type', offerData.reward_type);
        
        if (offerData.charity_id) {
          formData.append('charity_id', offerData.charity_id.toString());
        }
        
        // Append conditions
        formData.append('conditions', JSON.stringify(offerData.conditions));
        
        // Append rewards
        formData.append('rewards', JSON.stringify(offerData.rewards));

        // Debug log
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        return {
          url: '/admin/offers',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Offers'],
    }),

    updateOffer: builder.mutation<OfferResponse, { id: number; offerData: UpdateOfferRequest }>({
      query: ({ id, offerData }) => {
        const formData = new FormData();
        
        // Append image file if provided
        if (offerData.image) {
          formData.append('image', offerData.image);
        }
        
        // Append other fields if provided
        if (offerData.offer_start_date) {
          formData.append('offer_start_date', offerData.offer_start_date);
        }
        if (offerData.offer_end_date) {
          formData.append('offer_end_date', offerData.offer_end_date);
        }
        if (offerData.is_active !== undefined) {
          formData.append('is_active', offerData.is_active ? '1' : '0');
        }
        if (offerData.type) {
          formData.append('type', offerData.type);
        }
        if (offerData.points !== undefined) {
          formData.append('points', offerData.points.toString());
        }
        if (offerData.reward_type) {
          formData.append('reward_type', offerData.reward_type);
        }
        if (offerData.charity_id !== undefined) {
          formData.append('charity_id', offerData.charity_id.toString());
        }
        if (offerData.conditions) {
          formData.append('conditions', JSON.stringify(offerData.conditions));
        }
        if (offerData.rewards) {
          formData.append('rewards', JSON.stringify(offerData.rewards));
        }

        return {
          url: `/admin/offers/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Offers'],
    }),

    deleteOffer: builder.mutation<{ success: boolean; message: string }, number>({
      query: (offerId) => ({
        url: `/admin/offers/${offerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Offers'],
    }),
  }),
});

export const { 
  useGetOffersQuery, 
  useGetAllCharitiesQuery,
  useGetOfferByIdQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offersApi;
