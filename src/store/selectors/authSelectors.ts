import { RootState } from '../store';

// Auth selectors for easy access to auth state
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentAdmin = (state: RootState) => state.auth.admin;
export const selectToken = (state: RootState) => state.auth.token;
export const selectRolePermissions = (state: RootState) => state.auth.rolePermissions;

