import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { TENANT_HEADER } from './constants/tenant.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { bindTenantContext, resolveTenant } from './middleware/tenant.js';
import { handlePayuPaymentWebhook, handlePayuZionWebhook } from './controllers/webhook.controller.js';
import routes from './routes/index.js';
import { isAllowedCorsOrigin } from './utils/cors.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', TENANT_HEADER],
  })
);

app.post(
  '/api/v1/webhooks/payu/payment',
  express.urlencoded({ extended: true }),
  handlePayuPaymentWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/v1/webhooks/payu/zion', handlePayuZionWebhook);

app.use(resolveTenant);
app.use(bindTenantContext);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
