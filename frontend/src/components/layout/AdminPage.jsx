import { Box, Paper, Typography } from '@mui/material';

const AdminPage = ({ title, description, children }) => (
  <Box>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
    <Paper
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        boxShadow: 1,
        minHeight: 320,
      }}
    >
      {children}
    </Paper>
  </Box>
);

export default AdminPage;
