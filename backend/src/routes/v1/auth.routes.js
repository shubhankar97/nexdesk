import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import {
  enforceTenantAccess,
  requirePlatformHost,
  requireTenant,
} from '../../middleware/tenant.js';

const router = Router();

router.post('/master/login', requirePlatformHost, authController.loginMaster);
router.post('/admin/login', requireTenant, authController.loginAdmin);
router.post('/customer/login', requireTenant, authController.loginCustomer);

router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', requireTenant, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/logout', authenticate, enforceTenantAccess, authController.logout);
router.get('/me', authenticate, enforceTenantAccess, authController.getMe);

export default router;
