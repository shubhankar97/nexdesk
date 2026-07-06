import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import {
  enforceTenantAccess,
  requireActiveTenant,
  requirePlatformHost,
  requireTenant,
} from '../../middleware/tenant.js';

const router = Router();

router.post('/master/login', requirePlatformHost, authController.loginMaster);
router.post('/admin/login', requireTenant, requireActiveTenant, authController.loginAdmin);
router.post('/customer/login', requireTenant, requireActiveTenant, authController.loginCustomer);

router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', requireTenant, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/logout', authenticate, enforceTenantAccess, authController.logout);
router.get('/me', authenticate, enforceTenantAccess, authController.getMe);

export default router;
