import { Router } from 'express';
import * as planController from '../../controllers/plan.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePlatformHost } from '../../middleware/tenant.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

const masterAuth = [requirePlatformHost, authenticate, authorize(ROLES.MASTER)];

router.get('/', ...masterAuth, planController.listPlans);
router.post('/', ...masterAuth, planController.createPlan);
router.get('/:planId', ...masterAuth, planController.getPlan);
router.patch('/:planId', ...masterAuth, planController.updatePlan);
router.post('/:planId/assign', ...masterAuth, planController.assignPlanToTenant);

export default router;
