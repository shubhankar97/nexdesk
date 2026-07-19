import { Router } from 'express';
import * as documentController from '../../controllers/document.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { allowMasterTenantOverride } from '../../middleware/masterTenant.js';
import { requireModule } from '../../middleware/moduleAccess.js';
import {
  enforceTenantAccess,
  rebindTenantContext,
  requireActiveTenant,
  requireTenant,
} from '../../middleware/tenant.js';
import { documentUpload, handleUploadErrors } from '../../middleware/upload.js';
import { MODULES } from '../../constants/modules.js';
import { ROLES } from '../../constants/roles.js';
import { DOCUMENT_MAX_FILES } from '../../constants/document.js';

const router = Router();

const documentAuth = [
  authenticate,
  allowMasterTenantOverride,
  requireTenant,
  requireActiveTenant,
  enforceTenantAccess,
  requireModule(MODULES.DOCUMENT_AI),
  authorize(ROLES.ADMIN, ROLES.MASTER),
];

router.get('/', ...documentAuth, documentController.listDocuments);

router.get('/usage', ...documentAuth, documentController.getDocumentAiUsage);

router.get('/export', ...documentAuth, documentController.exportDocuments);

router.post(
  '/upload',
  ...documentAuth,
  documentUpload.array('files', DOCUMENT_MAX_FILES),
  handleUploadErrors,
  rebindTenantContext,
  documentController.uploadDocuments
);

router.get('/:id', ...documentAuth, documentController.getDocument);

router.post('/:id/ocr', ...documentAuth, documentController.processDocumentOcr);

router.post('/:id/parse', ...documentAuth, documentController.parseDocumentInvoice);

router.get('/:id/export', ...documentAuth, documentController.exportDocument);

router.get('/:id/download', ...documentAuth, documentController.downloadDocument);

router.delete('/:id', ...documentAuth, documentController.deleteDocument);

export default router;
