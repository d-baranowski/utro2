import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TherapistManagement } from '../TherapistManagement';
import { TestProviders } from '../../../test-utils/providers';

// Mock the TherapistForm component
jest.mock('../TherapistForm', () => ({
  TherapistForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="therapist-form-dialog">
      <button onClick={() => onSubmit({ userId: 'user-1' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock the Connect Query hooks
const mockListTherapists = jest.fn();
const mockCreateTherapist = jest.fn();
const mockUpdateTherapist = jest.fn();
const mockDeleteTherapist = jest.fn();

jest.mock('@connectrpc/connect-query', () => ({
  useQuery: jest.fn((queryFn) => {
    if (queryFn.name === 'listTherapists') {
      return mockListTherapists();
    }
    return { data: null, error: null, isLoading: false };
  }),
  useMutation: jest.fn((mutationFn) => {
    if (mutationFn.name === 'createTherapist') {
      return mockCreateTherapist();
    }
    if (mutationFn.name === 'updateTherapist') {
      return mockUpdateTherapist();
    }
    if (mutationFn.name === 'deleteTherapist') {
      return mockDeleteTherapist();
    }
    return { mutate: jest.fn(), isPending: false };
  }),
}));

describe('TherapistManagement', () => {
  const defaultProps = {
    organizationId: 'org-123',
    isAdmin: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockListTherapists.mockReturnValue({
      data: {
        therapists: [
          {
            id: '1',
            userId: 'user-1',
            professionalTitle: 'Dr. Smith',
            contactEmail: 'smith@example.com',
            slug: 'dr-smith',
            isPublished: true,
            languages: ['ENGLISH'],
            supportsOnlineTherapy: true,
            supportsInPersonTherapy: false,
          },
          {
            id: '2',
            userId: 'user-2',
            professionalTitle: 'Dr. Jones',
            contactEmail: 'jones@example.com',
            slug: 'dr-jones',
            isPublished: false,
            languages: ['POLISH'],
            supportsOnlineTherapy: false,
            supportsInPersonTherapy: true,
          },
        ],
      },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });

    mockCreateTherapist.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockUpdateTherapist.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockDeleteTherapist.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('renders therapist management header', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.manageTherapists')).toBeInTheDocument();
    expect(screen.getByText('therapist.manageTherapistsDescription')).toBeInTheDocument();
  });

  it('shows create button for admin users', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('create-therapist-button')).toBeInTheDocument();
  });

  it('hides create button for non-admin users', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} isAdmin={false} />
      </TestProviders>
    );

    expect(screen.queryByTestId('create-therapist-button')).not.toBeInTheDocument();
  });

  it('displays list of therapists', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.getByText('smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('jones@example.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockListTherapists.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      refetch: jest.fn(),
    });

    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapist-loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockListTherapists.mockReturnValue({
      data: null,
      error: new Error('Failed to load therapists'),
      isLoading: false,
      refetch: jest.fn(),
    });

    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.errorLoadingTherapists')).toBeInTheDocument();
  });

  it('shows empty state when no therapists', () => {
    mockListTherapists.mockReturnValue({
      data: { therapists: [] },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.noTherapists')).toBeInTheDocument();
    expect(screen.getByText('therapist.noTherapistsDescription')).toBeInTheDocument();
  });

  it('opens create dialog when create button is clicked', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const createButton = screen.getByTestId('create-therapist-button');
    fireEvent.click(createButton);

    expect(screen.getByTestId('therapist-form-dialog')).toBeInTheDocument();
  });

  it('opens edit dialog when edit button is clicked', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const editButton = screen.getByTestId('edit-therapist-1');
    fireEvent.click(editButton);

    expect(screen.getByTestId('therapist-form-dialog')).toBeInTheDocument();
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const deleteButton = screen.getByTestId('delete-therapist-1');
    fireEvent.click(deleteButton);

    expect(screen.getByText('therapist.confirmDelete')).toBeInTheDocument();
    expect(screen.getByText('therapist.confirmDeleteDescription')).toBeInTheDocument();
  });

  it('calls delete mutation when delete is confirmed', async () => {
    const mockDeleteMutate = jest.fn();
    mockDeleteTherapist.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });

    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const deleteButton = screen.getByTestId('delete-therapist-1');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('common.delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalledWith({
        therapistId: '1',
        organizationId: 'org-123',
      });
    });
  });

  it('filters therapists by search query', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const searchInput = screen.getByTestId('therapist-search-input');
    fireEvent.change(searchInput, { target: { value: 'Smith' } });

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Jones')).not.toBeInTheDocument();
  });

  it('filters therapists by published status', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const publishedFilter = screen.getByTestId('filter-published');
    fireEvent.click(publishedFilter);

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Jones')).not.toBeInTheDocument();
  });

  it('filters therapists by unpublished status', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const unpublishedFilter = screen.getByTestId('filter-unpublished');
    fireEvent.click(unpublishedFilter);

    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
  });

  it('shows all therapists when All filter is selected', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const allFilter = screen.getByTestId('filter-all');
    fireEvent.click(allFilter);

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
  });

  it('displays therapist languages', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapist-language-ENGLISH-1')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-language-POLISH-2')).toBeInTheDocument();
  });

  it('displays therapy format badges', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapy-format-online-1')).toBeInTheDocument();
    expect(screen.getByTestId('therapy-format-in-person-2')).toBeInTheDocument();
  });

  it('displays published status badges', () => {
    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapist-status-published-1')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-status-draft-2')).toBeInTheDocument();
  });

  it('refreshes data after successful create', async () => {
    const mockRefetch = jest.fn();
    mockListTherapists.mockReturnValue({
      data: { therapists: [] },
      error: null,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(
      <TestProviders>
        <TherapistManagement {...defaultProps} />
      </TestProviders>
    );

    const createButton = screen.getByTestId('create-therapist-button');
    fireEvent.click(createButton);

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});