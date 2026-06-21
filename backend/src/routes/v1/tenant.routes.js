import { Router } from 'express';
import { getCurrentTenant } from '../../controllers/tenant.controller.js';
import { requireTenant } from '../../middleware/tenant.js';

const router = Router();

router.get('/current', requireTenant, getCurrentTenant);

export default router;
