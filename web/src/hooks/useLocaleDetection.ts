import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface LocaleDetectionResult {
  detectedLocale: string;
  browserLocale: string;
  isAutoDetected: boolean;
}

/**
 * Hook to detect and manage user's locale preferences
 */
export function useLocaleDetection(): LocaleDetectionResult {
  const router = useRouter();
  const [result, setResult] = useState<LocaleDetectionResult>({
    detectedLocale: router.locale || 'en',
    browserLocale: 'en',
    isAutoDetected: false,
  });

  useEffect(() => {
    // Get browser's preferred language
    const browserLanguage = navigator.language || navigator.languages?.[0] || 'en';

    // Map browser language to our supported locales
    const getBrowserLocale = (lang: string): string => {
      if (lang.startsWith('pl')) return 'pl';
      return 'en'; // Default to English
    };

    const browserLocale = getBrowserLocale(browserLanguage);

    // Check if current locale was auto-detected (no explicit locale in URL)
    const isAutoDetected = !router.asPath.startsWith(`/${router.locale}`);

    setResult({
      detectedLocale: router.locale || 'en',
      browserLocale,
      isAutoDetected,
    });
  }, [router.locale, router.asPath]);

  return result;
}

/**
 * Get Accept-Language header value from browser
 */
export function getAcceptLanguageHeader(): string {
  if (typeof navigator === 'undefined') return 'en';

  const languages = navigator.languages || [navigator.language];
  return languages.join(',');
}
