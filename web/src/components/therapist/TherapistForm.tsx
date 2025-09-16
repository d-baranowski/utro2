import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Typography,
  IconButton,
  Avatar,
  FormHelperText,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { TherapistVisibility } from '@/generated/utro/v1/therapist_pb';
import { UserDropdown } from '../common/UserDropdown';

interface TherapistFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TherapistFormData) => Promise<void>;
  initialData?: TherapistFormData;
  mode: 'create' | 'edit';
  organizationId: string;
}

export interface TherapistFormData {
  id?: string;
  userId?: string;
  professionalTitle: string;
  descriptionEng: string;
  descriptionPl: string;
  workExperienceEng: string;
  workExperiencePl: string;
  languages: string[];
  inPersonTherapyFormat: boolean;
  onlineTherapyFormat: boolean;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  isAcceptingNewClients: boolean;
  visibility: TherapistVisibility;
  slug: string;
  metaDescription: string;
  searchTags: string[];
  specializationIds: string[];
  profileImageData?: Uint8Array;
  profileImageMimeType?: string;
  profileImageUrl?: string;
}

const AVAILABLE_LANGUAGES = [
  'English',
  'Polish',
  'German',
  'Spanish',
  'French',
  'Italian',
  'Portuguese',
  'Russian',
  'Ukrainian',
  'Czech',
  'Slovak',
];

