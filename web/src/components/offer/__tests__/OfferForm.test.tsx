import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'next-i18next';
import { OfferForm, OfferFormData } from '../OfferForm';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    'offers.createOffer': 'Create Offer',
    'offers.editOffer': 'Edit Offer',
    'offers.nameEng': 'Name (English)',
    'offers.namePl': 'Name (Polish)',
    'offers.descriptionEng': 'Description (English)',
    'offers.descriptionPl': 'Description (Polish)',
    'offers.profileImage': 'Profile Image',
    'offers.errors.nameRequired': 'Offer name is required in at least one language',
    'offers.errors.descriptionRequired': 'Description is required in at least one language',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.loading': 'Loading...',
  };
  return translations[key] || key;
});

describe('OfferForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    mode: 'create' as const,
    organizationId: 'test-org-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders create mode correctly', () => {
    render(<OfferForm {...defaultProps} />);

    expect(screen.getByText('Create Offer')).toBeInTheDocument();
    expect(screen.getByLabelText('Name (English)')).toBeInTheDocument();
    expect(screen.getByLabelText('Name (Polish)')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (English)')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Polish)')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    const initialData: OfferFormData = {
      id: 'test-id',
      nameEng: 'Test Offer',
      namePl: 'Testowa Oferta',
      descriptionEng: 'Test description',
      descriptionPl: 'Testowy opis',
    };

    render(
      <OfferForm
        {...defaultProps}
        mode="edit"
        initialData={initialData}
      />
    );

    expect(screen.getByText('Edit Offer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Offer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Testowa Oferta')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Testowy opis')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('validates form submission with empty fields', async () => {
    render(<OfferForm {...defaultProps} />);

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Offer name is required in at least one language')).toHaveLength(2);
      expect(screen.getAllByText('Description is required in at least one language')).toHaveLength(2);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<OfferForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Name (English)'), {
      target: { value: 'Test Offer' },
    });
    fireEvent.change(screen.getByLabelText('Description (English)'), {
      target: { value: 'Test description' },
    });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        nameEng: 'Test Offer',
        namePl: '',
        descriptionEng: 'Test description',
        descriptionPl: '',
      });
    });
  });

  it('clears errors when user starts typing', async () => {
    render(<OfferForm {...defaultProps} />);

    // Trigger validation errors
    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Offer name is required in at least one language')).toHaveLength(2);
    });

    // Start typing in name field
    fireEvent.change(screen.getByLabelText('Name (English)'), {
      target: { value: 'T' },
    });

    await waitFor(() => {
      const errorElements = screen.queryAllByText('Offer name is required in at least one language');
      expect(errorElements.length).toBeLessThan(2);
    });
  });

  it('closes form when cancel is clicked', () => {
    render(<OfferForm {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close when loading', () => {
    // Mock a slow submission
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<OfferForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Name (English)'), {
      target: { value: 'Test Offer' },
    });
    fireEvent.change(screen.getByLabelText('Description (English)'), {
      target: { value: 'Test description' },
    });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Cancel should be disabled
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });
});