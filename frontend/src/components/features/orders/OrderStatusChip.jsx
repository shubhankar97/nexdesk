import { Chip } from '@mui/material';
import { ORDER_STATUS_COLORS } from '../../../constants/order.js';

const OrderStatusChip = ({ status }) => (
  <Chip
    label={status}
    size="small"
    color={ORDER_STATUS_COLORS[status] || 'default'}
    variant="outlined"
  />
);

export default OrderStatusChip;
