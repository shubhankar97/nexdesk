export const getTenantUserCollection = (subdomain) => `${subdomain}_users`;

export const getTenantOrderCollection = (subdomain) => `${subdomain}_orders`;

export const getTenantCollections = (subdomain) => ({
  users: getTenantUserCollection(subdomain),
  orders: getTenantOrderCollection(subdomain),
});
