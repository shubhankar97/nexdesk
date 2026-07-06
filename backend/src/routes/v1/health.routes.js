import { Router } from 'express';
import { getPlatformConnection } from '../../config/database.js';
import { getTenantModelCacheCount } from '../../database/tenantConnection.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const platformState = getPlatformConnection().readyState;
    const platformStatus = platformState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        platform: platformStatus,
        tenantCollections: getTenantModelCacheCount(),
      },
    });
  })
);

export default router;
