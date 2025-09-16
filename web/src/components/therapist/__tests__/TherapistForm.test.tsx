import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TherapistForm } from '../TherapistForm';
import { TestProviders } from '../../../test-utils/providers';

// Mock the UserDropdown component
jest.mock('../../common/UserDropdown', () => ({
  UserDropdown: ({ onChange, value, label, error, helperText }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid="therapist-user-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select User</option>
        <option value="user-1">User 1</option>
        <option value="user-2">User 2</option>
      </select>
      {error && <span>{helperText}</span>}
    </div>
  ),
}));

describe('TherapistForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    open: true,
    organizationId: 'org-123',
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapist-user-select')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-slug-input')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-bio-input')).toBeInTheDocument();
    expect(screen.getByTestId('therapist-language-select')).toBeInTheDocument();
    expect(screen.getByTestId('online-therapy-switch')).toBeInTheDocument();
    expect(screen.getByTestId('in-person-therapy-switch')).toBeInTheDocument();
    expect(screen.getByTestId('publish-therapist-switch')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    const submitButton = screen.getByTestId('therapist-form-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User is required')).toBeInTheDocument();
      expect(screen.getByText('Professional title is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Slug is required')).toBeInTheDocument();
      expect(screen.getByText('At least one language is required')).toBeInTheDocument();
      expect(screen.getByText('At least one therapy format is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    const emailInput = screen.getByTestId('therapist-email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByTestId('therapist-form-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('adds and removes languages', () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    // Select a language
    const languageSelect = screen.getByTestId('therapist-language-select');
    fireEvent.mouseDown(languageSelect);

    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    // Add the language
    const addButton = screen.getByTestId('add-language-button');
    fireEvent.click(addButton);

    // Check language chip appears
    expect(screen.getByTestId('language-chip-ENGLISH')).toBeInTheDocument();

    // Remove the language
    const deleteButton = screen.getByTestId('delete-language-ENGLISH');
    fireEvent.click(deleteButton);

    // Check language chip is removed
    expect(screen.queryByTestId('language-chip-ENGLISH')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    // Fill in required fields
    const userSelect = screen.getByTestId('therapist-user-select');
    fireEvent.change(userSelect, { target: { value: 'user-1' } });

    const titleInput = screen.getByTestId('therapist-title-input');
    fireEvent.change(titleInput, { target: { value: 'Dr. Test Therapist' } });

    const slugInput = screen.getByTestId('therapist-slug-input');
    fireEvent.change(slugInput, { target: { value: 'dr-test-therapist' } });

    const emailInput = screen.getByTestId('therapist-email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Add a language
    const languageSelect = screen.getByTestId('therapist-language-select');
    fireEvent.mouseDown(languageSelect);
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    const addButton = screen.getByTestId('add-language-button');
    fireEvent.click(addButton);

    // Enable online therapy
    const onlineSwitch = screen.getByTestId('online-therapy-switch');
    fireEvent.click(onlineSwitch);

    // Submit form
    const submitButton = screen.getByTestId('therapist-form-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        userId: 'user-1',
        professionalTitle: 'Dr. Test Therapist',
        bio: '',
        contactPhone: '',
        contactEmail: 'test@example.com',
        isPublished: false,
        slug: 'dr-test-therapist',
        languages: ['ENGLISH'],
        supportsOnlineTherapy: true,
        supportsInPersonTherapy: false,
      });
    });
  });

  it('populates form when editing existing therapist', () => {
    const existingTherapist = {
      id: '123',
      userId: 'user-1',
      professionalTitle: 'Dr. Existing',
      bio: 'Experienced therapist',
      contactPhone: '+1234567890',
      contactEmail: 'existing@example.com',
      isPublished: true,
      slug: 'dr-existing',
      languages: ['ENGLISH', 'POLISH'],
      supportsOnlineTherapy: true,
      supportsInPersonTherapy: true,
    };

    render(
      <TestProviders>
        <TherapistForm {...defaultProps} therapist={existingTherapist} />
      </TestProviders>
    );

    expect(screen.getByTestId('therapist-user-select')).toHaveValue('user-1');
    expect(screen.getByTestId('therapist-title-input')).toHaveValue('Dr. Existing');
    expect(screen.getByTestId('therapist-bio-input')).toHaveValue('Experienced therapist');
    expect(screen.getByTestId('therapist-phone-input')).toHaveValue('+1234567890');
    expect(screen.getByTestId('therapist-email-input')).toHaveValue('existing@example.com');
    expect(screen.getByTestId('therapist-slug-input')).toHaveValue('dr-existing');

    // Check languages are displayed
    expect(screen.getByTestId('language-chip-ENGLISH')).toBeInTheDocument();
    expect(screen.getByTestId('language-chip-POLISH')).toBeInTheDocument();

    // Check switches
    expect(screen.getByTestId('online-therapy-switch')).toBeChecked();
    expect(screen.getByTestId('in-person-therapy-switch')).toBeChecked();
    expect(screen.getByTestId('publish-therapist-switch')).toBeChecked();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    const cancelButton = screen.getByTestId('therapist-form-cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables user selection when editing', () => {
    const existingTherapist = {
      id: '123',
      userId: 'user-1',
      professionalTitle: 'Dr. Existing',
      bio: '',
      contactPhone: '',
      contactEmail: 'existing@example.com',
      isPublished: false,
      slug: 'dr-existing',
      languages: ['ENGLISH'],
      supportsOnlineTherapy: true,
      supportsInPersonTherapy: false,
    };

    render(
      <TestProviders>
        <TherapistForm {...defaultProps} therapist={existingTherapist} />
      </TestProviders>
    );

    const userSelect = screen.getByTestId('therapist-user-select');
    expect(userSelect).toBeDisabled();
  });

  it('requires at least one therapy format', async () => {
    render(
      <TestProviders>
        <TherapistForm {...defaultProps} />
      </TestProviders>
    );

    // Fill in other required fields
    const userSelect = screen.getByTestId('therapist-user-select');
    fireEvent.change(userSelect, { target: { value: 'user-1' } });

    const titleInput = screen.getByTestId('therapist-title-input');
    fireEvent.change(titleInput, { target: { value: 'Dr. Test' } });

    const slugInput = screen.getByTestId('therapist-slug-input');
    fireEvent.change(slugInput, { target: { value: 'dr-test' } });

    const emailInput = screen.getByTestId('therapist-email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Add a language
    const languageSelect = screen.getByTestId('therapist-language-select');
    fireEvent.mouseDown(languageSelect);
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    const addButton = screen.getByTestId('add-language-button');
    fireEvent.click(addButton);

    // Don't enable any therapy format
    // Submit form
    const submitButton = screen.getByTestId('therapist-form-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('At least one therapy format is required')).toBeInTheDocument();
    });
  });
});
