import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePlatformHost } from '../../middleware/tenant.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

const masterAuth = [requirePlatformHost, authenticate, authorize(ROLES.MASTER)];

router.get('/', ...masterAuth, adminController.listAdmins);
router.post('/', ...masterAuth, adminController.createAdmin);
router.patch('/:tenantId/:adminId', ...masterAuth, adminController.updateAdmin);
router.delete('/:tenantId/:adminId', ...masterAuth, adminController.deleteAdmin);

export default router;
