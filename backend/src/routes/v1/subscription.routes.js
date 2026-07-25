import { Router } from 'express';
import * as subscriptionController from '../../controllers/subscription.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/moduleAccess.js';
import { enforceTenantAccess, requireTenant } from '../../middleware/tenant.js';
import { MODULES } from '../../constants/modules.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

const tenantAuth = [requireTenant, authenticate, enforceTenantAccess];

router.get('/plans', requireTenant, subscriptionController.listAvailablePlans);
router.get('/current', ...tenantAuth, subscriptionController.getSubscription);
router.post(
  '/checkout',
  ...tenantAuth,
  authorize(ROLES.ADMIN),
  requireModule(MODULES.SETTINGS),
  subscriptionController.createCheckout
);

export default router;
