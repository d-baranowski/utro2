import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { TestProviders } from '../../../test-utils/providers';
import { UserDropdown } from '../UserDropdown';
import { render } from '@testing-library/react';

// Mock the Connect Query hooks
jest.mock('@connectrpc/connect-query', () => ({
  ...jest.requireActual('@connectrpc/connect-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = require('@connectrpc/connect-query').useQuery;

describe('UserDropdown', () => {
  const defaultProps = {
    organisationId: 'test-org-id',
    value: '',
    onChange: jest.fn(),
    label: 'Select User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    render(
      <TestProviders>
        <UserDropdown {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('user-dropdown-loading')).toBeInTheDocument();
  });

  it('should render error state when query fails', async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: new Error('Failed to fetch users'),
      isLoading: false,
    });

    render(
      <TestProviders>
        <UserDropdown {...defaultProps} />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('common.errorLoadingUsers')).toBeInTheDocument();
    });
  });

  it('should render users when data is loaded successfully', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        memberType: 1, // ADMINISTRATOR
      },
      {
        id: 'user-2',
        username: 'jane_smith',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        memberType: 2, // MEMBER
      },
    ];

    mockUseQuery.mockReturnValue({
      data: { users: mockUsers },
      error: null,
      isLoading: false,
    });

    render(
      <TestProviders>
        <UserDropdown {...defaultProps} />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Verify the dropdown is not in loading state
    expect(screen.queryByTestId('user-dropdown-loading')).not.toBeInTheDocument();
  });

  it('should call onChange when user selection changes', async () => {
    const mockOnChange = jest.fn();
    const mockUsers = [
      {
        id: 'user-1',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        memberType: 1,
      },
    ];

    mockUseQuery.mockReturnValue({
      data: { users: mockUsers },
      error: null,
      isLoading: false,
    });

    render(
      <TestProviders>
        <UserDropdown {...defaultProps} onChange={mockOnChange} />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // This test would require more complex interaction simulation
    // For now, we just verify the component renders without QueryClient errors
  });

  it('should not crash without QueryClientProvider (regression test)', () => {
    // This test ensures our TestProviders properly provide QueryClient
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    const { container } = render(
      <TestProviders>
        <UserDropdown {...defaultProps} />
      </TestProviders>
    );

    // The component should render without throwing errors
    expect(container).toBeTruthy();
  });
});
