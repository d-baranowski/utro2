import React from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TherapistManagement } from '../src/components/therapist/TherapistManagement';
import Layout from '../src/components/Layout';
import { useOrganisation } from '../src/contexts/OrganisationContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Alert, Box, Skeleton } from '@mui/material';
import { useTranslation } from 'next-i18next';

const TherapistManagementPage = () => {
  const { t } = useTranslation('common');
  const { currentOrganisation, isCurrentUserAdmin } = useOrganisation();
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
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="48%" height={120} />
            <Skeleton variant="rectangular" width="48%" height={120} />
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

  if (!currentOrganisation?.id) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">{t('organisation.selectOrganisation')}</Alert>
        </Box>
      </Layout>
    );
  }

  // Show access denied if not admin
  if (currentOrganisation && !isCurrentUserAdmin()) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">Admin access required</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <TherapistManagement organizationId={currentOrganisation.id} isAdmin={isCurrentUserAdmin()} />
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

export default TherapistManagementPage;