import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/index.js';
import { ordersReducer } from '../features/orders/index.js';
import { tenantReducer } from '../features/tenant/index.js';

const rootReducer = combineReducers({
  auth: authReducer,
  tenant: tenantReducer,
  orders: ordersReducer,
});

export default rootReducer;
