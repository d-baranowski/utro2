import { useState } from 'react';
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

type Props = { publicMsg: string };

export default function Home({ publicMsg }: Props) {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const transport = createConnectTransport({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  });
  const client = createClient(AuthService as any, transport) as any;

  const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
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
      setToken(res.token);
    } catch (error) {
      setAuthError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setToken('');
    setSecret('');
    setAuthError('');
  }

  async function callSecret() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    try {
      const resp = await fetch(`${base}/secret`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecret(await resp.text());
    } catch (error) {
      setSecret('Failed to fetch secret');
    }
  }

  return (
    <Layout isAuthenticated={!!token} onLogout={handleLogout}>
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

          {!token ? (
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
                  Welcome Back
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Sign in to your account to continue
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
                    label="Username"
                    autoComplete="username"
                    autoFocus
                    error={!!errors.username}
                    helperText={errors.username}
                    disabled={loading}
                  />
                  <TextField
                    name="password"
                    type="password"
                    label="Password"
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
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
                  Dashboard
                </Typography>

                <Alert severity="success">You are successfully logged in!</Alert>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Test Protected Endpoint
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click the button below to test your authentication token
                  </Typography>

                  <Button onClick={callSecret} variant="outlined" sx={{ mt: 2 }}>
                    Call Authenticated Endpoint
                  </Button>

                  {secret && (
                    <Alert severity="info" sx={{ mt: 2 }}>
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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const base = process.env.API_BASE_URL || 'http://localhost:8080';
  const resp = await fetch(`${base}/public`);
  const publicMsg = await resp.text();
  return { props: { publicMsg } };
};
