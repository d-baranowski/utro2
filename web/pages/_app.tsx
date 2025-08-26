import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../src/utils/createEmotionCache';
import theme from '../src/theme/theme';
import Head from 'next/head';
import { useEffect } from 'react';
import { initializeTelemetry } from '../lib/telemetry';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config.js';
import { AuthProvider } from '../src/contexts/AuthContext';
import { OrganisationProvider } from '../src/contexts/OrganisationContext';
import { TransportProvider } from '@connectrpc/connect-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConnectTransport } from '@connectrpc/connect-web';
import config from '../src/config/env';

const clientSideEmotionCache = createEmotionCache();

// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create the Connect transport with proper JSON configuration
const transport = createConnectTransport({
  baseUrl: config.apiBaseUrl,
  useBinaryFormat: false,
  interceptors: [
    (next) => async (req) => {
      const token = localStorage.getItem('token');
      if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
      }
      req.header.set('Content-Type', 'application/json');
      req.header.set('Accept', 'application/json');
      return await next(req);
    },
  ],
});

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useEffect(() => {
    initializeTelemetry();
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>UTRO</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <TransportProvider transport={transport}>
            <AuthProvider>
              <OrganisationProvider>
                <Component {...pageProps} />
              </OrganisationProvider>
            </AuthProvider>
          </TransportProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
