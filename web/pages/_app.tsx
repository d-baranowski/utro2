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
import { AuthProvider } from '../src/contexts/AuthContext';
import { OrganisationProvider } from '../src/contexts/OrganisationContext';

const clientSideEmotionCache = createEmotionCache();

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
        <AuthProvider>
          <OrganisationProvider>
            <Component {...pageProps} />
          </OrganisationProvider>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);
