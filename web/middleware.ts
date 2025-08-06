import { NextRequest, NextResponse } from 'next/server';

// Supported locales
const locales = ['en', 'pl'];
const defaultLocale = 'en';

// Language mapping for common Accept-Language header values
const languageMap: { [key: string]: string } = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'en-AU': 'en',
  pl: 'pl',
  'pl-PL': 'pl',
};

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header
  // Format: "en-US,en;q=0.9,pl;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality descending

  // Find the first supported locale
  for (const lang of languages) {
    const mappedLocale = languageMap[lang.code] || languageMap[lang.code.split('-')[0]];
    if (mappedLocale && locales.includes(mappedLocale)) {
      return mappedLocale;
    }
  }

  return defaultLocale;
}

function detectLocaleFromRequest(request: NextRequest): string {
  // 1. Check URL path for explicit locale
  const pathname = request.nextUrl.pathname;
  const pathLocale = pathname.split('/')[1];
  if (locales.includes(pathLocale)) {
    return pathLocale;
  }

  // 2. Check for locale preference in cookies
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  return getLocaleFromAcceptLanguage(acceptLanguage);
}

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, _next static files, and other assets
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Detect locale
  const detectedLocale = detectLocaleFromRequest(request);

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname and detected locale is not default, redirect
  if (!pathnameHasLocale) {
    if (detectedLocale !== defaultLocale) {
      const newUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
      const response = NextResponse.redirect(newUrl);

      // Set locale cookie for future requests
      response.cookies.set('NEXT_LOCALE', detectedLocale, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return response;
    }
  }

  // Add locale information to response headers for debugging
  const response = NextResponse.next();
  response.headers.set('x-detected-locale', detectedLocale);
  response.headers.set('x-accept-language', request.headers.get('accept-language') || 'none');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
