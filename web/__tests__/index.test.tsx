import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages/index';
import { TestProviders } from '../src/test-utils/providers';

// Mock the auth context
const mockLogin = jest.fn();
const mockLogout = jest.fn();

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    token: null,
    loading: false,
    login: mockLogin,
    logout: mockLogout,
  })),
  AuthProvider: ({ children }: any) => children,
}));

// Mock the organisation context
jest.mock('../src/contexts/OrganisationContext', () => ({
  useOrganisation: jest.fn(() => ({
    organisations: [],
    currentOrganisation: null,
    loading: false,
    error: null,
    setCurrentOrganisation: jest.fn(),
    refetchOrganisations: jest.fn(),
    isCurrentUserAdmin: jest.fn(() => false),
  })),
  OrganisationProvider: ({ children }: any) => children,
}));

// Mock the Layout component to avoid navbar issues
jest.mock('../src/components/Layout', () => {
  return function MockLayout({ children }: any) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock Connect RPC client
jest.mock('@connectrpc/connect', () => ({
  createClient: jest.fn(() => ({
    login: jest.fn().mockResolvedValue({ token: 'mock-token' }),
  })),
}));

jest.mock('@connectrpc/connect-web', () => ({
  createConnectTransport: jest.fn(() => ({})),
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form when not authenticated', () => {
    render(
      <TestProviders>
        <Home publicMsg="Welcome to Utro" />
      </TestProviders>
    );

    expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
    expect(screen.getByTestId('login-username')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('displays public message when provided', () => {
    const publicMsg = 'Welcome to Utro';
    render(
      <TestProviders>
        <Home publicMsg={publicMsg} />
      </TestProviders>
    );

    expect(screen.getByText(publicMsg)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <TestProviders>
        <Home publicMsg="" />
      </TestProviders>
    );

    const submitButton = screen.getByTestId('login-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('auth.usernameRequired')).toBeInTheDocument();
      expect(screen.getByText('auth.passwordRequired')).toBeInTheDocument();
    });
  });

  it('displays dashboard when authenticated', () => {
    // Mock authenticated state
    const useAuth = require('../src/contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      token: 'mock-token',
      loading: false,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <TestProviders>
        <Home publicMsg="" />
      </TestProviders>
    );

    expect(screen.getByTestId('login-success-alert')).toBeInTheDocument();
    expect(screen.getByTestId('call-secret-button')).toBeInTheDocument();
  });

  it('shows organization info when user has an organization', () => {
    // Mock authenticated state with organization
    const useAuth = require('../src/contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      token: 'mock-token',
      loading: false,
      login: mockLogin,
      logout: mockLogout,
    });

    const useOrganisation = require('../src/contexts/OrganisationContext').useOrganisation;
    useOrganisation.mockReturnValue({
      organisations: [{ id: '1', name: 'Test Org' }],
      currentOrganisation: { id: '1', name: 'Test Org' },
      loading: false,
      error: null,
      setCurrentOrganisation: jest.fn(),
      refetchOrganisations: jest.fn(),
      isCurrentUserAdmin: jest.fn(() => false),
    });

    render(
      <TestProviders>
        <Home publicMsg="" />
      </TestProviders>
    );

    expect(screen.getByText('Test Org - Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });
});
