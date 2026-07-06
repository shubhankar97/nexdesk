import mongoose from 'mongoose';
import { env } from './env.js';
import { registerPlatformModels } from '../database/platformModels.js';
import { clearTenantModelCache } from '../database/tenantConnection.js';

let platformConnection = null;

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  platformConnection = mongoose.createConnection(env.mongodbUri);
  await platformConnection.asPromise();
  registerPlatformModels(platformConnection);

  console.log('MongoDB connected (nexdesk)');
};

export const getPlatformConnection = () => {
  if (!platformConnection) {
    throw new Error('Platform database is not connected');
  }

  return platformConnection;
};

export const disconnectDatabase = async () => {
  clearTenantModelCache();

  if (platformConnection) {
    await platformConnection.close();
    platformConnection = null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

export { getPlatformModels } from '../database/platformModels.js';
export {
  getTenantModelsForTenant,
  provisionTenantCollections,
  getTenantModelCacheCount,
} from '../database/tenantConnection.js';
