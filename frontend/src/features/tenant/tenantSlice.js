import { createSlice } from '@reduxjs/toolkit';
import { getTenantSubdomain } from '../../utils/subdomain.js';

const tenantSlice = createSlice({
  name: 'tenant',
  initialState: {
    subdomain: getTenantSubdomain(),
    isTenantHost: Boolean(getTenantSubdomain()),
  },
  reducers: {
    setTenantSubdomain(state, action) {
      state.subdomain = action.payload;
      state.isTenantHost = Boolean(action.payload);
    },
  },
});

export const { setTenantSubdomain } = tenantSlice.actions;
export default tenantSlice.reducer;
