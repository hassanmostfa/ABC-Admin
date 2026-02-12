import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Admin, RolePermissions } from '../api/authApi';

interface AuthState {
  token: string | null;
  tokenType: string | null;
  admin: Admin | null;
  rolePermissions: RolePermissions | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage if available
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType');
    const adminData = localStorage.getItem('adminData');
    const rolePermissionsData = localStorage.getItem('rolePermissions');
    
    if (token && adminData) {
      return {
        token,
        tokenType,
        admin: JSON.parse(adminData),
        rolePermissions: rolePermissionsData ? JSON.parse(rolePermissionsData) : null,
        isAuthenticated: true,
      };
    }
  }
  
  return {
    token: null,
    tokenType: null,
    admin: null,
    rolePermissions: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; tokenType: string; admin: Admin; rolePermissions: RolePermissions }>
    ) => {
      const { token, tokenType, admin, rolePermissions } = action.payload;
      state.token = token;
      state.tokenType = tokenType;
      state.admin = admin;
      state.rolePermissions = rolePermissions;
      state.isAuthenticated = true;
      
      // Persist to localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenType', tokenType);
        localStorage.setItem('adminData', JSON.stringify(admin));
        localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
        
        // Set cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      }
    },
    
    logout: (state) => {
      state.token = null;
      state.tokenType = null;
      state.admin = null;
      state.rolePermissions = null;
      state.isAuthenticated = false;
      
      // Clear localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('adminData');
        localStorage.removeItem('rolePermissions');
        
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    },

    /** Update role permissions (e.g. after fetching from /admin/roles/{id} on refresh) */
    setRolePermissions: (state, action: PayloadAction<RolePermissions>) => {
      state.rolePermissions = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rolePermissions', JSON.stringify(action.payload));
      }
    },

    /** Update admin's role info (e.g. after fetching from /admin/roles/{id} on refresh) */
    updateAdminRole: (
      state,
      action: PayloadAction<{ id: number; name: string; description: string; is_active: boolean }>
    ) => {
      if (state.admin?.role) {
        state.admin.role = {
          ...state.admin.role,
          id: action.payload.id,
          name: action.payload.name,
          description: action.payload.description,
          is_active: action.payload.is_active,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminData', JSON.stringify(state.admin));
        }
      }
    },
  },
});

export const { setCredentials, logout, setRolePermissions, updateAdminRole } = authSlice.actions;

export default authSlice.reducer;

