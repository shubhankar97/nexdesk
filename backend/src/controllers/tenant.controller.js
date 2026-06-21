import { asyncHandler } from '../utils/asyncHandler.js';

export const getCurrentTenant = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.tenant.toSafeObject(),
  });
});
