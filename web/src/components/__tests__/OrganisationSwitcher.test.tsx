import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrganisationSwitcher from '../OrganisationSwitcher';
import { TestProviders } from '../../test-utils/providers';

const mockSetCurrentOrganisation = jest.fn();
const mockRefetchOrganisations = jest.fn();

jest.mock('../../contexts/OrganisationContext', () => ({
  useOrganisation: jest.fn(() => ({
    organisations: [
      { id: '1', name: 'Org 1', memberType: 1 },
      { id: '2', name: 'Org 2', memberType: 2 },
    ],
    currentOrganisation: { id: '1', name: 'Org 1', memberType: 1 },
    loading: false,
    error: null,
    setCurrentOrganisation: mockSetCurrentOrganisation,
    refetchOrganisations: mockRefetchOrganisations,
    isCurrentUserAdmin: jest.fn(() => true),
  })),
}));

describe('OrganisationSwitcher', () => {
  const mockOnCreateOrganisation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays current organization name', () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    expect(screen.getByText('Org 1')).toBeInTheDocument();
  });

  it('opens menu when clicked', () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    const button = screen.getByRole('button', { name: /Org 1/i });
    fireEvent.click(button);

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('shows all organizations in menu', () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    const button = screen.getByRole('button', { name: /Org 1/i });
    fireEvent.click(button);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(3); // 2 orgs + create new
  });

  it('switches organization when different org is selected', async () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    const button = screen.getByRole('button', { name: /Org 1/i });
    fireEvent.click(button);

    const org2Item = screen.getByText('Org 2');
    fireEvent.click(org2Item);

    await waitFor(() => {
      expect(mockSetCurrentOrganisation).toHaveBeenCalledWith({
        id: '2',
        name: 'Org 2',
        memberType: 2,
      });
    });
  });

  it('shows admin badge for admin organizations', () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    expect(screen.getByText('organisation.admin')).toBeInTheDocument();
  });

  it('shows create organization option', () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    const button = screen.getByRole('button', { name: /Org 1/i });
    fireEvent.click(button);

    expect(screen.getByText('organisation.createNew')).toBeInTheDocument();
  });

  it('calls onCreateOrganisation when create new is clicked', () => {
    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    const button = screen.getByRole('button', { name: /Org 1/i });
    fireEvent.click(button);

    const createNewItem = screen.getByText('organisation.createNew');
    fireEvent.click(createNewItem);

    expect(mockOnCreateOrganisation).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const useOrganisation = require('../../contexts/OrganisationContext').useOrganisation;
    useOrganisation.mockReturnValue({
      organisations: [],
      currentOrganisation: null,
      loading: true,
      error: null,
      setCurrentOrganisation: mockSetCurrentOrganisation,
      refetchOrganisations: mockRefetchOrganisations,
      isCurrentUserAdmin: jest.fn(() => false),
    });

    const { container } = render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('handles no organizations gracefully', () => {
    const useOrganisation = require('../../contexts/OrganisationContext').useOrganisation;
    useOrganisation.mockReturnValue({
      organisations: [],
      currentOrganisation: null,
      loading: false,
      error: null,
      setCurrentOrganisation: mockSetCurrentOrganisation,
      refetchOrganisations: mockRefetchOrganisations,
      isCurrentUserAdmin: jest.fn(() => false),
    });

    render(
      <TestProviders>
        <OrganisationSwitcher onCreateOrganisation={mockOnCreateOrganisation} />
      </TestProviders>
    );

    expect(screen.getByText('organisation.noOrganisation')).toBeInTheDocument();
  });
});
