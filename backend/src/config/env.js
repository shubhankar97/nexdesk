import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  passwordResetExpiresIn: parseInt(process.env.PASSWORD_RESET_EXPIRES_IN, 10) || 3600000,
  rootDomain: process.env.ROOT_DOMAIN || 'localhost',
  appSubdomain: process.env.APP_SUBDOMAIN || 'nexdesk',
  allowTenantHeader: process.env.ALLOW_TENANT_HEADER === 'true',
  payuMerchantKey: process.env.PAYU_MERCHANT_KEY || null,
  payuMerchantSalt: process.env.PAYU_MERCHANT_SALT || null,
  payuEnvironment:
    process.env.PAYU_ENVIRONMENT === 'PROD' || process.env.PAYU_ENVIRONMENT === 'LIVE'
      ? 'PROD'
      : 'TEST',
  payuSuccessUrl: process.env.PAYU_SUCCESS_URL || 'http://localhost:5173/billing/success',
  payuFailureUrl: process.env.PAYU_FAILURE_URL || 'http://localhost:5173/billing/failure',
  billingEmailDomain: process.env.BILLING_EMAIL_DOMAIN || 'nexdesk.local',
  ocrServiceUrl: (process.env.OCR_SERVICE_URL || 'http://127.0.0.1:5100').replace(/\/$/, ''),
};
