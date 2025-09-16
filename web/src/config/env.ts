/**
 * Centralized environment configuration
 * This is the only file that should reference process.env directly
 */

export interface AppConfig {
  // API URLs
  apiBaseUrl: string;
  apiBaseUrlServer: string;

  // Environment
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;

  // OpenTelemetry
  otelTracesEndpoint: string;

  // Build/Analysis
  bundleAnalyze: string | undefined;
  enableAnalyze: boolean;
}

const config: AppConfig = {
  // API URLs
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  apiBaseUrlServer: process.env.API_BASE_URL || 'http://localhost:8080',

  // Environment
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // OpenTelemetry
  otelTracesEndpoint:
    process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',

  // Build/Analysis
  bundleAnalyze: process.env.BUNDLE_ANALYZE,
  enableAnalyze: process.env.ANALYZE === 'true',
};

export default config;