export const TherapistForm: React.FC<TherapistFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  organizationId,
}) => {
  const { t } = useTranslation('common');
  const getInitialFormData = (): TherapistFormData => ({
    professionalTitle: '',
    descriptionEng: '',
    descriptionPl: '',
    workExperienceEng: '',
    workExperiencePl: '',
    languages: [],
    inPersonTherapyFormat: false,
    onlineTherapyFormat: false,
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    isAcceptingNewClients: true,
    visibility: TherapistVisibility.PUBLIC,
    slug: '',
    metaDescription: '',
    searchTags: [],
    specializationIds: [],
  });

  const [formData, setFormData] = useState<TherapistFormData>(getInitialFormData());
  const [newTag, setNewTag] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'create') {
      // Reset form to initial state for create mode
      setFormData(getInitialFormData());
      setErrors({});
    } else if (mode === 'edit' && initialData) {
      // Load initial data for edit mode
      setFormData(initialData);
      setErrors({});
    }
  }, [mode, initialData]);

  const handleChange = (field: keyof TherapistFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        handleChange('profileImageData', new Uint8Array(arrayBuffer));
        handleChange('profileImageMimeType', file.type);
        handleChange('profileImageUrl', URL.createObjectURL(file));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRemoveImage = () => {
    handleChange('profileImageData', undefined);
    handleChange('profileImageMimeType', undefined);
    handleChange('profileImageUrl', undefined);
  };

  const handleAddTag = () => {
    if (newTag && !formData.searchTags.includes(newTag)) {
      handleChange('searchTags', [...formData.searchTags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      'searchTags',
      formData.searchTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleAddLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      handleChange('languages', [...formData.languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    handleChange(
      'languages',
      formData.languages.filter((lang) => lang !== languageToRemove)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create' && !formData.userId) {
      newErrors.userId = t('therapist.errors.userRequired');
    }
    if (!formData.professionalTitle) {
      newErrors.professionalTitle = t('therapist.errors.titleRequired');
    }
    if (!formData.contactEmail) {
      newErrors.contactEmail = t('therapist.errors.emailRequired');
    }
    if (!formData.slug) {
      newErrors.slug = t('therapist.errors.slugRequired');
    }
    if (formData.languages.length === 0) {
      newErrors.languages = t('therapist.errors.languagesRequired');
    }
    if (!formData.inPersonTherapyFormat && !formData.onlineTherapyFormat) {
      newErrors.therapyFormat = t('therapist.errors.formatRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      console.error('Failed to submit therapist form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth data-testid="therapist-form-dialog">
      <DialogTitle>
        {mode === 'create' ? t('therapist.createTitle') : t('therapist.editTitle')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {mode === 'create' && (
            <Grid item xs={12}>
              <UserDropdown
                organisationId={organizationId}
                value={formData.userId}
                onChange={(userId) => handleChange('userId', userId)}
                label={t('therapist.selectUser')}
                error={!!errors.userId}
                helperText={errors.userId}
                required
                data-testid="therapist-user-select"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('therapist.professionalTitle')}
              value={formData.professionalTitle}
              onChange={(e) => handleChange('professionalTitle', e.target.value)}
              error={!!errors.professionalTitle}
              helperText={errors.professionalTitle}
              data-testid="therapist-title-input"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('therapist.slug')}
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              error={!!errors.slug}
              helperText={errors.slug || t('therapist.slugHelp')}
              data-testid="therapist-slug-input"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={formData.profileImageUrl}
                sx={{ width: 100, height: 100 }}
              />
              <Box>
                <input
                  accept="image/*"
                  id="profile-image-upload"
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                />
                <label htmlFor="profile-image-upload">
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
                {formData.profileImageUrl && (
                  <IconButton color="error" onClick={handleRemoveImage}>
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('therapist.descriptionEng')}
              value={formData.descriptionEng}
              onChange={(e) => handleChange('descriptionEng', e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('therapist.descriptionPl')}
              value={formData.descriptionPl}
              onChange={(e) => handleChange('descriptionPl', e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('therapist.workExperienceEng')}
              value={formData.workExperienceEng}
              onChange={(e) => handleChange('workExperienceEng', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('therapist.workExperiencePl')}
              value={formData.workExperiencePl}
              onChange={(e) => handleChange('workExperiencePl', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {t('therapist.languages')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.languages.map((lang) => (
                <Chip
                  key={lang}
                  label={lang}
                  onDelete={() => handleRemoveLanguage(lang)}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  displayEmpty
                  data-testid="therapist-language-select"
                >
                  <MenuItem value="">
                    <em>{t('therapist.selectLanguage')}</em>
                  </MenuItem>
                  {AVAILABLE_LANGUAGES.filter(
                    (lang) => !formData.languages.includes(lang)
                  ).map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={handleAddLanguage} variant="outlined" data-testid="add-language-button">
                {t('common.add')}
              </Button>
            </Box>
            {errors.languages && (
              <FormHelperText error>{errors.languages}</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.inPersonTherapyFormat}
                  onChange={(e) =>
                    handleChange('inPersonTherapyFormat', e.target.checked)
                  }
                  data-testid="in-person-therapy-switch"
                />
              }
              label={t('therapist.inPersonTherapy')}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.onlineTherapyFormat}
                  onChange={(e) =>
                    handleChange('onlineTherapyFormat', e.target.checked)
                  }
                />
              }
              label={t('therapist.onlineTherapy')}
            />
          </Grid>
          {errors.therapyFormat && (
            <Grid item xs={12}>
              <FormHelperText error>{errors.therapyFormat}</FormHelperText>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('therapist.contactEmail')}
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail}
              data-testid="therapist-email-input"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('therapist.contactPhone')}
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('therapist.websiteUrl')}
              value={formData.websiteUrl}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('therapist.visibility')}</InputLabel>
              <Select
                value={formData.visibility}
                onChange={(e) => handleChange('visibility', e.target.value)}
                label={t('therapist.visibility')}
              >
                <MenuItem value={TherapistVisibility.PUBLIC}>
                  {t('therapist.visibilityPublic')}
                </MenuItem>
                <MenuItem value={TherapistVisibility.ORGANISATION_ONLY}>
                  {t('therapist.visibilityOrganisation')}
                </MenuItem>
                <MenuItem value={TherapistVisibility.PRIVATE}>
                  {t('therapist.visibilityPrivate')}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAcceptingNewClients}
                  onChange={(e) =>
                    handleChange('isAcceptingNewClients', e.target.checked)
                  }
                />
              }
              label={t('therapist.acceptingNewClients')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('therapist.metaDescription')}
              value={formData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              multiline
              rows={2}
              helperText={t('therapist.metaDescriptionHelp')}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {t('therapist.searchTags')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.searchTags.map((tag) => (
                <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t('therapist.addTag')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} variant="outlined">
                {t('common.add')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} data-testid="therapist-form-submit">
          {mode === 'create' ? t('common.create') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};