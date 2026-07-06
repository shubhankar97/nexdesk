import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import OrderStatusChip from './OrderStatusChip.jsx';
import { formatOrderDate } from '../../../utils/order.js';

const OrdersTable = ({
  orders,
  loading,
  showCustomer = true,
  showAdminActions = false,
  onEdit,
  onDelete,
  onDownload,
  onUpload,
  onViewVersions,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!orders.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No orders found.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Certificate Name</TableCell>
            <TableCell>Issue Date</TableCell>
            <TableCell>Validity</TableCell>
            <TableCell>Next Renewal</TableCell>
            <TableCell>Status</TableCell>
            {showCustomer && <TableCell>Customer</TableCell>}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>{order.certificateName}</TableCell>
              <TableCell>{formatOrderDate(order.issueDate)}</TableCell>
              <TableCell>{formatOrderDate(order.validity)}</TableCell>
              <TableCell>{formatOrderDate(order.nextRenewal)}</TableCell>
              <TableCell>
                <OrderStatusChip status={order.status} />
              </TableCell>
              {showCustomer && (
                <TableCell>{order.customer?.email || '—'}</TableCell>
              )}
              <TableCell align="right">
                <Tooltip title="Download Certificate">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onDownload(order)}
                      disabled={!order.currentCertificate?.fileUrl}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {showAdminActions && (
                  <>
                    <Tooltip title="Upload Certificate">
                      <IconButton size="small" onClick={() => onUpload(order)}>
                        <UploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Older Versions">
                      <IconButton size="small" onClick={() => onViewVersions(order)}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(order)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(order)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {!showAdminActions && (
                  <Tooltip title="Older Versions">
                    <IconButton size="small" onClick={() => onViewVersions(order)}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdersTable;
