import { render, screen } from '@testing-library/react';
import Layout from '../../src/components/Layout';

// Mock the Navbar component
jest.mock('../../src/components/Navbar', () => {
  return function MockNavbar({ isAuthenticated, onLogout }: any) {
    return (
      <nav data-testid="navbar">
        <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
        {onLogout && <button onClick={onLogout}>Logout</button>}
      </nav>
    );
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

  it('passes authentication state to navbar', () => {
    render(
      <Layout isAuthenticated={true}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument();
  });

  it('passes logout handler to navbar', () => {
    const mockLogout = jest.fn();

    render(
      <Layout isAuthenticated={true} onLogout={mockLogout}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });
});
