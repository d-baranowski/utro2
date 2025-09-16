import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'next-i18next';
import { OfferBrowser } from '../OfferBrowser';

// Mock dependencies
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@connectrpc/connect-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@bufbuild/protobuf', () => ({
  create: jest.fn(),
}));

import { useQuery } from '@connectrpc/connect-query';

const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    'offers.browse': 'Browse Offers',
    'offers.browseSubtitle': 'Discover available services and offers',
    'offers.searchPlaceholder': 'Search offers by name or description...',
    'offers.offersCount': '{{count}} offers available',
    'offers.noOffersAvailable': 'No offers available at the moment',
    'offers.errors.loadFailed': 'Failed to load offers',
    'offers.created': 'Created',
    'therapists.clearFilters': 'Clear Filters',
  };
  return translations[key] || key;
});

const mockOffers = [
  {
    id: '1',
    nameEng: 'Individual Therapy',
    namePl: 'Terapia Indywidualna',
    descriptionEng: 'Professional individual therapy sessions',
    descriptionPl: 'Profesjonalne sesje terapii indywidualnej',
    organisationId: 'org-1',
    organisationName: 'Test Organization',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    nameEng: 'Group Therapy',
    namePl: 'Terapia Grupowa',
    descriptionEng: 'Group therapy sessions',
    descriptionPl: 'Sesje terapii grupowej',
    organisationId: 'org-1',
    organisationName: 'Test Organization',
    createdAt: new Date('2024-01-02'),
  },
];

describe('OfferBrowser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ 
      t: mockT,
      i18n: { language: 'en' }
    });
  });

  it('renders header correctly', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: [] },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser />);

    expect(screen.getByText('Browse Offers')).toBeInTheDocument();
    expect(screen.getByText('Discover available services and offers')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search offers by name or description...')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    render(<OfferBrowser />);

    // Should show loading skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error message when there is an error', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      error: new Error('Network error'),
      isLoading: false,
    });

    render(<OfferBrowser />);

    expect(screen.getByText('Failed to load offers')).toBeInTheDocument();
  });

  it('displays offers correctly', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: mockOffers },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser />);

    expect(screen.getByText('Individual Therapy')).toBeInTheDocument();
    expect(screen.getByText('Group Therapy')).toBeInTheDocument();
    expect(screen.getByText('Professional individual therapy sessions')).toBeInTheDocument();
    expect(screen.getByText('Group therapy sessions')).toBeInTheDocument();
  });

  it('displays organization names when showOrganizationName is true', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: mockOffers },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser showOrganizationName={true} />);

    const orgNames = screen.getAllByText('Test Organization');
    expect(orgNames.length).toBe(2);
  });

  it('shows Polish content when language is Polish', () => {
    (useTranslation as jest.Mock).mockReturnValue({ 
      t: mockT,
      i18n: { language: 'pl' }
    });
    
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: mockOffers },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser />);

    expect(screen.getByText('Terapia Indywidualna')).toBeInTheDocument();
    expect(screen.getByText('Terapia Grupowa')).toBeInTheDocument();
    expect(screen.getByText('Profesjonalne sesje terapii indywidualnej')).toBeInTheDocument();
    expect(screen.getByText('Sesje terapii grupowej')).toBeInTheDocument();
  });

  it('displays no offers message when offers list is empty', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: [] },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser />);

    expect(screen.getByText('No offers available at the moment')).toBeInTheDocument();
  });

  it('displays offers count when offers are available', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: mockOffers },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser />);

    expect(screen.getByText('{{count}} offers available')).toBeInTheDocument();
  });

  it('handles organization-specific filtering', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { offers: mockOffers },
      error: null,
      isLoading: false,
    });

    render(<OfferBrowser organizationId="test-org-id" />);

    // Verify useQuery was called with organization filter
    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organisationId: 'test-org-id',
      }),
      expect.anything()
    );
  });
});