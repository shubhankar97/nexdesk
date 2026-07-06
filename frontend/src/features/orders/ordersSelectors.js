export const selectOrders = (state) => state.orders.items;

export const selectOrdersLoading = (state) => state.orders.loading;

export const selectOrdersSaving = (state) => state.orders.saving;

export const selectOrdersError = (state) => state.orders.error;

export const selectOrderCustomers = (state) => state.orders.customers;

export const selectOrderCustomersLoading = (state) => state.orders.customersLoading;

export const selectCertificateVersions = (state) => state.orders.versions;

export const selectCertificateVersionsLoading = (state) => state.orders.versionsLoading;
