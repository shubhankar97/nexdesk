import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { bindTenantContext, resolveTenant } from './middleware/tenant.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(resolveTenant);
app.use(bindTenantContext);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
