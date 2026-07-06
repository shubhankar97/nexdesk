import { orderSchema } from '../models/schemas/order.schema.js';
import { tenantUserSchema } from '../models/schemas/tenantUser.schema.js';
import { getTenantCollections } from '../utils/tenantCollections.js';

export const registerTenantModels = (connection, subdomain) => {
  const { users, orders } = getTenantCollections(subdomain);
  const userModelName = `${subdomain}_User`;
  const orderModelName = `${subdomain}_Order`;

  const User =
    connection.models[userModelName] ||
    connection.model(userModelName, tenantUserSchema, users);

  const Order =
    connection.models[orderModelName] ||
    connection.model(orderModelName, orderSchema, orders);

  return { User, Order };
};
