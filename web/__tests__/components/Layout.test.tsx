import { render, screen } from '@testing-library/react';
import Layout from '../../src/components/Layout';

// Mock the AuthContext
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    logout: jest.fn(),
  })),
}));

// Mock the Navbar component
jest.mock('../../src/components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Mocked Navbar</nav>;
  };
});

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders navbar', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('wraps content in container by default', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const muiContainer = container.querySelector('.MuiContainer-root');
    expect(muiContainer).toBeInTheDocument();
  });

  it('does not use container when fullWidth is true', () => {
    const { container } = render(
      <Layout fullWidth={true}>
        <div>Content</div>
      </Layout>
    );

    const muiContainer = container.querySelector('.MuiContainer-root');
    expect(muiContainer).not.toBeInTheDocument();
  });
});