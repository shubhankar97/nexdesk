import { useCallback, useEffect, useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import DocumentDropzone from './DocumentDropzone.jsx';
import DocumentFileList from './DocumentFileList.jsx';
import DocumentHistoryFilters from './DocumentHistoryFilters.jsx';
import DocumentAiUsageCard from './DocumentAiUsageCard.jsx';
import OcrResultDialog from './OcrResultDialog.jsx';
import UploadProgressList from './UploadProgressList.jsx';
import { isOcrPendingStatus } from '../../../constants/document.js';
import { ROLES } from '../../../constants/roles.js';
import { useAuth } from '../../../hooks/useAuth.js';
import * as documentService from '../../../services/document.service.js';

const EMPTY_FILTERS = {
  search: '',
  status: '',
  parseStatus: '',
  dateFrom: '',
  dateTo: '',
};

const createUploadItem = (file) => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
  name: file.name,
  size: file.size,
  progress: 0,
  status: 'queued',
  error: '',
  file,
});

const DocumentAiUploadPanel = ({ tenantSubdomain, disabled = false, emptyHint }) => {
  const { user } = useAuth();
  const canViewDetails = user?.role === ROLES.MASTER;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [parsingIds, setParsingIds] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search.trim()), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status,
      parseStatus: filters.parseStatus,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [debouncedSearch, filters.status, filters.parseStatus, filters.dateFrom, filters.dateTo]
  );

  const loadUsage = useCallback(async () => {
    if (disabled) {
      setUsage(null);
      return;
    }

    setUsageLoading(true);

    try {
      const data = await documentService.getDocumentAiUsage({ tenantSubdomain });
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  }, [disabled, tenantSubdomain]);

  const loadDocuments = useCallback(async () => {
    if (disabled) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await documentService.listDocuments({
        tenantSubdomain,
        ...queryFilters,
      });
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [disabled, tenantSubdomain, queryFilters]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const hasPendingOcr = useMemo(
    () => documents.some((doc) => isOcrPendingStatus(doc.status)),
    [documents]
  );

  useEffect(() => {
    if (disabled || !hasPendingOcr) {
      return undefined;
    }

    const timer = setInterval(async () => {
      try {
        const data = await documentService.listDocuments({
          tenantSubdomain,
          ...queryFilters,
        });
        setDocuments(data);
      } catch {
        // Keep polling silently.
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [disabled, hasPendingOcr, tenantSubdomain, queryFilters]);

  const updateUpload = (id, patch) => {
    setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleFilesSelected = async (files) => {
    if (disabled || uploading) {
      return;
    }

    const items = files.map(createUploadItem);
    setUploads(items);
    setUploading(true);
    setError('');

    for (const item of items) {
      updateUpload(item.id, { status: 'uploading', progress: 0 });

      try {
        await documentService.uploadDocument(item.file, {
          tenantSubdomain,
          onUploadProgress: (event) => {
            if (!event.total) {
              return;
            }

            const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
            updateUpload(item.id, { progress, status: 'uploading' });
          },
        });

        updateUpload(item.id, { status: 'done', progress: 100 });
      } catch (err) {
        updateUpload(item.id, {
          status: 'error',
          error: err.response?.data?.message || 'Upload failed.',
        });
      }
    }

    setUploading(false);
    await Promise.all([loadDocuments(), loadUsage()]);
  };

  const handleDelete = async (doc) => {
    try {
      await documentService.deleteDocument(doc.id, { tenantSubdomain });
      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const handleViewText = async (doc) => {
    setSelectedDoc(doc);
    setDetailLoading(true);
    setError('');

    try {
      const detail = await documentService.getDocument(doc.id, { tenantSubdomain });
      setSelectedDoc(detail);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load document.');
      setSelectedDoc(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDocument = async (doc) => {
    setError('');

    try {
      await documentService.viewDocument(doc.id, { tenantSubdomain });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open document.');
    }
  };

  const handleRetryOcr = async (doc) => {
    setProcessingIds((prev) => [...prev, doc.id]);
    setError('');

    try {
      const updated = await documentService.processDocumentOcr(doc.id, { tenantSubdomain });
      setDocuments((prev) => prev.map((item) => (item.id === doc.id ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'OCR failed.');
      await loadDocuments();
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== doc.id));
    }
  };

  const handleParseInvoice = async (doc) => {
    setParsingIds((prev) => [...prev, doc.id]);
    setError('');

    try {
      const updated = await documentService.parseDocumentInvoice(doc.id, { tenantSubdomain });
      setDocuments((prev) => prev.map((item) => (item.id === doc.id ? { ...item, ...updated } : item)));
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(updated);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invoice parse failed.');
      await loadDocuments();
    } finally {
      setParsingIds((prev) => prev.filter((id) => id !== doc.id));
    }
  };

  const handleExportAll = async (format) => {
    setExporting(true);
    setError('');

    try {
      await documentService.exportDocuments(format, {
        tenantSubdomain,
        ...queryFilters,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportDocument = async (doc, format) => {
    setExporting(true);
    setError('');

    try {
      await documentService.exportDocument(doc.id, format, { tenantSubdomain });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const canExportAny = useMemo(
    () => documents.some((doc) => ['valid', 'partial'].includes(doc.parseStatus)),
    [documents]
  );

  const uploadBlocked = useMemo(() => {
    if (!usage) {
      return false;
    }

    if (!usage.access?.allowed) {
      return true;
    }

    return !usage.uploads?.unlimited && usage.uploads?.remaining === 0;
  }, [usage]);

  return (
    <Box>
      {emptyHint && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {emptyHint}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <DocumentAiUsageCard usage={usage} loading={usageLoading} />

      <DocumentDropzone
        disabled={disabled || uploading || uploadBlocked}
        onFilesSelected={handleFilesSelected}
      />
      <UploadProgressList items={uploads} />

      <Box
        sx={{
          mt: 4,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Document history
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={disabled || exporting || !canExportAny}
            onClick={() => handleExportAll('csv')}
          >
            Re-export CSV
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={disabled || exporting || !canExportAny}
            onClick={() => handleExportAll('xlsx')}
          >
            Re-export Excel
          </Button>
        </Stack>
      </Box>

      <DocumentHistoryFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        disabled={disabled}
      />

      <DocumentFileList
        documents={documents}
        loading={loading}
        processingIds={processingIds}
        parsingIds={parsingIds}
        canViewDetails={canViewDetails}
        onDelete={handleDelete}
        onViewDocument={handleViewDocument}
        onViewText={handleViewText}
        onRetryOcr={handleRetryOcr}
        onParseInvoice={handleParseInvoice}
        onExportDocument={handleExportDocument}
      />

      {canViewDetails && (
        <OcrResultDialog
          open={Boolean(selectedDoc) || detailLoading}
          document={selectedDoc}
          loading={detailLoading}
          exporting={exporting}
          onClose={() => setSelectedDoc(null)}
          onReExport={handleExportDocument}
        />
      )}
    </Box>
  );
};

export default DocumentAiUploadPanel;
