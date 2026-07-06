import { Router } from 'express';
import { getCurrentTenant } from '../../controllers/tenant.controller.js';
import { requireActiveTenant, requireTenant } from '../../middleware/tenant.js';

const router = Router();

router.get('/current', requireTenant, requireActiveTenant, getCurrentTenant);

export default router;
