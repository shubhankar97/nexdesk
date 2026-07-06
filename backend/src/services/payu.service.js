import crypto from 'crypto';
import { createRequire } from 'module';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const require = createRequire(import.meta.url);

let payuClient = null;

export const isPayuConfigured = () =>
  Boolean(env.payuMerchantKey && env.payuMerchantSalt);

const getPayuClient = () => {
  if (!isPayuConfigured()) {
    throw new ApiError(503, 'PayU is not configured');
  }

  if (!payuClient) {
    const PayU = require('payu-websdk');
    payuClient = new PayU(
      {
        key: env.payuMerchantKey,
        salt: env.payuMerchantSalt,
      },
      env.payuEnvironment
    );
  }

  return payuClient;
};

export const getPaymentUrl = () =>
  env.payuEnvironment === 'PROD'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

export const formatAmount = (amountInPaise) => (amountInPaise / 100).toFixed(2);

export const generateTxnId = (tenantId) =>
  `ND${tenantId.replace(/-/g, '').slice(0, 8)}${Date.now()}`;

const hashSha512 = (value) =>
  crypto.createHash('sha512').update(value).digest('hex');

export const buildRequestHash = ({
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
  siDetails = '',
}) => {
  const hashString = [
    env.payuMerchantKey,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    '',
    '',
    '',
    '',
    '',
    siDetails,
    env.payuMerchantSalt,
  ].join('|');

  return hashSha512(hashString);
};

export const verifyResponseHash = (payload) => {
  const {
    status,
    udf5 = '',
    udf4 = '',
    udf3 = '',
    udf2 = '',
    udf1 = '',
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
    hash,
  } = payload;

  if (!hash) {
    return false;
  }

  const hashString = [
    env.payuMerchantSalt,
    status,
    '',
    '',
    '',
    '',
    '',
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ].join('|');

  return hashSha512(hashString) === hash;
};

const formatPayuDate = (date) => date.toISOString().slice(0, 10);

const buildSiDetails = (plan, amount) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 10);

  return JSON.stringify({
    billingAmount: amount,
    billingCurrency: plan.currency || 'INR',
    billingCycle: plan.interval === 'yearly' ? 'YEARLY' : 'MONTHLY',
    billingInterval: 1,
    paymentStartDate: formatPayuDate(startDate),
    paymentEndDate: formatPayuDate(endDate),
  });
};

export const buildSubscriptionCheckout = ({ tenant, plan, email, phone }) => {
  if (!isPayuConfigured()) {
    throw new ApiError(503, 'PayU is not configured');
  }

  const amount = formatAmount(plan.price);
  const txnid = generateTxnId(tenant.tenantId);
  const productinfo = `${plan.name} subscription`;
  const firstname = tenant.companyName.slice(0, 60);
  const siDetails = buildSiDetails(plan, amount);

  const params = {
    key: env.payuMerchantKey,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone: phone || '9999999999',
    surl: env.payuSuccessUrl,
    furl: env.payuFailureUrl,
    udf1: tenant.tenantId,
    udf2: plan.planId,
    udf3: tenant.subdomain,
    si: '1',
    api_version: '7',
    si_details: siDetails,
  };

  params.hash = buildRequestHash({
    ...params,
    siDetails,
  });

  return {
    txnid,
    paymentUrl: getPaymentUrl(),
    params,
  };
};

export const verifyPayment = async (txnid) => {
  const client = getPayuClient();
  return client.verifyPayment(txnid);
};
