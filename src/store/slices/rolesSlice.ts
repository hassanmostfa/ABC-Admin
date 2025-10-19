import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../api/rolesApi';

interface RolesState {
  roles: Role[];
  selectedRole: Role | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
  isLoading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRoles, setSelectedRole, setLoading, setError } = rolesSlice.actions;

export default rolesSlice.reducer;

