import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { TherapistForm, TherapistFormData } from './TherapistForm';
import { TherapistVisibility } from '../../../generated/utro/v1/therapist_pb';

interface Therapist {
  id: string;
  userId: string;
  userName: string;
  userFullName: string;
  professionalTitle: string;
  contactEmail: string;
  contactPhone: string;
  languages: string[];
  inPersonTherapyFormat: boolean;
  onlineTherapyFormat: boolean;
  isAcceptingNewClients: boolean;
  visibility: TherapistVisibility;
  slug: string;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string;
}


interface TherapistManagementProps {
  organizationId: string;
  isAdmin: boolean;
}

export const TherapistManagement: React.FC<TherapistManagementProps> = ({
  organizationId,
  isAdmin,
}) => {
  const { t } = useTranslation('common');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTherapist, setMenuTherapist] = useState<Therapist | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [therapistToDelete, setTherapistToDelete] = useState<Therapist | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadTherapists();
  }, [organizationId]);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/therapists?organizationId=${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      } else {
        showSnackbar('Failed to load therapists', 'error');
      }
    } catch (error) {
      console.error('Error loading therapists:', error);
      showSnackbar('Error loading therapists', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Users are now loaded via the UserDropdown component using Connect Query hooks

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateTherapist = () => {
    setSelectedTherapist(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEditTherapist = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setFormMode('edit');
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteTherapist = (therapist: Therapist) => {
    setTherapistToDelete(therapist);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!therapistToDelete) return;

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/therapists/${therapistToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setTherapists(prev => prev.filter(t => t.id !== therapistToDelete.id));
        showSnackbar('Therapist deleted successfully', 'success');
      } else {
        showSnackbar('Failed to delete therapist', 'error');
      }
    } catch (error) {
      console.error('Error deleting therapist:', error);
      showSnackbar('Error deleting therapist', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setTherapistToDelete(null);
    }
  };

  const handlePublishToggle = async (therapist: Therapist) => {
    const isPublished = !!therapist.publishedAt;
    const action = isPublished ? 'unpublish' : 'publish';
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/therapists/${therapist.id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        loadTherapists(); // Reload to get updated data
        showSnackbar(`Therapist ${action}ed successfully`, 'success');
      } else {
        showSnackbar(`Failed to ${action} therapist`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing therapist:`, error);
      showSnackbar(`Error ${action}ing therapist`, 'error');
    }
    
    handleMenuClose();
  };

  const handleFormSubmit = async (formData: TherapistFormData) => {
    try {
      const url = formMode === 'create' 
        ? '/api/therapists'
        : `/api/therapists/${selectedTherapist?.id}`;
      
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      if (response.ok) {
        loadTherapists();
        showSnackbar(
          formMode === 'create' 
            ? 'Therapist created successfully' 
            : 'Therapist updated successfully', 
          'success'
        );
        setFormOpen(false);
      } else {
        showSnackbar(`Failed to ${formMode} therapist`, 'error');
      }
    } catch (error) {
      console.error(`Error ${formMode}ing therapist:`, error);
      showSnackbar(`Error ${formMode}ing therapist`, 'error');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, therapist: Therapist) => {
    setAnchorEl(event.currentTarget);
    setMenuTherapist(therapist);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTherapist(null);
  };

  const getVisibilityIcon = (visibility: TherapistVisibility) => {
    switch (visibility) {
      case TherapistVisibility.PUBLIC:
        return <PublicIcon fontSize="small" />;
      case TherapistVisibility.ORGANISATION_ONLY:
        return <GroupIcon fontSize="small" />;
      case TherapistVisibility.PRIVATE:
        return <LockIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  const getVisibilityLabel = (visibility: TherapistVisibility) => {
    switch (visibility) {
      case TherapistVisibility.PUBLIC:
        return t('therapist.visibilityPublic');
      case TherapistVisibility.ORGANISATION_ONLY:
        return t('therapist.visibilityOrganisation');
      case TherapistVisibility.PRIVATE:
        return t('therapist.visibilityPrivate');
      default:
        return t('therapist.visibilityPublic');
    }
  };

  const convertTherapistToFormData = (therapist: Therapist): TherapistFormData => ({
    id: therapist.id,
    userId: therapist.userId,
    professionalTitle: therapist.professionalTitle || '',
    descriptionEng: '', // TODO: Add these fields to the interface
    descriptionPl: '',
    workExperienceEng: '',
    workExperiencePl: '',
    languages: therapist.languages || [],
    inPersonTherapyFormat: therapist.inPersonTherapyFormat,
    onlineTherapyFormat: therapist.onlineTherapyFormat,
    contactEmail: therapist.contactEmail || '',
    contactPhone: therapist.contactPhone || '',
    websiteUrl: '',
    isAcceptingNewClients: therapist.isAcceptingNewClients,
    visibility: therapist.visibility,
    slug: therapist.slug || '',
    metaDescription: '',
    searchTags: [],
    specializationIds: [],
    profileImageUrl: therapist.profileImageUrl,
  });

  if (!isAdmin) {
    return (
      <Alert severity="warning">
        {t('therapist.adminAccessRequired')}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }} data-testid="therapist-management-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('therapist.managementTitle')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTherapist}
          data-testid="create-therapist-button"
        >
          {t('therapist.addTherapist')}
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('therapist.avatar')}</TableCell>
                <TableCell>{t('therapist.name')}</TableCell>
                <TableCell>{t('therapist.title')}</TableCell>
                <TableCell>{t('therapist.contact')}</TableCell>
                <TableCell>{t('therapist.languages')}</TableCell>
                <TableCell>{t('therapist.formats')}</TableCell>
                <TableCell>{t('therapist.visibility')}</TableCell>
                <TableCell>{t('therapist.status')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : therapists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" data-testid="no-therapists-message">
                    {t('therapist.noTherapists')}
                  </TableCell>
                </TableRow>
              ) : (
                therapists.map((therapist) => (
                  <TableRow key={therapist.id} hover data-testid={`therapist-row-${therapist.id}`}>
                    <TableCell>
                      <Avatar
                        src={therapist.profileImageUrl}
                        alt={therapist.userFullName}
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {therapist.userFullName || therapist.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{therapist.userName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{therapist.professionalTitle}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{therapist.contactEmail}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {therapist.contactPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {therapist.languages.slice(0, 2).map((lang) => (
                          <Chip key={lang} label={lang} size="small" variant="outlined" />
                        ))}
                        {therapist.languages.length > 2 && (
                          <Chip 
                            label={`+${therapist.languages.length - 2}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {therapist.inPersonTherapyFormat && (
                          <Chip label={t('therapist.inPerson')} size="small" color="primary" />
                        )}
                        {therapist.onlineTherapyFormat && (
                          <Chip label={t('therapist.online')} size="small" color="secondary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getVisibilityIcon(therapist.visibility)}
                        <Typography variant="caption">
                          {getVisibilityLabel(therapist.visibility)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip
                          label={therapist.publishedAt ? t('therapist.published') : t('therapist.draft')}
                          size="small"
                          color={therapist.publishedAt ? 'success' : 'warning'}
                          variant="outlined"
                          data-testid={`therapist-status-${therapist.id}`}
                        />
                        <Chip
                          label={therapist.isAcceptingNewClients 
                            ? t('therapist.accepting') 
                            : t('therapist.notAccepting')
                          }
                          size="small"
                          color={therapist.isAcceptingNewClients ? 'info' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, therapist)}
                        size="small"
                        data-testid={`therapist-menu-${therapist.id}`}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditTherapist(menuTherapist!)} data-testid={`edit-therapist-${menuTherapist?.id}`}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => handlePublishToggle(menuTherapist!)} data-testid={`publish-therapist-${menuTherapist?.id}`}>
          {menuTherapist?.publishedAt ? (
            <>
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
              {t('therapist.unpublish')}
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              {t('therapist.publish')}
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTherapist(menuTherapist!)} data-testid={`delete-therapist-${menuTherapist?.id}`}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      <TherapistForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTherapist ? convertTherapistToFormData(selectedTherapist) : undefined}
        mode={formMode}
        organizationId={organizationId}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('therapist.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('therapist.deleteWarning', { 
              name: therapistToDelete?.userFullName || therapistToDelete?.userName 
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" data-testid="confirm-delete-therapist">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};