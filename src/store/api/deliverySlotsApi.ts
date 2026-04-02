import { apiSlice } from './apiSlice';

export interface DeliverySlot {
  start: string;
  end: string;
  delivery_time: string;
  remaining: number;
  capacity: number;
  booked: number;
}

export interface DeliverySlotsResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    is_day_off: boolean;
    out_of_range: boolean;
    message: string | null;
    slots: DeliverySlot[];
    meta: {
      opening_time: string;
      closing_time: string;
      slot_interval_minutes: number;
      max_delivery_per_slot: number;
      timezone: string;
    };
  };
}

export const deliverySlotsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeliverySlots: builder.mutation<DeliverySlotsResponse, { date: string }>({
      query: (body) => ({
        url: '/delivery-slots',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetDeliverySlotsMutation } = deliverySlotsApi;
