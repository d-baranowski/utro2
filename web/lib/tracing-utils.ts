import { trace, context, propagation, SpanStatusCode, SpanKind } from '@opentelemetry/api';

const tracer = trace.getTracer('utro-web-client', '0.1.0');

export function createSpan(name: string, operation?: () => Promise<any> | any) {
  return tracer.startSpan(name, {
    kind: SpanKind.CLIENT,
  });
}

export async function withSpan<T>(
  name: string,
  operation: () => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return tracer.startActiveSpan(name, { kind: SpanKind.CLIENT }, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }

      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

export function getTraceHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  propagation.inject(context.active(), headers);

  return headers;
}

export function createCustomHeaders(
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...getTraceHeaders(),
    ...additionalHeaders,
  };
}
