import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Admin } from '../api/authApi';

interface AuthState {
  token: string | null;
  tokenType: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage if available
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      return {
        token,
        tokenType,
        admin: JSON.parse(adminData),
        isAuthenticated: true,
      };
    }
  }
  
  return {
    token: null,
    tokenType: null,
    admin: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; tokenType: string; admin: Admin }>
    ) => {
      const { token, tokenType, admin } = action.payload;
      state.token = token;
      state.tokenType = tokenType;
      state.admin = admin;
      state.isAuthenticated = true;
      
      // Persist to localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenType', tokenType);
        localStorage.setItem('adminData', JSON.stringify(admin));
        
        // Set cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      }
    },
    
    logout: (state) => {
      state.token = null;
      state.tokenType = null;
      state.admin = null;
      state.isAuthenticated = false;
      
      // Clear localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('adminData');
        
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

