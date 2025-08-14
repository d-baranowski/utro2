import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { trace } from '@opentelemetry/api';
import config from '../src/config/env';

let isInitialized = false;

export function initializeTelemetry() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'utro-web',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'utro',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.nodeEnv,
  });

  const traceExporter = new OTLPTraceExporter({
    url: config.otelTracesEndpoint,
    headers: {},
  });

  const provider = new WebTracerProvider({
    resource,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

  provider.register();

  trace.setGlobalTracerProvider(provider);

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-document-load': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-user-interaction': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-fetch': {
          enabled: true,
          propagateTraceHeaderCorsUrls: [
            /^http:\/\/localhost:8080\/.*/,
            /^https:\/\/api\.utro\.com\/.*/,
          ],
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          enabled: true,
          propagateTraceHeaderCorsUrls: [
            /^http:\/\/localhost:8080\/.*/,
            /^https:\/\/api\.utro\.com\/.*/,
          ],
        },
      }),
    ],
  });

  isInitialized = true;

  console.log('OpenTelemetry initialized successfully');
}
