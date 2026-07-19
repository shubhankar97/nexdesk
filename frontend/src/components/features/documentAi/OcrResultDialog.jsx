import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

const PreBlock = ({ children }) => (
  <Box
    component="pre"
    sx={{
      m: 0,
      p: 2,
      bgcolor: 'action.hover',
      borderRadius: 1,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: 13,
      maxHeight: 420,
      overflow: 'auto',
    }}
  >
    {children}
  </Box>
);

const OcrResultDialog = ({
  open,
  document,
  loading,
  onClose,
  onReExport,
  exporting = false,
}) => {
  const [tab, setTab] = useState(0);
  const canExport = ['valid', 'partial'].includes(document?.parseStatus);

  useEffect(() => {
    if (open) {
      setTab(document?.parsedInvoice ? 1 : 0);
    }
  }, [open, document?.id, document?.parsedInvoice]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{document?.originalName || 'Document result'}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {[
                document?.invoiceNumber ? `Invoice: ${document.invoiceNumber}` : null,
                document?.vendorName ? `Vendor: ${document.vendorName}` : null,
                document?.ocrSource ? `OCR: ${document.ocrSource}` : null,
                document?.parseStatus ? `Parse: ${document.parseStatus}` : null,
                document?.pageCount != null ? `Pages: ${document.pageCount}` : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'No metadata'}
            </Typography>

            {document?.parseErrors?.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {document.parseErrors.join(' · ')}
              </Alert>
            )}

            {document?.ocrError && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {document.ocrError}
              </Typography>
            )}

            <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
              <Tab label="Extracted text" />
              <Tab label="Invoice JSON" />
            </Tabs>

            {tab === 0 ? (
              <PreBlock>
                {document?.extractedText?.trim()
                  ? document.extractedText
                  : 'No text extracted yet.'}
              </PreBlock>
            ) : (
              <PreBlock>
                {document?.parsedInvoice
                  ? JSON.stringify(document.parsedInvoice, null, 2)
                  : 'No parsed invoice JSON yet. Run OCR/parse first.'}
              </PreBlock>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          disabled={!canExport || exporting || loading || !document}
          onClick={() => onReExport?.(document, 'csv')}
        >
          Re-export CSV
        </Button>
        <Button
          variant="outlined"
          disabled={!canExport || exporting || loading || !document}
          onClick={() => onReExport?.(document, 'xlsx')}
        >
          Re-export Excel
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OcrResultDialog;
