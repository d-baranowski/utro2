import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import { TestProviders } from '../../test-utils/providers';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    locale: 'en',
    locales: ['en', 'pl'],
    defaultLocale: 'en',
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default variant', () => {
    it('renders button with current language', () => {
      render(
        <TestProviders>
          <LanguageSwitcher />
        </TestProviders>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('opens menu when clicked', () => {
      render(
        <TestProviders>
          <LanguageSwitcher />
        </TestProviders>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows all available languages in menu', () => {
      render(
        <TestProviders>
          <LanguageSwitcher />
        </TestProviders>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Polski')).toBeInTheDocument();
      // English is already shown in button
      expect(screen.getAllByText('English')).toHaveLength(2);
    });

    it('switches language when different language is selected', () => {
      render(
        <TestProviders>
          <LanguageSwitcher />
        </TestProviders>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const polishOption = screen.getByText('Polski');
      fireEvent.click(polishOption);

      expect(mockPush).toHaveBeenCalledWith('/', '/', { locale: 'pl' });
    });

    it('shows Polish as current when locale is pl', () => {
      const useRouter = require('next/router').useRouter;
      useRouter.mockReturnValue({
        push: mockPush,
        pathname: '/',
        route: '/',
        query: {},
        asPath: '/',
        locale: 'pl',
        locales: ['en', 'pl'],
        defaultLocale: 'en',
      });

      render(
        <TestProviders>
          <LanguageSwitcher />
        </TestProviders>
      );

      expect(screen.getByText('Polski')).toBeInTheDocument();
      expect(screen.getByText('🇵🇱')).toBeInTheDocument();
    });
  });

  describe('Icon variant', () => {
    it('renders only flag icon', () => {
      render(
        <TestProviders>
          <LanguageSwitcher variant="icon" />
        </TestProviders>
      );

      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('switches language when clicked in icon mode', () => {
      render(
        <TestProviders>
          <LanguageSwitcher variant="icon" />
        </TestProviders>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const polishOption = screen.getByText('Polski');
      fireEvent.click(polishOption);

      expect(mockPush).toHaveBeenCalledWith('/', '/', { locale: 'pl' });
    });
  });

  it('preserves query parameters when switching languages', () => {
    const useRouter = require('next/router').useRouter;
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: '/therapists',
      route: '/therapists',
      query: { filter: 'active' },
      asPath: '/therapists?filter=active',
      locale: 'en',
      locales: ['en', 'pl'],
      defaultLocale: 'en',
    });

    render(
      <TestProviders>
        <LanguageSwitcher />
      </TestProviders>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const polishOption = screen.getByText('Polski');
    fireEvent.click(polishOption);

    expect(mockPush).toHaveBeenCalledWith(
      '/therapists?filter=active',
      '/therapists?filter=active',
      { locale: 'pl' }
    );
  });

  it('handles missing locale gracefully', () => {
    const useRouter = require('next/router').useRouter;
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
      route: '/',
      query: {},
      asPath: '/',
      locale: undefined,
      locales: ['en', 'pl'],
      defaultLocale: 'en',
    });

    render(
      <TestProviders>
        <LanguageSwitcher />
      </TestProviders>
    );

    // Should default to English
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('disables current language in menu', () => {
    render(
      <TestProviders>
        <LanguageSwitcher />
      </TestProviders>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const menuItems = screen.getAllByRole('menuitem');
    const englishItem = menuItems.find(item => item.textContent?.includes('English'));
    
    expect(englishItem).toHaveAttribute('aria-disabled', 'true');
  });
});