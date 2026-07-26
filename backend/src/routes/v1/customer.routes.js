import { Router } from 'express';
import * as customerController from '../../controllers/customer.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/moduleAccess.js';
import {
  enforceTenantAccess,
  requireActiveTenant,
  requirePlatformHost,
  requireTenant,
} from '../../middleware/tenant.js';
import { MODULES } from '../../constants/modules.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

const adminAuth = [
  requireTenant,
  requireActiveTenant,
  authenticate,
  enforceTenantAccess,
  authorize(ROLES.ADMIN),
  requireModule(MODULES.CUSTOMERS),
];

const masterAuth = [requirePlatformHost, authenticate, authorize(ROLES.MASTER)];

router.get('/all', ...masterAuth, customerController.listAllCustomers);
router.patch('/:tenantId/:customerId', ...masterAuth, customerController.updateCustomerForMaster);
router.delete('/:tenantId/:customerId', ...masterAuth, customerController.deleteCustomerForMaster);

router.get('/', ...adminAuth, customerController.listCustomers);
router.post('/', ...adminAuth, customerController.createCustomer);
router.patch('/:id', ...adminAuth, customerController.updateCustomer);
router.delete('/:id', ...adminAuth, customerController.deleteCustomer);

export default router;
