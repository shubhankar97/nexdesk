import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatOrderDate } from '../../../utils/order.js';

const CertificateVersionsDialog = ({
  open,
  orderName,
  versions,
  loading,
  onClose,
  onDownload,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Certificate Versions — {orderName}</DialogTitle>
    <DialogContent>
      {loading ? (
        <CircularProgress size={24} />
      ) : versions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No older certificate versions found.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>{version.fileName}</TableCell>
                  <TableCell>{formatOrderDate(version.uploadedAt)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => onDownload(version)}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default CertificateVersionsDialog;
