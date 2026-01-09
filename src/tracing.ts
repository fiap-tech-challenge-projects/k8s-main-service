/* eslint-disable import/order */
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

/**
 * Initialize OpenTelemetry SDK for distributed tracing and metrics collection.
 * This module sets up automatic instrumentation for Node.js applications
 * and exports traces/metrics to SigNoz via OTLP protocol.
 *
 * @returns The initialized NodeSDK instance
 */
const INITIALIZE_TRACING = (): NodeSDK => {
  const otelExporterUrl =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://signoz-otel-collector.signoz:4318'

  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'fiap-main-service'
  const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? '1.0.0'
  const serviceNamespace = process.env.OTEL_SERVICE_NAMESPACE ?? 'fiap-tech'
  const environment = process.env.NODE_ENV ?? 'development'

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: serviceNamespace,
      environment,
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${otelExporterUrl}/v1/traces`,
    }),
    // @ts-expect-error - SDK type issue with PeriodicExportingMetricReader
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${otelExporterUrl}/v1/metrics`,
      }),
      // @ts-expect-error - intervalMillis is valid but not typed correctly in the SDK
      intervalMillis: 10000,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  })

  sdk.start()

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => {
        console.log('OpenTelemetry SDK shutdown successfully')
        process.exit(0)
      })
      .catch((error) => {
        console.error('Error shutting down OpenTelemetry SDK:', error)
        process.exit(1)
      })
  })

  return sdk
}

export default INITIALIZE_TRACING()
