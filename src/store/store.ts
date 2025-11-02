import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import './api'; // Import all API endpoints
import authReducer from './slices/authSlice';
import rolesReducer from './slices/rolesSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    roles: rolesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Optional: disable if you have non-serializable data
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;