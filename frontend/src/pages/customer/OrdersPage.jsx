import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import CertificateVersionsDialog from '../../components/features/orders/CertificateVersionsDialog.jsx';
import OrdersTable from '../../components/features/orders/OrdersTable.jsx';
import {
  clearCertificateVersions,
  fetchCertificateVersions,
  fetchOrders,
  selectCertificateVersions,
  selectCertificateVersionsLoading,
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
} from '../../features/orders/index.js';
import * as orderService from '../../services/order.service.js';
import { useAppDispatch } from '../../hooks/useAppDispatch.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const versions = useAppSelector(selectCertificateVersions);
  const versionsLoading = useAppSelector(selectCertificateVersionsLoading);

  const [versionsOpen, setVersionsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleDownload = useCallback(async (order) => {
    setActionError('');

    try {
      const file =
        order.currentCertificate?.fileUrl
          ? order.currentCertificate
          : await orderService.downloadCertificate(order.id);

      if (file?.fileUrl) {
        window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Certificate download failed.'));
    }
  }, []);

  const openVersionsDialog = (order) => {
    setActiveOrder(order);
    setVersionsOpen(true);
    dispatch(fetchCertificateVersions(order.id));
  };

  const closeVersionsDialog = () => {
    setVersionsOpen(false);
    dispatch(clearCertificateVersions());
  };

  return (
    <AdminPage title="Orders" description="Track and review your certificate orders.">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      <OrdersTable
        orders={orders}
        loading={loading}
        showCustomer={false}
        onDownload={handleDownload}
        onViewVersions={openVersionsDialog}
      />

      <CertificateVersionsDialog
        open={versionsOpen}
        orderName={activeOrder?.certificateName}
        versions={versions}
        loading={versionsLoading}
        onClose={closeVersionsDialog}
        onDownload={(version) => window.open(version.fileUrl, '_blank', 'noopener,noreferrer')}
      />
    </AdminPage>
  );
};

export default OrdersPage;
