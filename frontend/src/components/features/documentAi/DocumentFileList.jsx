import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ReplayIcon from '@mui/icons-material/Replay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { formatFileSize, getDocumentStatusColor } from '../../../constants/document.js';
import { getParseStatusColor } from '../../../constants/invoice.js';

const ExportMenuButton = ({ doc, disabled, onExport }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Tooltip title="Re-export invoice">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onExport(doc, 'csv');
          }}
        >
          Re-export CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onExport(doc, 'xlsx');
          }}
        >
          Re-export Excel
        </MenuItem>
      </Menu>
    </>
  );
};

const DocumentFileList = ({
  documents,
  loading,
  processingIds = [],
  parsingIds = [],
  canViewDetails = false,
  onDelete,
  onViewDocument,
  onViewText,
  onRetryOcr,
  onParseInvoice,
  onExportDocument,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!documents?.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        No documents match your search or filters.
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>File</TableCell>
            <TableCell>Invoice #</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>OCR</TableCell>
            <TableCell>Parse</TableCell>
            <TableCell>Uploaded</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => {
            const isProcessing = processingIds.includes(doc.id) || doc.status === 'processing';
            const isParsing = parsingIds.includes(doc.id);
            const canExport = ['valid', 'partial'].includes(doc.parseStatus);

            return (
              <TableRow key={doc.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsertDriveFileIcon fontSize="small" color="action" />
                    <Box>
                      <Typography
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => onViewDocument(doc)}
                        sx={{
                          p: 0,
                          border: 0,
                          background: 'none',
                          color: 'primary.main',
                          cursor: 'pointer',
                          font: 'inherit',
                          textAlign: 'left',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                          '&:hover': { color: 'primary.dark' },
                        }}
                      >
                        {doc.originalName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(doc.size)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{doc.invoiceNumber || '—'}</TableCell>
                <TableCell>{doc.vendorName || '—'}</TableCell>
                <TableCell>
                  {doc.invoiceTotal != null
                    ? `${doc.invoiceCurrency ? `${doc.invoiceCurrency} ` : ''}${doc.invoiceTotal}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={doc.status}
                    size="small"
                    color={getDocumentStatusColor(doc.status)}
                    variant={doc.status === 'ready' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={doc.parseStatus || 'pending'}
                    size="small"
                    color={getParseStatusColor(doc.parseStatus)}
                    variant={doc.parseStatus === 'valid' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'}
                </TableCell>
                <TableCell align="right">
                  {canViewDetails && (
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => onViewText(doc)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Run OCR + parse">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onRetryOcr(doc)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <CircularProgress size={16} />
                        ) : (
                          <ReplayIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Re-parse invoice JSON">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onParseInvoice(doc)}
                        disabled={isParsing || doc.status !== 'ready'}
                      >
                        {isParsing ? (
                          <CircularProgress size={16} />
                        ) : (
                          <AccountTreeIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <ExportMenuButton
                    doc={doc}
                    disabled={!canExport}
                    onExport={onExportDocument}
                  />
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(doc)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentFileList;
