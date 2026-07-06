import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as orderService from '../../services/order.service.js';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (filters = {}) =>
  orderService.listOrders(filters)
);

export const fetchOrderCustomers = createAsyncThunk('orders/fetchOrderCustomers', async () =>
  orderService.listOrderCustomers()
);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create order'));
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrder(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update order'));
    }
  }
);

export const removeOrder = createAsyncThunk('orders/removeOrder', async (id, { rejectWithValue }) => {
  try {
    await orderService.deleteOrder(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to delete order'));
  }
});

export const uploadOrderCertificate = createAsyncThunk(
  'orders/uploadOrderCertificate',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await orderService.uploadCertificate(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to upload certificate'));
    }
  }
);

export const fetchCertificateVersions = createAsyncThunk(
  'orders/fetchCertificateVersions',
  async (orderId) => orderService.getCertificateVersions(orderId)
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    customers: [],
    versions: [],
    versionsOrderId: null,
    loading: false,
    customersLoading: false,
    versionsLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearOrdersError(state) {
      state.error = null;
    },
    clearCertificateVersions(state) {
      state.versions = [];
      state.versionsOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load orders';
      })
      .addCase(fetchOrderCustomers.pending, (state) => {
        state.customersLoading = true;
      })
      .addCase(fetchOrderCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customers = action.payload.map((customer) => ({
          ...customer,
          id: String(customer.id),
        }));
      })
      .addCase(fetchOrderCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.customers = [];
        state.error = action.error.message || 'Failed to load customers';
      })
      .addCase(createOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.saving = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error.message || 'Failed to create order';
      })
      .addCase(updateOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error.message || 'Failed to update order';
      })
      .addCase(removeOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((order) => order.id !== action.payload);
      })
      .addCase(uploadOrderCertificate.fulfilled, (state, action) => {
        state.items = state.items.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(fetchCertificateVersions.pending, (state) => {
        state.versionsLoading = true;
      })
      .addCase(fetchCertificateVersions.fulfilled, (state, action) => {
        state.versionsLoading = false;
        state.versions = action.payload;
        state.versionsOrderId = action.meta.arg;
      })
      .addCase(fetchCertificateVersions.rejected, (state) => {
        state.versionsLoading = false;
        state.versions = [];
      });
  },
});

export const { clearOrdersError, clearCertificateVersions } = ordersSlice.actions;
export default ordersSlice.reducer;
