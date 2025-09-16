import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
import { useQuery, useMutation } from '@connectrpc/connect-query';
import { create } from '@bufbuild/protobuf';
import { TherapistForm, TherapistFormData } from './TherapistForm';
import { 
  TherapistVisibility, 
  Therapist,
  ListTherapistsRequestSchema,
  CreateTherapistRequestSchema,
  UpdateTherapistRequestSchema,
  DeleteTherapistRequestSchema,
  PublishTherapistRequestSchema,
  UnpublishTherapistRequestSchema
} from '@/generated/utro/v1/therapist_pb';
import { 
  listTherapists, 
  createTherapist, 
  updateTherapist, 
  deleteTherapist, 
  publishTherapist, 
  unpublishTherapist 
} from '@/generated/utro/v1/therapist-TherapistService_connectquery';



interface TherapistManagementProps {
  organizationId: string;
  isAdmin: boolean;
}

export const TherapistManagement: React.FC<TherapistManagementProps> = ({
  organizationId,
  isAdmin,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
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

  // URL-aware handlers that don't cause infinite loops - defined first
  const handleCreateTherapistFromUrl = () => {
    if (!formOpen || formMode !== 'create') {
      setSelectedTherapist(null);
      setFormMode('create');
      setFormOpen(true);
    }
  };

  const handleEditTherapistFromUrl = (therapist: Therapist) => {
    if (!formOpen || formMode !== 'edit' || selectedTherapist?.id !== therapist.id) {
      setSelectedTherapist(therapist);
      setFormMode('edit');
      setFormOpen(true);
    }
  };

  const { data, error, isLoading, refetch } = useQuery(
    listTherapists,
    create(ListTherapistsRequestSchema, {
      organisationId: organizationId,
      pageSize: 100,
      pageNumber: 0,
    })
  );

  // Handle URL parameters for opening edit modal
  useEffect(() => {
    const { editId, action } = router.query;
    
    if (action === 'create') {
      handleCreateTherapistFromUrl();
    } else if (action === 'edit' && editId && data?.therapists) {
      const therapist = data.therapists.find(t => t.id === editId);
      if (therapist) {
        handleEditTherapistFromUrl(therapist);
      }
    }
  }, [router.query, data?.therapists]);

  const createMutation = useMutation(createTherapist, {
    onSuccess: () => {
      refetch();
      showSnackbar('Therapist created successfully', 'success');
      handleFormClose();
    },
    onError: (error) => {
      console.error('Error creating therapist:', error);
      showSnackbar('Failed to create therapist', 'error');
    },
  });

  const updateMutation = useMutation(updateTherapist, {
    onSuccess: () => {
      refetch();
      showSnackbar('Therapist updated successfully', 'success');
      handleFormClose();
    },
    onError: (error) => {
      console.error('Error updating therapist:', error);
      showSnackbar('Failed to update therapist', 'error');
    },
  });

  const deleteMutation = useMutation(deleteTherapist, {
    onSuccess: () => {
      refetch();
      showSnackbar('Therapist deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setTherapistToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting therapist:', error);
      showSnackbar('Failed to delete therapist', 'error');
    },
  });

  const publishMutation = useMutation(publishTherapist, {
    onSuccess: () => {
      refetch();
      showSnackbar('Therapist published successfully', 'success');
      handleMenuClose();
    },
    onError: (error) => {
      console.error('Error publishing therapist:', error);
      showSnackbar('Failed to publish therapist', 'error');
    },
  });

  const unpublishMutation = useMutation(unpublishTherapist, {
    onSuccess: () => {
      refetch();
      showSnackbar('Therapist unpublished successfully', 'success');
      handleMenuClose();
    },
    onError: (error) => {
      console.error('Error unpublishing therapist:', error);
      showSnackbar('Failed to unpublish therapist', 'error');
    },
  });

  const therapists = data?.therapists || [];


  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateTherapist = () => {
    // First close any existing form to ensure clean state
    setFormOpen(false);
    setSelectedTherapist(null);
    setFormMode('create');
    
    // Use setTimeout to ensure state updates are applied before opening form
    setTimeout(() => {
      setFormOpen(true);
    }, 0);
    
    // Update URL to reflect create action
    router.push({
      pathname: router.pathname,
      query: { ...router.query, action: 'create' }
    }, undefined, { shallow: true });
  };

  const handleEditTherapist = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setFormMode('edit');
    setFormOpen(true);
    handleMenuClose();
    // Update URL to reflect edit action with therapist ID
    router.push({
      pathname: router.pathname,
      query: { ...router.query, action: 'edit', editId: therapist.id }
    }, undefined, { shallow: true });
  };


  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTherapist(null);
    // Clear URL parameters when closing the form
    const newQuery = { ...router.query };
    delete newQuery.action;
    delete newQuery.editId;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  };

  const handleDeleteTherapist = (therapist: Therapist) => {
    setTherapistToDelete(therapist);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!therapistToDelete) return;
    
    deleteMutation.mutate(
      create(DeleteTherapistRequestSchema, {
        id: therapistToDelete.id,
      })
    );
  };

  const handlePublishToggle = (therapist: Therapist) => {
    const isPublished = !!therapist.publishedAt;
    
    if (isPublished) {
      unpublishMutation.mutate(
        create(UnpublishTherapistRequestSchema, {
          id: therapist.id,
        })
      );
    } else {
      publishMutation.mutate(
        create(PublishTherapistRequestSchema, {
          id: therapist.id,
        })
      );
    }
  };

  const handleFormSubmit = async (formData: TherapistFormData) => {
    if (formMode === 'create') {
      createMutation.mutate(
        create(CreateTherapistRequestSchema, {
          userId: formData.userId,
          organisationId: organizationId,
          professionalTitle: formData.professionalTitle,
          descriptionEng: formData.descriptionEng,
          descriptionPl: formData.descriptionPl,
          workExperienceEng: formData.workExperienceEng,
          workExperiencePl: formData.workExperiencePl,
          languages: formData.languages,
          inPersonTherapyFormat: formData.inPersonTherapyFormat,
          onlineTherapyFormat: formData.onlineTherapyFormat,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          websiteUrl: formData.websiteUrl,
          isAcceptingNewClients: formData.isAcceptingNewClients,
          visibility: formData.visibility,
          slug: formData.slug,
          metaDescription: formData.metaDescription,
          searchTags: formData.searchTags,
          specializationIds: formData.specializationIds,
        })
      );
    } else if (selectedTherapist) {
      updateMutation.mutate(
        create(UpdateTherapistRequestSchema, {
          id: selectedTherapist.id,
          professionalTitle: formData.professionalTitle,
          descriptionEng: formData.descriptionEng,
          descriptionPl: formData.descriptionPl,
          workExperienceEng: formData.workExperienceEng,
          workExperiencePl: formData.workExperiencePl,
          languages: formData.languages,
          inPersonTherapyFormat: formData.inPersonTherapyFormat,
          onlineTherapyFormat: formData.onlineTherapyFormat,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          websiteUrl: formData.websiteUrl,
          isAcceptingNewClients: formData.isAcceptingNewClients,
          visibility: formData.visibility,
          slug: formData.slug,
          metaDescription: formData.metaDescription,
          searchTags: formData.searchTags,
          specializationIds: formData.specializationIds,
        })
      );
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
    professionalTitle: therapist.professionalTitle,
    descriptionEng: therapist.descriptionEng,
    descriptionPl: therapist.descriptionPl,
    workExperienceEng: therapist.workExperienceEng,
    workExperiencePl: therapist.workExperiencePl,
    languages: therapist.languages,
    inPersonTherapyFormat: therapist.inPersonTherapyFormat,
    onlineTherapyFormat: therapist.onlineTherapyFormat,
    contactEmail: therapist.contactEmail,
    contactPhone: therapist.contactPhone,
    websiteUrl: therapist.websiteUrl,
    isAcceptingNewClients: therapist.isAcceptingNewClients,
    visibility: therapist.visibility,
    slug: therapist.slug,
    metaDescription: therapist.metaDescription,
    searchTags: therapist.searchTags,
    specializationIds: therapist.specializations.map(s => s.specializationId),
    profileImageUrl: undefined,
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Alert severity="error">
                      {t('therapist.loadError')}
                    </Alert>
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
                        alt={therapist.userFullName}
                        sx={{ width: 40, height: 40 }}
                      >
                        {therapist.userFullName.charAt(0)}
                      </Avatar>
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
        onClose={handleFormClose}
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