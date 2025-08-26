import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransportProvider } from '@connectrpc/connect-query';
import { createConnectTransport } from '@connectrpc/connect-web';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import { AuthProvider } from '../contexts/AuthContext';
import { OrganisationProvider } from '../contexts/OrganisationContext';

interface TestProvidersProps {
  children: React.ReactNode;
}

// Create a test transport that doesn't make real API calls
const testTransport = createConnectTransport({
  baseUrl: 'http://localhost:8080',
  useBinaryFormat: false,
});

// Create a test QueryClient with shorter retry times for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries in tests
      staleTime: 0,
      gcTime: 0, // Renamed from cacheTime in v5
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Test wrapper component that provides all necessary providers for testing
 * components that use Connect Query hooks, Material UI, and application contexts.
 * 
 * Usage in tests:
 * ```
 * import { render } from '@testing-library/react';
 * import { TestProviders } from '../test-utils/providers';
 * 
 * render(
 *   <TestProviders>
 *     <YourComponent />
 *   </TestProviders>
 * );
 * ```
 */
export const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  const queryClient = React.useMemo(() => createTestQueryClient(), []);
  
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <TransportProvider transport={testTransport}>
          <AuthProvider>
            <OrganisationProvider>
              {children}
            </OrganisationProvider>
          </AuthProvider>
        </TransportProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

/**
 * Custom render function that automatically wraps components with TestProviders
 */
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <TestProviders>
      {ui}
    </TestProviders>
  );
};