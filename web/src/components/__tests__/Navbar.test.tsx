import { render, screen, fireEvent, within } from '@testing-library/react';
import Navbar from '../Navbar';
import { TestProviders } from '../../test-utils/providers';

// Mock hooks
const mockLogout = jest.fn();
const mockPush = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    logout: mockLogout,
  })),
}));

jest.mock('../../contexts/OrganisationContext', () => ({
  useOrganisation: jest.fn(() => ({
    organisations: [],
    loading: false,
    isCurrentUserAdmin: jest.fn(() => false),
  })),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    locale: 'en',
    pathname: '/',
  }),
}));

// Mock child components
jest.mock('../OrganisationSwitcher', () => {
  return function MockOrganisationSwitcher() {
    return <div data-testid="organisation-switcher">Org Switcher</div>;
  };
});

jest.mock('../NoOrganisationDialog', () => {
  return function MockNoOrganisationDialog({ open }: any) {
    return open ? <div data-testid="no-org-dialog">No Org Dialog</div> : null;
  };
});

jest.mock('../LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>;
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and app name', () => {
    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('UTRO')).toBeInTheDocument();
  });

  it('shows logout button when authenticated', () => {
    const useAuth = require('../../contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('hides logout button when not authenticated', () => {
    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    const useAuth = require('../../contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    fireEvent.click(screen.getByTestId('logout-button'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows organization switcher when user has organizations', () => {
    const useAuth = require('../../contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    const useOrganisation = require('../../contexts/OrganisationContext').useOrganisation;
    useOrganisation.mockReturnValue({
      organisations: [{ id: '1', name: 'Org 1' }],
      loading: false,
      isCurrentUserAdmin: jest.fn(() => false),
    });

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.getByTestId('organisation-switcher')).toBeInTheDocument();
  });

  it('hides organization switcher when user has no organizations', () => {
    const useAuth = require('../../contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.queryByTestId('organisation-switcher')).not.toBeInTheDocument();
  });

  it('shows therapist management link for admin users', () => {
    const useAuth = require('../../contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    const useOrganisation = require('../../contexts/OrganisationContext').useOrganisation;
    useOrganisation.mockReturnValue({
      organisations: [{ id: '1', name: 'Org 1' }],
      loading: false,
      isCurrentUserAdmin: jest.fn(() => true),
    });

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.getByText('navigation.manageTherapists')).toBeInTheDocument();
  });

  it('hides therapist management link for non-admin users', () => {
    const useAuth = require('../../contexts/AuthContext').useAuth;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    const useOrganisation = require('../../contexts/OrganisationContext').useOrganisation;
    useOrganisation.mockReturnValue({
      organisations: [{ id: '1', name: 'Org 1' }],
      loading: false,
      isCurrentUserAdmin: jest.fn(() => false),
    });

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.queryByText('navigation.manageTherapists')).not.toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('opens mobile menu when menu button is clicked', () => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 899.95px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <TestProviders>
        <Navbar />
      </TestProviders>
    );

    // Mobile menu should be closed initially
    expect(screen.queryByTestId('mobile-logout-button')).not.toBeInTheDocument();
  });
});