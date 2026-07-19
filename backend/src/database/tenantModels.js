import { orderSchema } from '../models/schemas/order.schema.js';
import { documentSchema } from '../models/schemas/document.schema.js';
import { tenantUserSchema } from '../models/schemas/tenantUser.schema.js';
import { getTenantCollections } from '../utils/tenantCollections.js';

export const registerTenantModels = (connection, subdomain) => {
  const { users, orders, documents } = getTenantCollections(subdomain);
  const userModelName = `${subdomain}_User`;
  const orderModelName = `${subdomain}_Order`;
  const documentModelName = `${subdomain}_Document`;

  const User =
    connection.models[userModelName] ||
    connection.model(userModelName, tenantUserSchema, users);

  const Order =
    connection.models[orderModelName] ||
    connection.model(orderModelName, orderSchema, orders);

  const Document =
    connection.models[documentModelName] ||
    connection.model(documentModelName, documentSchema, documents);

  return { User, Order, Document };
};
