import { useCallback, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import CertificateVersionsDialog from '../../components/features/orders/CertificateVersionsDialog.jsx';
import OrderFormDialog from '../../components/features/orders/OrderFormDialog.jsx';
import OrdersTable from '../../components/features/orders/OrdersTable.jsx';
import UploadCertificateDialog from '../../components/features/orders/UploadCertificateDialog.jsx';
import ConfirmDialog from '../../components/master/ConfirmDialog.jsx';
import {
  clearCertificateVersions,
  createOrder,
  fetchCertificateVersions,
  fetchOrderCustomers,
  fetchOrders,
  removeOrder,
  selectCertificateVersions,
  selectCertificateVersionsLoading,
  selectOrderCustomers,
  selectOrderCustomersLoading,
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
  selectOrdersSaving,
  updateOrder,
  uploadOrderCertificate,
} from '../../features/orders/index.js';
import * as orderService from '../../services/order.service.js';
import { useAppDispatch } from '../../hooks/useAppDispatch.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { toDateInputValue } from '../../utils/order.js';

const emptyForm = {
  certificateName: '',
  issueDate: '',
  validity: '',
  nextRenewal: '',
  customer: '',
};

const emptyUploadForm = {
  fileName: '',
  fileUrl: '',
};

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const saving = useAppSelector(selectOrdersSaving);
  const error = useAppSelector(selectOrdersError);
  const customers = useAppSelector(selectOrderCustomers);
  const customersLoading = useAppSelector(selectOrderCustomersLoading);
  const versions = useAppSelector(selectCertificateVersions);
  const versionsLoading = useAppSelector(selectCertificateVersionsLoading);

  const [formOpen, setFormOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchOrderCustomers());
  }, [dispatch]);

  const openCreateDialog = () => {
    setEditingOrder(null);
    setForm(emptyForm);
    setFormError('');
    dispatch(fetchOrderCustomers());
    setFormOpen(true);
  };

  const openEditDialog = (order) => {
    setEditingOrder(order);
    setForm({
      certificateName: order.certificateName,
      issueDate: toDateInputValue(order.issueDate),
      validity: toDateInputValue(order.validity),
      nextRenewal: toDateInputValue(order.nextRenewal),
      customer: order.customer?.id || order.customer || '',
    });
    setFormError('');
    dispatch(fetchOrderCustomers());
    setFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleUploadChange = (field, value) => {
    setUploadForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveOrder = async () => {
    setFormError('');

    if (!form.certificateName.trim() || !form.issueDate || !form.validity || !form.nextRenewal || !form.customer) {
      setFormError('All fields are required.');
      return;
    }

    const payload = {
      certificateName: form.certificateName.trim(),
      issueDate: form.issueDate,
      validity: form.validity,
      nextRenewal: form.nextRenewal,
      customer: form.customer,
    };

    try {
      if (editingOrder) {
        await dispatch(updateOrder({ id: editingOrder.id, payload })).unwrap();
      } else {
        await dispatch(createOrder(payload)).unwrap();
      }

      setFormOpen(false);
    } catch (err) {
      setFormError(typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to save order.'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await dispatch(removeOrder(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete order.'));
      setDeleteTarget(null);
    }
  };

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

  const openUploadDialog = (order) => {
    setActiveOrder(order);
    setUploadForm(emptyUploadForm);
    setUploadError('');
    setUploadOpen(true);
  };

  const handleUpload = async () => {
    setUploadError('');

    if (!uploadForm.fileName.trim() || !uploadForm.fileUrl.trim()) {
      setUploadError('File name and URL are required.');
      return;
    }

    try {
      await dispatch(
        uploadOrderCertificate({
          id: activeOrder.id,
          payload: {
            fileName: uploadForm.fileName.trim(),
            fileUrl: uploadForm.fileUrl.trim(),
          },
        })
      ).unwrap();

      setUploadOpen(false);
    } catch (err) {
      setUploadError(typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to upload certificate.'));
    }
  };

  const openVersionsDialog = async (order) => {
    setActiveOrder(order);
    setVersionsOpen(true);
    dispatch(fetchCertificateVersions(order.id));
  };

  const closeVersionsDialog = () => {
    setVersionsOpen(false);
    dispatch(clearCertificateVersions());
  };

  return (
    <AdminPage title="Orders" description="View and manage customer certificate orders.">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Order
        </Button>
      </Box>

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
        showAdminActions
        onEdit={openEditDialog}
        onDelete={setDeleteTarget}
        onDownload={handleDownload}
        onUpload={openUploadDialog}
        onViewVersions={openVersionsDialog}
      />

      <OrderFormDialog
        open={formOpen}
        title={editingOrder ? 'Edit Order' : 'Add Order'}
        form={form}
        customers={customers}
        customersLoading={customersLoading}
        saving={saving}
        error={formError}
        onClose={() => setFormOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSaveOrder}
      />

      <UploadCertificateDialog
        open={uploadOpen}
        form={uploadForm}
        saving={saving}
        error={uploadError}
        onClose={() => setUploadOpen(false)}
        onChange={handleUploadChange}
        onSubmit={handleUpload}
      />

      <CertificateVersionsDialog
        open={versionsOpen}
        orderName={activeOrder?.certificateName}
        versions={versions}
        loading={versionsLoading}
        onClose={closeVersionsDialog}
        onDownload={(version) => window.open(version.fileUrl, '_blank', 'noopener,noreferrer')}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Order"
        message={`Delete "${deleteTarget?.certificateName}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default OrdersPage;
