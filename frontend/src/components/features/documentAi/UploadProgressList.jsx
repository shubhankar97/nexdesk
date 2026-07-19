import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { formatFileSize } from '../../../constants/document.js';

const statusIcon = (status) => {
  if (status === 'done') {
    return <CheckCircleIcon color="success" fontSize="small" />;
  }

  if (status === 'error') {
    return <ErrorIcon color="error" fontSize="small" />;
  }

  return null;
};

const UploadProgressList = ({ items }) => {
  if (!items?.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Upload progress
      </Typography>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem
            key={item.id}
            alignItems="flex-start"
            sx={{
              flexDirection: 'column',
              alignItems: 'stretch',
              px: 0,
              py: 1.25,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {statusIcon(item.status) && (
                <ListItemIcon sx={{ minWidth: 28 }}>{statusIcon(item.status)}</ListItemIcon>
              )}
              <ListItemText
                primary={item.name}
                secondary={
                  item.status === 'error'
                    ? item.error
                    : `${formatFileSize(item.size)}${
                        item.status === 'uploading' ? ` · ${item.progress}%` : ''
                      }${item.status === 'done' ? ' · Uploaded' : ''}`
                }
                sx={{ my: 0 }}
              />
            </Box>
            {(item.status === 'queued' || item.status === 'uploading') && (
              <LinearProgress
                variant={item.status === 'uploading' ? 'determinate' : 'indeterminate'}
                value={item.progress}
                sx={{ mt: 1, borderRadius: 1 }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default UploadProgressList;
