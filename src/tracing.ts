/* eslint-disable @typescript-eslint/naming-convention */
/**
 * OpenTelemetry SDK Configuration
 * Must be imported first in main.ts before any other imports
 */
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'

const SERVICE_NAME = process.env.SERVICE_NAME ?? 'k8s-main-service'
const SERVICE_VERSION = process.env.SERVICE_VERSION ?? '1.0.0'
const ENVIRONMENT = process.env.ENVIRONMENT ?? 'development'
const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'

const RESOURCE = new Resource({
  'service.name': SERVICE_NAME,
  'service.version': SERVICE_VERSION,
  'deployment.environment': ENVIRONMENT,
})

const TRACE_EXPORTER = new OTLPTraceExporter({
  url: `${OTLP_ENDPOINT}/v1/traces`,
})

const METRIC_EXPORTER = new OTLPMetricExporter({
  url: `${OTLP_ENDPOINT}/v1/metrics`,
})

const METRIC_READER = new PeriodicExportingMetricReader({
  exporter: METRIC_EXPORTER,
  exportIntervalMillis: 60000,
})

const SDK = new NodeSDK({
  resource: RESOURCE,
  traceExporter: TRACE_EXPORTER,
  // @ts-expect-error - Version mismatch between sdk-metrics packages
  metricReader: METRIC_READER,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable fs instrumentation to reduce noise
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
})

SDK.start()

process.on('SIGTERM', () => {
  SDK.shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((error: unknown) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0))
})

export default SDK
