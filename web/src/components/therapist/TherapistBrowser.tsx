import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
  Pagination,
  Alert,
  Skeleton,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  VideoCall as VideoCallIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Filter as FilterIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { 
  TherapistVisibility, 
  Therapist as TherapistProto, 
  TherapistService, 
  SpecializationService,
  ListTherapistsRequestSchema,
  ListSpecializationsRequestSchema 
} from '@/generated/utro/v1/therapist_pb';
import { useQuery } from '@connectrpc/connect-query';
import { create } from '@bufbuild/protobuf';
import { therapistApi } from '@/lib/api/therapist';

// Use the generated protobuf type directly
type Therapist = TherapistProto;

interface Specialization {
  id: string;
  nameEng: string;
  namePl: string;
  category: string;
}

interface TherapistBrowserProps {
  organisationId?: string;
  showFilters?: boolean;
}

const LANGUAGES = [
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

export const TherapistBrowser: React.FC<TherapistBrowserProps> = ({
  organisationId,
  showFilters = true,
}) => {
  const { t, i18n } = useTranslation('common');
  const currentLang = i18n.language;
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [acceptingClientsOnly, setAcceptingClientsOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const itemsPerPage = 12;

  useEffect(() => {
    loadTherapists();
    loadSpecializations();
  }, [
    organisationId,
    currentPage,
    searchQuery,
    selectedSpecialization,
    selectedLanguage,
    inPersonOnly,
    onlineOnly,
    acceptingClientsOnly,
  ]);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      
      let data;
      
      if (searchQuery.trim()) {
        // Use search API when there's a search query
        const therapistsResult = await therapistApi.searchTherapists(searchQuery, organisationId);
        data = {
          therapists: therapistsResult || [],
          totalCount: therapistsResult?.length || 0,
          pageSize: itemsPerPage,
          pageNumber: currentPage,
        };
      } else {
        // Use list API for browsing
        const params = {
          organisationId: organisationId || '',
          pageSize: itemsPerPage,
          pageNumber: currentPage,
          specializationId: selectedSpecialization || undefined,
          language: selectedLanguage || undefined,
          inPerson: inPersonOnly || undefined,
          online: onlineOnly || undefined,
          acceptingClients: acceptingClientsOnly || undefined,
        };
        data = await therapistApi.listTherapists(params);
      }
      
      console.log('API Response data:', data);
      console.log('Therapists received:', data.therapists?.length || 0);
      console.log('Organisation ID used:', organisationId);
      
      setTherapists(data.therapists || []);
      setTotalPages(Math.ceil((data.totalCount || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error loading therapists:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setTherapists([]);
    } finally {
      setLoading(false);
    }
    
    // Debug logging
    console.log('TherapistBrowser - organisationId:', organisationId);
    console.log('TherapistBrowser - searchQuery:', searchQuery);
    console.log('TherapistBrowser - therapists loaded:', therapists.length);
  };
  
  const loadSpecializations = async () => {
    try {
      const data = await therapistApi.listSpecializations();
      setSpecializations(data || []);
    } catch (error) {
      console.error('Error loading specializations:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedLanguage('');
    setInPersonOnly(false);
    setOnlineOnly(false);
    setAcceptingClientsOnly(true);
    setCurrentPage(1);
  };

  const toggleCardExpansion = (therapistId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(therapistId)) {
        newSet.delete(therapistId);
      } else {
        newSet.add(therapistId);
      }
      return newSet;
    });
  };

  const getTherapistDescription = (therapist: Therapist) => {
    return currentLang === 'pl' && therapist.descriptionPl 
      ? therapist.descriptionPl 
      : therapist.descriptionEng;
  };

  const getTherapistWorkExperience = (therapist: Therapist) => {
    return currentLang === 'pl' && therapist.workExperiencePl 
      ? therapist.workExperiencePl 
      : therapist.workExperienceEng;
  };

  const getSpecializationName = (specialization: { nameEng: string; namePl: string }) => {
    return currentLang === 'pl' ? specialization.namePl : specialization.nameEng;
  };

  const filteredSpecializations = useMemo(() => {
    const categories = Array.from(new Set(specializations.map(s => s.category)));
    return categories.map(category => ({
      category,
      specializations: specializations.filter(s => s.category === category),
    }));
  }, [specializations]);

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
              <Skeleton variant="text" sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={80} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }} data-testid="therapist-browser-container">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('therapist.findTherapist')}
      </Typography>

      {showFilters && (
        <Card sx={{ mb: 3 }} data-testid="therapist-filters">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {t('therapist.filters')}
              </Typography>
              <IconButton onClick={() => setExpandedFilters(!expandedFilters)}>
                {expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <TextField
              fullWidth
              placeholder={t('therapist.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: expandedFilters ? 2 : 0 }}
              data-testid="search-input"
            />

            <Collapse in={expandedFilters}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('therapist.specialization')}</InputLabel>
                    <Select
                      value={selectedSpecialization}
                      onChange={(e) => {
                        setSelectedSpecialization(e.target.value);
                        handleFilterChange();
                      }}
                      label={t('therapist.specialization')}
                      data-testid="specialization-filter"
                    >
                      <MenuItem value="">{t('therapist.allSpecializations')}</MenuItem>
                      {filteredSpecializations.map(({ category, specializations }) => [
                        <MenuItem key={category} disabled>
                          <em>{category}</em>
                        </MenuItem>,
                        ...specializations.map(spec => (
                          <MenuItem key={spec.id} value={spec.id} sx={{ pl: 4 }}>
                            {getSpecializationName(spec)}
                          </MenuItem>
                        ))
                      ])}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('therapist.language')}</InputLabel>
                    <Select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        handleFilterChange();
                      }}
                      label={t('therapist.language')}
                      data-testid="language-filter"
                    >
                      <MenuItem value="">{t('therapist.allLanguages')}</MenuItem>
                      {LANGUAGES.map(lang => (
                        <MenuItem key={lang} value={lang}>
                          {lang}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={inPersonOnly}
                        onChange={(e) => {
                          setInPersonOnly(e.target.checked);
                          if (e.target.checked) setOnlineOnly(false);
                          handleFilterChange();
                        }}
                      />
                    }
                    label={t('therapist.inPersonOnly')}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={onlineOnly}
                        onChange={(e) => {
                          setOnlineOnly(e.target.checked);
                          if (e.target.checked) setInPersonOnly(false);
                          handleFilterChange();
                        }}
                        data-testid="online-therapy-filter"
                      />
                    }
                    label={t('therapist.onlineOnly')}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={acceptingClientsOnly}
                        onChange={(e) => {
                          setAcceptingClientsOnly(e.target.checked);
                          handleFilterChange();
                        }}
                      />
                    }
                    label={t('therapist.acceptingOnly')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button variant="outlined" onClick={clearFilters} data-testid="clear-filters-button">
                    {t('therapist.clearFilters')}
                  </Button>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {loading ? (
        renderSkeletons()
      ) : therapists.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }} data-testid="no-therapists-message">
          {t('therapist.noTherapistsFound')}
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('therapist.resultsCount', { count: therapists.length })}
          </Typography>

          <Grid container spacing={3}>
            {therapists.map((therapist) => {
              const isExpanded = expandedCards.has(therapist.id);
              const description = getTherapistDescription(therapist);
              const workExperience = getTherapistWorkExperience(therapist);

              return (
                <Grid item xs={12} md={6} lg={4} key={therapist.id}>
                  <Card 
                    data-testid={`therapist-card-${therapist.id}`}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.shadows[8],
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      {therapist.profileImageMimeType ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`/api/therapists/${therapist.id}/profile-image`}
                          alt={therapist.userFullName}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.200',
                          }}
                        >
                          <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
                            {(therapist.userFullName || therapist.userName)[0].toUpperCase()}
                          </Avatar>
                        </Box>
                      )}
                      
                      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                        {therapist.inPersonTherapyFormat && (
                          <Chip
                            icon={<LocationOnIcon />}
                            label={t('therapist.inPerson')}
                            size="small"
                            color="primary"
                          />
                        )}
                        {therapist.onlineTherapyFormat && (
                          <Chip
                            icon={<VideoCallIcon />}
                            label={t('therapist.online')}
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>

                      {therapist.isAcceptingNewClients && (
                        <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
                          <Chip
                            label={t('therapist.acceptingNewClients')}
                            size="small"
                            color="success"
                          />
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {therapist.userFullName || therapist.userName}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {therapist.professionalTitle}
                      </Typography>

                      {therapist.specializations.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('therapist.specializations')}:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {therapist.specializations.slice(0, 3).map((spec) => (
                              <Chip
                                key={spec.specializationId}
                                label={getSpecializationName(spec)}
                                size="small"
                                variant={spec.isPrimary ? "filled" : "outlined"}
                                color={spec.isPrimary ? "primary" : "default"}
                              />
                            ))}
                            {therapist.specializations.length > 3 && (
                              <Chip
                                label={`+${therapist.specializations.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t('therapist.languages')}:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {therapist.languages.slice(0, 2).join(', ')}
                            {therapist.languages.length > 2 && ` +${therapist.languages.length - 2}`}
                          </Typography>
                        </Box>
                      </Box>

                      {description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'none' : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1,
                          }}
                        >
                          {description}
                        </Typography>
                      )}

                      <Collapse in={isExpanded}>
                        {workExperience && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {t('therapist.workExperience')}:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {workExperience}
                            </Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {therapist.contactEmail && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="body2">{therapist.contactEmail}</Typography>
                            </Box>
                          )}
                          {therapist.contactPhone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2">{therapist.contactPhone}</Typography>
                            </Box>
                          )}
                          {therapist.websiteUrl && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WebIcon fontSize="small" color="action" />
                              <Typography 
                                variant="body2" 
                                component="a" 
                                href={therapist.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'primary.main', textDecoration: 'none' }}
                              >
                                {t('therapist.website')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Button
                          size="small"
                          onClick={() => toggleCardExpansion(therapist.id)}
                          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        >
                          {isExpanded ? t('therapist.showLess') : t('therapist.showMore')}
                        </Button>
                        
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PersonIcon />}
                          href={`/therapists/${therapist.slug}`}
                        >
                          {t('therapist.viewProfile')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};