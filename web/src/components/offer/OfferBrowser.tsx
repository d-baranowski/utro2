import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Avatar,
  Skeleton,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Image as ImageIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@connectrpc/connect-query';
import { create } from '@bufbuild/protobuf';
import { 
  Offer,
  ListOffersRequestSchema,
  SearchOffersRequestSchema
} from '../../@types/offer/offer_pb';
import { 
  listOffers,
  searchOffers 
} from '../../@types/offer/offer-OfferService_connectquery';

interface OfferBrowserProps {
  organizationId?: string;
  showOrganizationName?: boolean;
}

export const OfferBrowser: React.FC<OfferBrowserProps> = ({
  organizationId,
  showOrganizationName = false,
}) => {
  const { t, i18n } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const currentLanguage = i18n.language;

  // Fetch all offers or organization-specific offers
  const { data, error, isLoading } = useQuery(
    listOffers,
    create(ListOffersRequestSchema, {
      ...(organizationId && { organisationId: organizationId }),
      pageSize: 100,
      pageNumber: 1,
    })
  );

  // Search offers data
  const { data: searchData, isLoading: searchLoading } = useQuery(
    searchOffers,
    create(SearchOffersRequestSchema, {
      query: searchTerm,
      ...(organizationId && { organisationId: organizationId }),
      pageSize: 100,
      pageNumber: 1,
    }),
    { enabled: searchTerm.length > 0 }
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const displayOffers = searchTerm ? searchData?.offers || [] : data?.offers || [];
  const loading = isLoading || (searchTerm && searchLoading);

  const getOfferName = (offer: Offer) => {
    if (currentLanguage === 'pl') {
      return offer.namePl || offer.nameEng || '';
    }
    return offer.nameEng || offer.namePl || '';
  };

  const getOfferDescription = (offer: Offer) => {
    if (currentLanguage === 'pl') {
      return offer.descriptionPl || offer.descriptionEng || '';
    }
    return offer.descriptionEng || offer.descriptionPl || '';
  };

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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('offers.browse')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('offers.browseSubtitle')}
        </Typography>
        {!loading && displayOffers.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('offers.offersCount', { count: displayOffers.length })}
          </Typography>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Offers Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={16} width="100%" sx={{ mt: 2 }} />
                  <Skeleton variant="text" height={16} width="100%" />
                  <Skeleton variant="text" height={16} width="70%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : displayOffers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? t('offers.noOffers') : t('offers.noOffersAvailable')}
          </Typography>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={() => setSearchTerm('')}
              sx={{ mt: 2 }}
            >
              {t('therapists.clearFilters')}
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayOffers.map((offer) => (
            <Grid item xs={12} sm={6} md={4} key={offer.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {/* Offer Image */}
                <Box sx={{ position: 'relative', height: 200 }}>
                  {offer.profileImageMimeType ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`data:${offer.profileImageMimeType};base64,${offer.profileImageData}`}
                      alt={getOfferName(offer)}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.300' }}>
                        <ImageIcon sx={{ fontSize: 40, color: 'grey.600' }} />
                      </Avatar>
                    </Box>
                  )}

                  {/* Language indicator */}
                  <Chip
                    size="small"
                    icon={<LanguageIcon />}
                    label={currentLanguage === 'pl' ? 'PL' : 'EN'}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Offer Name */}
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {getOfferName(offer)}
                  </Typography>

                  {/* Organization Name */}
                  {showOrganizationName && (
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      {offer.organisationName}
                    </Typography>
                  )}

                  {/* Offer Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.5,
                    }}
                  >
                    {getOfferDescription(offer)}
                  </Typography>

                  {/* Created Date */}
                  {offer.createdAt && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'grey.200' }}
                    >
                      {t('offers.created')}: {new Date(offer.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};