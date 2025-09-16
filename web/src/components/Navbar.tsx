import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import OrganisationSwitcher from './OrganisationSwitcher';
import NoOrganisationDialog from './NoOrganisationDialog';
import LanguageSwitcher from './LanguageSwitcher';
import { useOrganisation } from '../contexts/OrganisationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation('common');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNoOrgDialog, setShowNoOrgDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { organisations, loading, isCurrentUserAdmin } = useOrganisation();

  // Show no organisation dialog if user is authenticated but has no organisations
  React.useEffect(() => {
    if (isAuthenticated && !loading && organisations.length === 0) {
      setShowNoOrgDialog(true);
    } else if (organisations.length > 0) {
      setShowNoOrgDialog(false);
    }
  }, [isAuthenticated, loading, organisations]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: t('navigation.home'), href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ];

  // Add therapist-related menu items for authenticated users with organisations
  const therapistMenuItems = [];
  if (isAuthenticated && organisations.length > 0) {
    therapistMenuItems.push({ label: t('navigation.findTherapists', 'Find Therapists'), href: '/therapists' });
    
    if (isCurrentUserAdmin()) {
      therapistMenuItems.push({ label: t('navigation.manageTherapists', 'Manage Therapists'), href: '/therapist-management' });
      therapistMenuItems.push({ label: t('navigation.manageMembers', 'Manage Members'), href: '/organization-members' });
    }
  }

  // Add offer-related menu items for authenticated users with organisations
  const offerMenuItems = [];
  if (isAuthenticated && organisations.length > 0) {
    offerMenuItems.push({ label: t('navigation.browseOffers'), href: '/offers' });
    
    if (isCurrentUserAdmin()) {
      offerMenuItems.push({ label: t('navigation.manageOffers'), href: '/offer-management' });
    }
  }

  const allMenuItems = [...menuItems, ...therapistMenuItems, ...offerMenuItems];

  const drawer = (
    <Box sx={{ width: 250, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {allMenuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <Link href={item.href} passHref>
              <ListItemButton onClick={handleDrawerToggle}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <ListItemText primary="Language" />
              <LanguageSwitcher variant="icon" />
            </Box>
          </ListItemButton>
        </ListItem>
        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleDrawerToggle();
                logout();
              }}
              data-testid="mobile-logout-button"
            >
              <ListItemText primary={t('navigation.logout')} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                  }}
                >
                  U
                </Typography>
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  letterSpacing: '-0.5px',
                }}
              >
                UTRO
              </Typography>
            </Box>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {allMenuItems.map((item) => (
                  <Link key={item.label} href={item.href} passHref>
                    <Button
                      sx={{
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <LanguageSwitcher />
                {isAuthenticated && organisations.length > 0 && (
                  <OrganisationSwitcher onCreateOrganisation={() => setShowNoOrgDialog(true)} />
                )}
                {isAuthenticated && (
                  <Button
                    variant="contained"
                    onClick={logout}
                    sx={{ ml: 1 }}
                    data-testid="logout-button"
                  >
                    {t('navigation.logout')}
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      <NoOrganisationDialog
        open={showNoOrgDialog}
        onClose={() => setShowNoOrgDialog(false)}
        data-testid="no-organisation-dialog"
      />
    </>
  );
};

export default Navbar;
