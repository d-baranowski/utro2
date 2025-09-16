import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Avatar,
  FormHelperText,
  Alert,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

export interface OfferFormData {
  id?: string;
  nameEng: string;
  namePl: string;
  descriptionEng: string;
  descriptionPl: string;
  profileImageData?: Uint8Array;
  profileImageMimeType?: string;
  profileImageUrl?: string;
}

interface OfferFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OfferFormData) => Promise<void>;
  initialData?: OfferFormData;
  mode: 'create' | 'edit';
  organizationId: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const OfferForm: React.FC<OfferFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  organizationId,
}) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<OfferFormData>({
    nameEng: '',
    namePl: '',
    descriptionEng: '',
    descriptionPl: '',
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      if (initialData.profileImageUrl) {
        setImagePreview(initialData.profileImageUrl);
      }
    } else {
      setFormData({
        nameEng: '',
        namePl: '',
        descriptionEng: '',
        descriptionPl: '',
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // At least one name is required
    if (!formData.nameEng?.trim() && !formData.namePl?.trim()) {
      newErrors.nameEng = t('offers.errors.nameRequired');
      newErrors.namePl = t('offers.errors.nameRequired');
    }

    // At least one description is required
    if (!formData.descriptionEng?.trim() && !formData.descriptionPl?.trim()) {
      newErrors.descriptionEng = t('offers.errors.descriptionRequired');
      newErrors.descriptionPl = t('offers.errors.descriptionRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof OfferFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        image: t('offers.errors.invalidImageType'),
      }));
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({
        ...prev,
        image: t('offers.errors.imageTooLarge'),
      }));
      return;
    }

    // Clear any previous image errors
    setErrors(prev => ({ ...prev, image: '' }));

    // Read file as base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Read file as array buffer for upload
    const arrayReader = new FileReader();
    arrayReader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({
          ...prev,
          profileImageData: new Uint8Array(e.target!.result as ArrayBuffer),
          profileImageMimeType: file.type,
        }));
      }
    };
    arrayReader.readAsArrayBuffer(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      profileImageData: undefined,
      profileImageMimeType: undefined,
      profileImageUrl: undefined,
    }));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: mode === 'create' 
          ? t('offers.errors.createFailed')
          : t('offers.errors.updateFailed'),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        {mode === 'create' ? t('offers.createOffer') : t('offers.editOffer')}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Profile Image Upload */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={imagePreview || undefined}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('offers.profileImage')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <PhotoCamera />
                    </IconButton>
                  </label>
                  {imagePreview && (
                    <IconButton color="error" onClick={handleRemoveImage}>
                      <Delete />
                    </IconButton>
                  )}
                </Box>
                {errors.image && (
                  <FormHelperText error>{errors.image}</FormHelperText>
                )}
              </Box>
            </Box>
          </Grid>

          {/* English Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('offers.nameEng')}
              value={formData.nameEng}
              onChange={handleInputChange('nameEng')}
              error={!!errors.nameEng}
              helperText={errors.nameEng}
              required
            />
          </Grid>

          {/* Polish Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('offers.namePl')}
              value={formData.namePl}
              onChange={handleInputChange('namePl')}
              error={!!errors.namePl}
              helperText={errors.namePl}
              required
            />
          </Grid>

          {/* English Description */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('offers.descriptionEng')}
              value={formData.descriptionEng}
              onChange={handleInputChange('descriptionEng')}
              error={!!errors.descriptionEng}
              helperText={errors.descriptionEng}
              required
            />
          </Grid>

          {/* Polish Description */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('offers.descriptionPl')}
              value={formData.descriptionPl}
              onChange={handleInputChange('descriptionPl')}
              error={!!errors.descriptionPl}
              helperText={errors.descriptionPl}
              required
            />
          </Grid>

          {/* Submit Error */}
          {errors.submit && (
            <Grid item xs={12}>
              <Alert severity="error">{errors.submit}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading
            ? t('common.loading')
            : mode === 'create'
            ? t('common.create')
            : t('common.update')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};