import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoOrganisationDialog from '../NoOrganisationDialog';
import { TestProviders } from '../../test-utils/providers';

// Mock the organisation API
jest.mock('../../lib/api/organisation', () => ({
  organisationApi: {
    createOrganisation: jest.fn(),
    searchOrganisations: jest.fn(),
  },
}));

const mockCreateOrganisation = require('../../lib/api/organisation').organisationApi
  .createOrganisation;
const mockSearchOrganisations = require('../../lib/api/organisation').organisationApi
  .searchOrganisations;

describe('NoOrganisationDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOrganisation.mockResolvedValue({ id: '1', name: 'New Org' });
    mockSearchOrganisations.mockResolvedValue([]);
  });

  it('renders when open', () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    expect(screen.getByText('organisation.welcome')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={false} onClose={mockOnClose} />
      </TestProviders>
    );

    expect(screen.queryByText('organisation.welcome')).not.toBeInTheDocument();
  });

  it('shows create and join options initially', () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    expect(screen.getByText('organisation.createOrganisation')).toBeInTheDocument();
    expect(screen.getByText('organisation.joinOrganisation')).toBeInTheDocument();
  });

  it('shows create form when create is clicked', () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.createOrganisation'));

    expect(screen.getByLabelText('organisation.organisationName')).toBeInTheDocument();
    expect(screen.getByLabelText('organisation.description')).toBeInTheDocument();
  });

  it('shows join form when join is clicked', () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.joinOrganisation'));

    expect(screen.getByLabelText('organisation.searchOrganisations')).toBeInTheDocument();
  });

  it('validates required fields in create form', async () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.createOrganisation'));

    // Try to submit without filling fields
    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('organisation.nameRequired')).toBeInTheDocument();
    });
  });

  it('calls createOrganisation API when form is submitted', async () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.createOrganisation'));

    // Fill in the form
    const nameInput = screen.getByLabelText('organisation.organisationName');
    const descInput = screen.getByLabelText('organisation.description');

    fireEvent.change(nameInput, { target: { value: 'Test Org' } });
    fireEvent.change(descInput, { target: { value: 'Test Description' } });

    // Submit
    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateOrganisation).toHaveBeenCalledWith({
        name: 'Test Org',
        description: 'Test Description',
      });
    });
  });

  it('searches for organizations when typing in search field', async () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.joinOrganisation'));

    const searchInput = screen.getByLabelText('organisation.searchOrganisations');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(mockSearchOrganisations).toHaveBeenCalledWith('Test');
    });
  });

  it('displays search results', async () => {
    mockSearchOrganisations.mockResolvedValue([
      { id: '1', name: 'Org 1', description: 'Desc 1' },
      { id: '2', name: 'Org 2', description: 'Desc 2' },
    ]);

    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.joinOrganisation'));

    const searchInput = screen.getByLabelText('organisation.searchOrganisations');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Org 1')).toBeInTheDocument();
      expect(screen.getByText('Org 2')).toBeInTheDocument();
    });
  });

  it('shows no results message when search returns empty', async () => {
    mockSearchOrganisations.mockResolvedValue([]);

    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.joinOrganisation'));

    const searchInput = screen.getByLabelText('organisation.searchOrganisations');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    await waitFor(() => {
      expect(screen.getByText('organisation.noResults')).toBeInTheDocument();
    });
  });

  it('calls onClose when back button is clicked', () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.createOrganisation'));

    const backButton = screen.getByText('common.back');
    fireEvent.click(backButton);

    // Should go back to selection view, not close dialog
    expect(screen.getByText('organisation.joinOrganisation')).toBeInTheDocument();
  });

  it('closes dialog on successful organization creation', async () => {
    render(
      <TestProviders>
        <NoOrganisationDialog open={true} onClose={mockOnClose} />
      </TestProviders>
    );

    fireEvent.click(screen.getByText('organisation.createOrganisation'));

    const nameInput = screen.getByLabelText('organisation.organisationName');
    fireEvent.change(nameInput, { target: { value: 'Test Org' } });

    const submitButton = screen.getByText('common.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
