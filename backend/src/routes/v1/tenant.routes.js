import { Router } from 'express';
import * as tenantController from '../../controllers/tenant.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  enforceTenantAccess,
  requireActiveTenant,
  requirePlatformHost,
  requireTenant,
} from '../../middleware/tenant.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

const masterAuth = [requirePlatformHost, authenticate, authorize(ROLES.MASTER)];

router.get('/current', requireTenant, requireActiveTenant, tenantController.getCurrentTenant);

router.get('/', ...masterAuth, tenantController.listTenants);
router.post('/', ...masterAuth, tenantController.createTenant);
router.get('/:tenantId', ...masterAuth, tenantController.getTenant);
router.patch('/:tenantId', ...masterAuth, tenantController.updateTenant);
router.delete('/:tenantId', ...masterAuth, tenantController.deleteTenant);

export default router;
