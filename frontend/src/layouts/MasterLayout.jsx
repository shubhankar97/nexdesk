import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { MasterDataProvider } from '../context/MasterDataContext.jsx';
import MasterSidebar, { DRAWER_WIDTH } from '../components/layout/MasterSidebar.jsx';
import MasterTopBar from '../components/layout/MasterTopBar.jsx';

const MasterLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MasterDataProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <MasterTopBar onMenuClick={() => setMobileOpen(true)} />
        <MasterSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            p: { xs: 2, sm: 3 },
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </MasterDataProvider>
  );
};

export default MasterLayout;
