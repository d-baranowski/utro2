import { useState } from 'react';
import { createPromiseClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { TextField, Button, Box, Typography } from '@mui/material';
import { GetServerSideProps } from 'next';
import { AuthService } from '../generated/auth/v1/auth_connect';

type Props = { publicMsg: string };

export default function Home({ publicMsg }: Props) {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');

  const transport = createConnectTransport({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  });
  const client = createPromiseClient(AuthService, transport);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await client.login({ username, password });
    setToken(res.token);
  }

  async function callSecret() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const resp = await fetch(`${base}/secret`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSecret(await resp.text());
  }

  return (
    <Box sx={{ maxWidth: 400, m: 'auto', p: 2 }}>
      <Typography>{publicMsg}</Typography>
      <Typography variant="h5" component="h1" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField name="username" label="Username" />
        <TextField name="password" type="password" label="Password" />
        <Button type="submit" variant="contained">Login</Button>
      </Box>
      <Button onClick={callSecret} sx={{ mt: 2 }} variant="outlined">
        Call Authenticated Endpoint
      </Button>
      <Typography sx={{ mt: 2 }}>{secret}</Typography>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const base = process.env.API_BASE_URL || 'http://localhost:8080';
  const resp = await fetch(`${base}/public`);
  const publicMsg = await resp.text();
  return { props: { publicMsg } };
};
