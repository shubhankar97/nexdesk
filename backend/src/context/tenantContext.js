import { AsyncLocalStorage } from 'async_hooks';

const tenantStorage = new AsyncLocalStorage();

export const getTenantContext = () => tenantStorage.getStore() ?? null;

export const getTenantId = () => getTenantContext()?.tenantId ?? null;

export const getTenant = () => getTenantContext()?.tenant ?? null;

export const getTenantModels = () => getTenantContext()?.models ?? null;

export const getTenantConnection = () => getTenantContext()?.connection ?? null;

export const runWithTenantContext = (context, fn) => tenantStorage.run(context, fn);

export const runWithoutTenantScope = (fn) => tenantStorage.run(null, fn);
