import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import tenantRoutes from './tenant.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/tenant', tenantRoutes);
router.use('/auth', authRoutes);

export default router;
