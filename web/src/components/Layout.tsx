import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isAuthenticated = false,
  onLogout,
  fullWidth = false,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {fullWidth ? children : <Container maxWidth="lg">{children}</Container>}
      </Box>
    </Box>
  );
};

export default Layout;
