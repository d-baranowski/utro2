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
  Avatar,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation } from '@connectrpc/connect-query';
import { create } from '@bufbuild/protobuf';
import { OfferForm, OfferFormData } from './OfferForm';
import { 
  Offer,
  ListOffersRequestSchema,
  CreateOfferRequestSchema,
  UpdateOfferRequestSchema,
  DeleteOfferRequestSchema,
  SearchOffersRequestSchema
} from '../../@types/offer/offer_pb';
import { 
  listOffers, 
  createOffer, 
  updateOffer, 
  deleteOffer,
  searchOffers 
} from '../../@types/offer/offer-OfferService_connectquery';

interface OfferManagementProps {
  organizationId: string;
  isAdmin: boolean;
}

export const OfferManagement: React.FC<OfferManagementProps> = ({
  organizationId,
  isAdmin,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOffer, setMenuOffer] = useState<Offer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // URL-aware handlers that don't cause infinite loops
  const handleCreateOfferFromUrl = () => {
    if (!formOpen || formMode !== 'create') {
      setSelectedOffer(null);
      setFormMode('create');
      setFormOpen(true);
    }
  };

  const handleEditOfferFromUrl = (offer: Offer) => {
    if (!formOpen || formMode !== 'edit' || selectedOffer?.id !== offer.id) {
      setSelectedOffer(offer);
      setFormMode('edit');
      setFormOpen(true);
    }
  };

  // Handle URL hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#create-offer') {
        handleCreateOfferFromUrl();
      } else if (hash.startsWith('#edit-offer-')) {
        const offerId = hash.replace('#edit-offer-', '');
        if (data?.offers) {
          const offer = data.offers.find(t => t.id === offerId);
          if (offer) {
            handleEditOfferFromUrl(offer);
          }
        }
      }
    };

    handleHashChange(); // Handle initial hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [data?.offers]);

  // Fetch offers data
  const { data, error, isLoading, refetch } = useQuery(
    listOffers,
    create(ListOffersRequestSchema, {
      organisationId: organizationId,
      pageSize: 100,
      pageNumber: 1,
    })
  );

  // Search offers data
  const { data: searchData, refetch: refetchSearch } = useQuery(
    searchOffers,
    create(SearchOffersRequestSchema, {
      query: searchTerm,
      organisationId: organizationId,
      pageSize: 100,
      pageNumber: 1,
    }),
    { enabled: searchTerm.length > 0 }
  );

  // Mutations
  const createMutation = useMutation(createOffer, {
    onSuccess: () => {
      refetch();
      if (searchTerm) refetchSearch();
      showSuccessMessage(t('offers.success.created'));
    },
    onError: (error) => {
      console.error('Error creating offer:', error);
      showErrorMessage(t('offers.errors.createFailed'));
    },
  });

  const updateMutation = useMutation(updateOffer, {
    onSuccess: () => {
      refetch();
      if (searchTerm) refetchSearch();
      showSuccessMessage(t('offers.success.updated'));
    },
    onError: (error) => {
      console.error('Error updating offer:', error);
      showErrorMessage(t('offers.errors.updateFailed'));
    },
  });

  const deleteMutation = useMutation(deleteOffer, {
    onSuccess: () => {
      refetch();
      if (searchTerm) refetchSearch();
      showSuccessMessage(t('offers.success.deleted'));
    },
    onError: (error) => {
      console.error('Error deleting offer:', error);
      showErrorMessage(t('offers.errors.deleteFailed'));
    },
  });

  const showSuccessMessage = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const showErrorMessage = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setFormMode('create');
    setFormOpen(true);
    router.push('#create-offer', undefined, { shallow: true });
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setFormMode('edit');
    setFormOpen(true);
    router.push(`#edit-offer-${offer.id}`, undefined, { shallow: true });
  };

  const handleDeleteOffer = (offer: Offer) => {
    setOfferToDelete(offer);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmDelete = () => {
    if (offerToDelete) {
      deleteMutation.mutate(
        create(DeleteOfferRequestSchema, {
          id: offerToDelete.id,
        })
      );
    }
    setDeleteDialogOpen(false);
    setOfferToDelete(null);
  };

  const handleFormSubmit = async (formData: OfferFormData) => {
    if (formMode === 'create') {
      createMutation.mutate(
        create(CreateOfferRequestSchema, {
          organisationId: organizationId,
          nameEng: formData.nameEng,
          namePl: formData.namePl,
          descriptionEng: formData.descriptionEng,
          descriptionPl: formData.descriptionPl,
          profileImageData: formData.profileImageData,
          profileImageMimeType: formData.profileImageMimeType,
        })
      );
    } else if (selectedOffer) {
      updateMutation.mutate(
        create(UpdateOfferRequestSchema, {
          id: selectedOffer.id,
          nameEng: formData.nameEng,
          namePl: formData.namePl,
          descriptionEng: formData.descriptionEng,
          descriptionPl: formData.descriptionPl,
          profileImageData: formData.profileImageData,
          profileImageMimeType: formData.profileImageMimeType,
        })
      );
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedOffer(null);
    router.push(router.pathname, undefined, { shallow: true });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, offer: Offer) => {
    setAnchorEl(event.currentTarget);
    setMenuOffer(offer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOffer(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const displayOffers = searchTerm ? searchData?.offers || [] : data?.offers || [];

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t('offers.errors.loadFailed')}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('offers.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('offers.subtitle')}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOffer}
            size="large"
          >
            {t('offers.add')}
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('offers.searchPlaceholder')}
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Offers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('offers.profileImage')}</TableCell>
              <TableCell>{t('offers.nameEng')}</TableCell>
              <TableCell>{t('offers.namePl')}</TableCell>
              <TableCell>{t('offers.created')}</TableCell>
              <TableCell align="right">{t('offers.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="circular" width={40} height={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="circular" width={40} height={40} />
                  </TableCell>
                </TableRow>
              ))
            ) : displayOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {searchTerm ? t('offers.noOffers') : t('offers.noOffers')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? '' : t('offers.noOffersMessage')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              displayOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      <ImageIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {offer.nameEng || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {offer.namePl || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isAdmin && (
                      <IconButton
                        onClick={(e) => handleMenuClick(e, offer)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (menuOffer) handleEditOffer(menuOffer);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (menuOffer) handleDeleteOffer(menuOffer);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('offers.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('offers.deleteWarning')}
          </Typography>
          {offerToDelete && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              {offerToDelete.nameEng || offerToDelete.namePl}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Offer Form Dialog */}
      <OfferForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={selectedOffer ? {
          id: selectedOffer.id,
          nameEng: selectedOffer.nameEng,
          namePl: selectedOffer.namePl,
          descriptionEng: selectedOffer.descriptionEng,
          descriptionPl: selectedOffer.descriptionPl,
        } : undefined}
        mode={formMode}
        organizationId={organizationId}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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