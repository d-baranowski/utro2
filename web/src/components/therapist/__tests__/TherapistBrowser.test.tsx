import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TherapistBrowser } from '../TherapistBrowser';
import { TestProviders } from '../../../test-utils/providers';

// Mock the Connect Query hooks
const mockListTherapists = jest.fn();

jest.mock('@connectrpc/connect-query', () => ({
  useQuery: jest.fn((queryFn) => {
    if (queryFn.name === 'listTherapists' || queryFn.name === 'listPublishedTherapists') {
      return mockListTherapists();
    }
    return { data: null, error: null, isLoading: false };
  }),
}));

describe('TherapistBrowser', () => {
  const defaultProps = {
    organisationId: 'org-123',
    showFilters: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockListTherapists.mockReturnValue({
      data: {
        therapists: [
          {
            id: '1',
            userId: 'user-1',
            professionalTitle: 'Dr. Smith',
            bio: 'Experienced therapist specializing in anxiety',
            contactEmail: 'smith@example.com',
            slug: 'dr-smith',
            isPublished: true,
            languages: ['ENGLISH', 'SPANISH'],
            supportsOnlineTherapy: true,
            supportsInPersonTherapy: false,
          },
          {
            id: '2',
            userId: 'user-2',
            professionalTitle: 'Dr. Jones',
            bio: 'Child psychology specialist',
            contactEmail: 'jones@example.com',
            slug: 'dr-jones',
            isPublished: true,
            languages: ['POLISH'],
            supportsOnlineTherapy: false,
            supportsInPersonTherapy: true,
          },
          {
            id: '3',
            userId: 'user-3',
            professionalTitle: 'Dr. Brown',
            bio: 'Couples therapy expert',
            contactEmail: 'brown@example.com',
            slug: 'dr-brown',
            isPublished: true,
            languages: ['ENGLISH', 'FRENCH'],
            supportsOnlineTherapy: true,
            supportsInPersonTherapy: true,
          },
        ],
      },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  it('renders therapist browser header', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.browseTherapists')).toBeInTheDocument();
    expect(screen.getByText('therapist.findPerfectTherapist')).toBeInTheDocument();
  });

  it('displays list of therapists as cards', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapist-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-card-3')).toBeInTheDocument();

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
  });

  it('shows therapist bio in cards', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('Experienced therapist specializing in anxiety')).toBeInTheDocument();
    expect(screen.getByText('Child psychology specialist')).toBeInTheDocument();
    expect(screen.getByText('Couples therapy expert')).toBeInTheDocument();
  });

  it('displays therapist languages', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getAllByText('English')).toHaveLength(2); // Dr. Smith and Dr. Brown
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('Polish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it('displays therapy format icons', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('online-therapy-icon-1')).toBeInTheDocument();
    expect(screen.getByTestId('in-person-therapy-icon-2')).toBeInTheDocument();
    expect(screen.getByTestId('online-therapy-icon-3')).toBeInTheDocument();
    expect(screen.getByTestId('in-person-therapy-icon-3')).toBeInTheDocument();
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
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    // Should show multiple skeleton cards
    const skeletons = screen.getAllByTestId(/therapist-skeleton-/);
    expect(skeletons).toHaveLength(6); // Default skeleton count
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
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.errorLoadingTherapists')).toBeInTheDocument();
    expect(screen.getByText('therapist.errorLoadingTherapistsDescription')).toBeInTheDocument();
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
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.noTherapistsAvailable')).toBeInTheDocument();
    expect(screen.getByText('therapist.noTherapistsAvailableDescription')).toBeInTheDocument();
  });

  it('filters therapists by search query', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const searchInput = screen.getByTestId('therapist-search-input');
    fireEvent.change(searchInput, { target: { value: 'anxiety' } });

    // Should only show Dr. Smith who mentions anxiety
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Jones')).not.toBeInTheDocument();
    expect(screen.queryByText('Dr. Brown')).not.toBeInTheDocument();
  });

  it('filters therapists by language', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const languageFilter = screen.getByTestId('language-filter');
    fireEvent.mouseDown(languageFilter);

    const polishOption = screen.getByText('language.polish');
    fireEvent.click(polishOption);

    // Should only show Dr. Jones who speaks Polish
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Brown')).not.toBeInTheDocument();
  });

  it('filters therapists by online therapy support', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const onlineFilter = screen.getByTestId('online-therapy-filter');
    fireEvent.click(onlineFilter);

    // Should show Dr. Smith and Dr. Brown who support online therapy
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Jones')).not.toBeInTheDocument();
    expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
  });

  it('filters therapists by in-person therapy support', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const inPersonFilter = screen.getByTestId('in-person-therapy-filter');
    fireEvent.click(inPersonFilter);

    // Should show Dr. Jones and Dr. Brown who support in-person therapy
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
  });

  it('combines multiple filters', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    // Filter by English language
    const languageFilter = screen.getByTestId('language-filter');
    fireEvent.mouseDown(languageFilter);
    const englishOption = screen.getByText('language.english');
    fireEvent.click(englishOption);

    // And online therapy
    const onlineFilter = screen.getByTestId('online-therapy-filter');
    fireEvent.click(onlineFilter);

    // Should show Dr. Smith and Dr. Brown (both speak English and support online)
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Jones')).not.toBeInTheDocument();
    expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
  });

  it('clears filters', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    // Apply a filter
    const searchInput = screen.getByTestId('therapist-search-input');
    fireEvent.change(searchInput, { target: { value: 'anxiety' } });

    // Should only show Dr. Smith
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Jones')).not.toBeInTheDocument();

    // Clear the filter
    const clearButton = screen.getByTestId('clear-search');
    fireEvent.click(clearButton);

    // Should show all therapists again
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
  });

  it('hides filters when showFilters is false', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} showFilters={false} />
      </TestProviders>
    );

    expect(screen.queryByTestId('therapist-search-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('language-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('online-therapy-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('in-person-therapy-filter')).not.toBeInTheDocument();
  });

  it('opens therapist detail dialog when card is clicked', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const therapistCard = screen.getByTestId('therapist-card-1');
    fireEvent.click(therapistCard);

    expect(screen.getByTestId('therapist-detail-dialog')).toBeInTheDocument();
    expect(screen.getByText('therapist.viewProfile')).toBeInTheDocument();
  });

  it('displays contact button on therapist cards', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const contactButtons = screen.getAllByText('therapist.contactTherapist');
    expect(contactButtons).toHaveLength(3); // One for each therapist
  });

  it('handles contact button click', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    const contactButton = screen.getAllByText('therapist.contactTherapist')[0];
    fireEvent.click(contactButton);

    // Should open email client
    expect(window.location.href).toContain('mailto:smith@example.com');
  });

  it('shows result count', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('therapist.showingResults')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total count
  });

  it('updates result count when filtering', () => {
    render(
      <TestProviders>
        <TherapistBrowser {...defaultProps} />
      </TestProviders>
    );

    // Apply a filter
    const onlineFilter = screen.getByTestId('online-therapy-filter');
    fireEvent.click(onlineFilter);

    // Should show 2 results (Dr. Smith and Dr. Brown)
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});