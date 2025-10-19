import { RootState } from '../store';

// Roles selectors for easy access to roles state
export const selectRoles = (state: RootState) => state.roles;
export const selectAllRoles = (state: RootState) => state.roles.roles;
export const selectSelectedRole = (state: RootState) => state.roles.selectedRole;
export const selectRolesLoading = (state: RootState) => state.roles.isLoading;
export const selectRolesError = (state: RootState) => state.roles.error;
export const selectActiveRoles = (state: RootState) =>
  state.roles.roles.filter((role) => role.is_active);

