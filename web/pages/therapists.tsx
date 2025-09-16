import React from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TherapistBrowser } from '../src/components/therapist/TherapistBrowser';
import Layout from '../src/components/Layout';
import { useOrganisation } from '../src/contexts/OrganisationContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Alert, Box, Skeleton } from '@mui/material';
import { useTranslation } from 'next-i18next';

const TherapistsPage = () => {
  const { t } = useTranslation('common');
  const { currentOrganisation } = useOrganisation();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width="200px" height={40} />
            <Skeleton variant="rectangular" width="150px" height={40} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={200} />
            ))}
          </Box>
        </Box>
      </Layout>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Redirecting to login...</Alert>
        </Box>
      </Layout>
    );
  }

  if (!currentOrganisation) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">{t('organisation.selectOrganisation')}</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <TherapistBrowser organisationId={currentOrganisation.id} showFilters={true} />
    </Layout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export default TherapistsPage;
