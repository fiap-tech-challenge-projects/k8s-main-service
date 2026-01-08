import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { PUBLIC } from '@shared/decorators'

/**
 * Welcome controller for API information and health checks.
 */
@ApiTags('Welcome')
@Controller()
export class WelcomeController {
  /**
   * Get API welcome information and available endpoints.
   *
   * @returns Object with API information and available endpoints
   */
  @Get()
  @PUBLIC()
  @ApiOperation({ summary: 'Get API welcome information' })
  @ApiResponse({ status: 200, description: 'Welcome information retrieved successfully' })
  getWelcome(): Record<string, unknown> {
    return {
      message: 'Welcome to FIAP Tech Challenge API',
      version: '1.0.0',
      description:
        'A comprehensive API for managing clients and services with advanced metrics tracking',
      timestamp: new Date().toISOString(),
      endpoints: {
        welcome: {
          description: 'API welcome information',
          method: 'GET',
          path: '/',
        },
        clients: {
          description: 'Client management endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/clients',
        },
        vehicles: {
          description: 'Vehicle management endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/vehicles',
        },
        services: {
          description: 'Service catalog management endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/services',
        },
        employees: {
          description: 'Employee management endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/employees',
        },
        stock: {
          description: 'Stock and inventory management endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/stock',
        },
        serviceOrders: {
          description: 'Service order management endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/service-orders',
        },
        serviceExecutions: {
          description: 'Service execution tracking endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/service-executions',
        },
        vehicleEvaluations: {
          description: 'Vehicle evaluation and assessment endpoints',
          method: 'GET, POST, PUT, DELETE',
          path: '/v1/vehicle-evaluations',
        },
        metrics: {
          description: 'Metrics and monitoring endpoints',
          method: 'GET, DELETE',
          path: '/v1/metrics',
          subEndpoints: {
            raw: { path: '/v1/metrics', description: 'Get raw metrics data' },
            summary: { path: '/v1/metrics/summary', description: 'Get metrics summary' },
            meanTimes: { path: '/v1/metrics/mean-times', description: 'Get mean execution times' },
            status: { path: '/v1/metrics/status', description: 'Get service status' },
            reset: { path: '/v1/metrics', method: 'DELETE', description: 'Reset metrics data' },
          },
        },
        documentation: {
          description: 'API documentation',
          method: 'GET',
          path: '/api-docs',
        },
      },
      features: [
        'Client management with full CRUD operations',
        'Vehicle management and tracking',
        'Service catalog management',
        'Employee management and roles',
        'Stock and inventory management',
        'Service order processing',
        'Service execution tracking',
        'Vehicle evaluation and assessment',
        'Advanced metrics tracking with configurable backends',
        'Mean execution time monitoring',
        'Prometheus integration ready',
        'Comprehensive API documentation',
        'Environment-based configuration',
      ],
      environment: process.env.NODE_ENV ?? 'development',
    }
  }

  /**
   * Get API health status.
   *
   * @returns Object with health status
   */
  @Get('health')
  @ApiOperation({ summary: 'Get API health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  getHealth(): Record<string, unknown> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      version: '1.0.0',
    }
  }

  /**
   * Get API information.
   *
   * @returns Object with API information
   */
  @Get('info')
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information retrieved successfully' })
  getInfo(): Record<string, unknown> {
    return {
      name: 'FIAP Tech Challenge API',
      version: '1.0.0',
      description:
        'A comprehensive API for managing clients and services with advanced metrics tracking',
      author: 'FIAP Tech Challenge Team',
      repository: 'https://github.com/fiap/tech-challenge',
      documentation: '/api-docs',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    }
  }
}
