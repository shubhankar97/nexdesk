import { Router } from 'express';
import * as orderController from '../../controllers/order.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/moduleAccess.js';
import { enforceTenantAccess, requireActiveTenant, requireTenant } from '../../middleware/tenant.js';
import { MODULES } from '../../constants/modules.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

const tenantAuth = [
  requireTenant,
  requireActiveTenant,
  authenticate,
  enforceTenantAccess,
  requireModule(MODULES.ORDERS),
];

router.get(
  '/customers',
  ...tenantAuth,
  authorize(ROLES.ADMIN),
  orderController.listOrderCustomers
);

router.get(
  '/',
  ...tenantAuth,
  authorize(ROLES.ADMIN, ROLES.CUSTOMER),
  orderController.listOrders
);

router.post(
  '/',
  ...tenantAuth,
  authorize(ROLES.ADMIN),
  orderController.createOrder
);

router.get(
  '/:id/certificate/versions',
  ...tenantAuth,
  authorize(ROLES.ADMIN, ROLES.CUSTOMER),
  orderController.getCertificateVersions
);

router.get(
  '/:id/certificate',
  ...tenantAuth,
  authorize(ROLES.ADMIN, ROLES.CUSTOMER),
  orderController.downloadCertificate
);

router.post(
  '/:id/certificate',
  ...tenantAuth,
  authorize(ROLES.ADMIN),
  orderController.uploadCertificate
);

router.get(
  '/:id',
  ...tenantAuth,
  authorize(ROLES.ADMIN, ROLES.CUSTOMER),
  orderController.getOrder
);

router.patch(
  '/:id',
  ...tenantAuth,
  authorize(ROLES.ADMIN),
  orderController.updateOrder
);

router.delete(
  '/:id',
  ...tenantAuth,
  authorize(ROLES.ADMIN),
  orderController.deleteOrder
);

export default router;
