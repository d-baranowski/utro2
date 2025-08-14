import { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useOrganisation } from '../src/contexts/OrganisationContext';
import { z } from 'zod';
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Stack,
  Divider,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { GetServerSideProps } from 'next';
import { AuthService } from '../generated/auth/v1/auth_pb';
import Layout from '../src/components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import config from '../src/config/env';

type Props = { publicMsg: string };

export default function Home({ publicMsg }: Props) {
  const { t } = useTranslation('common');
  const { isAuthenticated, login, logout, token } = useAuth();
  const { currentOrganisation } = useOrganisation();
  const [secret, setSecret] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const transport = createConnectTransport({
    baseUrl: config.apiBaseUrl,
  });
  const client = createClient(AuthService as any, transport) as any;

  const loginSchema = z.object({
    username: z.string().min(1, t('auth.usernameRequired')),
    password: z.string().min(1, t('auth.passwordRequired')),
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const result = loginSchema.safeParse({ username, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      });
      setLoading(false);
      return;
    }

    setErrors({});

    try {
      const res = await client.login(result.data as any);
      login(res.token);
    } catch (error) {
      setAuthError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    logout();
    setSecret('');
    setAuthError('');
  }

  async function callSecret() {
    try {
      const resp = await fetch(`${config.apiBaseUrl}/secret`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecret(await resp.text());
    } catch (error) {
      setSecret('Failed to fetch secret');
    }
  }

  return (
    <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {publicMsg && (
            <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
              {publicMsg}
            </Alert>
          )}

          {!isAuthenticated ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={3} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>

                <Typography component="h1" variant="h4" fontWeight={600}>
                  {t('auth.welcomeBack')}
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {t('pages.home.description')}
                </Typography>
              </Stack>

              {authError && (
                <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
                  {authError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    name="username"
                    label={t('auth.username')}
                    autoComplete="username"
                    autoFocus
                    error={!!errors.username}
                    helperText={errors.username}
                    disabled={loading}
                    data-testid="login-username"
                  />
                  <TextField
                    name="password"
                    type="password"
                    label={t('auth.password')}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                    data-testid="login-password"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 1 }}
                    data-testid="login-submit"
                  >
                    {loading ? <CircularProgress size={24} /> : t('auth.signIn')}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={600}>
                  {currentOrganisation
                    ? `${currentOrganisation.name} - Dashboard`
                    : t('pages.dashboard.title')}
                </Typography>

                <Alert severity="success" data-testid="login-success-alert">
                  {t('auth.loginSuccess')}
                </Alert>

                {currentOrganisation && (
                  <Alert severity="info">
                    Currently viewing: <strong>{currentOrganisation.name}</strong>
                  </Alert>
                )}

                <Divider />

                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Test Protected Endpoint
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click the button below to test your authentication token
                  </Typography>

                  <Button
                    onClick={callSecret}
                    variant="outlined"
                    sx={{ mt: 2 }}
                    data-testid="call-secret-button"
                  >
                    Call Authenticated Endpoint
                  </Button>

                  {secret && (
                    <Alert severity="info" sx={{ mt: 2 }} data-testid="secret-response">
                      Response: {secret}
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ locale }) => {
  const resp = await fetch(`${config.apiBaseUrlServer}/public`);
  const publicMsg = await resp.text();
  
  return {
    props: {
      publicMsg,
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
