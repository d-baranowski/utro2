import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for protobuf in Jest environment
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

// Mock localStorage for Jest environment
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      locale: 'en',
    };
  },
}));

// Mock the organization API
jest.mock('@/lib/api/organisation', () => ({
  organisationApi: {
    getMyOrganisations: jest.fn().mockResolvedValue([]),
    createOrganisation: jest.fn(),
    searchOrganisations: jest.fn().mockResolvedValue([]),
  },
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Return key as translation for testing
    i18n: { language: 'en' },
  }),
}));

// Mock next-i18next/serverSideTranslations
jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({}),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock OrganisationContext
jest.mock('@/contexts/OrganisationContext', () => ({
  useOrganisation: () => ({
    organisations: [],
    currentOrganisation: null,
    loading: false,
    error: null,
    setCurrentOrganisation: jest.fn(),
    refetchOrganisations: jest.fn(),
    isCurrentUserAdmin: jest.fn(() => false),
  }),
  OrganisationProvider: ({ children }) => children,
}));

// Protobuf generated files are now mocked with actual files in src/generated/

// Connect query files can be mocked individually in specific tests if needed

// Mock Connect RPC
jest.mock('@connectrpc/connect', () => {
  class ConnectError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConnectError';
    }
  }
  return {
    ConnectError,
    createClient: jest.fn(),
  };
});
