import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const UploadCertificateDialog = ({ open, form, saving, error, onClose, onChange, onSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Upload Certificate</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label="File Name"
        value={form.fileName}
        onChange={(event) => onChange('fileName', event.target.value)}
        required
        fullWidth
        autoFocus
      />
      <TextField
        label="File URL"
        value={form.fileUrl}
        onChange={(event) => onChange('fileUrl', event.target.value)}
        required
        fullWidth
        placeholder="https://example.com/certificate.pdf"
      />
      {error && (
        <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{error}</span>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained" disabled={saving}>
        {saving ? 'Uploading...' : 'Upload'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default UploadCertificateDialog;
