import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';
import documentRoutes from './document.routes.js';
import healthRoutes from './health.routes.js';
import orderRoutes from './order.routes.js';
import planRoutes from './plan.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import tenantRoutes from './tenant.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/tenant', tenantRoutes);
router.use('/auth', authRoutes);
router.use('/admins', adminRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/documents', documentRoutes);
router.use('/plans', planRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;
