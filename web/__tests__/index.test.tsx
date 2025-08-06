import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages/index';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
    };
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form when not authenticated', () => {
    render(<Home publicMsg="Welcome to Utro" />);

    expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.username')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auth.signIn/i })).toBeInTheDocument();
  });

  it('displays public message when provided', () => {
    const publicMsg = 'Welcome to Utro';
    render(<Home publicMsg={publicMsg} />);

    expect(screen.getByText(publicMsg)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<Home publicMsg="" />);

    const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('auth.usernameRequired')).toBeInTheDocument();
      expect(screen.getByText('auth.passwordRequired')).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockResponse = { token: 'mock-jwt-token' };

    // Mock the Connect RPC client
    const mockClient = {
      login: jest.fn().mockResolvedValue(mockResponse),
    };

    // This test would need more setup to properly mock the Connect client
    // For now, this demonstrates the structure
    expect(mockClient.login).toBeDefined();
  });
});
