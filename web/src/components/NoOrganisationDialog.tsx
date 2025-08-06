'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useOrganisation } from '@/contexts/OrganisationContext';
import { organisationApi } from '@/lib/api/organisation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface NoOrganisationDialogProps {
  open: boolean;
  onClose?: () => void;
}

export default function NoOrganisationDialog({ open, onClose }: NoOrganisationDialogProps) {
  const { createOrganisation, fetchOrganisations } = useOrganisation();
  const [tabValue, setTabValue] = useState(0);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleCreateOrganisation = async () => {
    if (!createName.trim()) {
      setError('Organisation name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createOrganisation(createName.trim(), createDescription.trim() || undefined);
      await fetchOrganisations();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await organisationApi.searchOrganisations(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setError('No organisations found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 },
      }}
      data-testid="no-organisation-dialog"
    >
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight={600}>
          Welcome! Get Started with an Organisation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You need to be part of an organisation to continue. Create a new one or search for
          existing ones.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          data-testid="organisation-dialog-tabs"
        >
          <Tab
            icon={<AddIcon />}
            label="Create New"
            iconPosition="start"
            data-testid="create-tab"
          />
          <Tab
            icon={<SearchIcon />}
            label="Search Existing"
            iconPosition="start"
            data-testid="search-tab"
          />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Organisation Name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              fullWidth
              required
              autoFocus
              disabled={loading}
              data-testid="create-organisation-name"
            />
            <TextField
              label="Description (optional)"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
              data-testid="create-organisation-description"
            />
            <Typography variant="caption" color="text.secondary">
              As the creator, you will automatically become an administrator of this organisation.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Search organisations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                data-testid="search-organisations-input"
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{ minWidth: 100 }}
                data-testid="search-organisations-button"
              >
                {loading ? <CircularProgress size={20} /> : 'Search'}
              </Button>
            </Box>

            {searchResults.length > 0 && (
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {searchResults.map((org) => (
                  <ListItem key={org.id} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText primary={org.name} secondary={org.description} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        {tabValue === 0 && (
          <>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateOrganisation}
              disabled={loading || !createName.trim()}
              data-testid="create-organisation-submit"
            >
              {loading ? <CircularProgress size={20} /> : 'Create Organisation'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
