import { Controller, Get, Delete, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'
import { MetricsService } from '@shared/services'

/**
 * Controller for metrics endpoints.
 */
@ApiTags('Metrics')
@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MetricsController {
  /**
   * Creates a new MetricsController instance.
   *
   * @param metricsService - The metrics service for retrieving metrics data
   */
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Get metrics in raw format.
   *
   * @returns Promise resolving to raw metrics string
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get metrics in raw format' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(): Promise<string> {
    return await this.metricsService.getMetrics()
  }

  /**
   * Get metrics summary.
   *
   * @returns Promise resolving to metrics summary object
   */
  @Get('summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get metrics summary' })
  @ApiResponse({ status: 200, description: 'Metrics summary retrieved successfully' })
  async getMetricsSummary(): Promise<Record<string, unknown>> {
    return await this.metricsService.getMetricsSummary()
  }

  /**
   * Get mean execution times for all tracked operations.
   *
   * @returns Promise resolving to mean execution times object
   */
  @Get('mean-times')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get mean execution times for all tracked operations' })
  @ApiResponse({ status: 200, description: 'Mean execution times retrieved successfully' })
  async getMeanExecutionTimes(): Promise<Record<string, number>> {
    return await this.metricsService.getMeanExecutionTimes()
  }

  /**
   * Get metrics service status and configuration.
   *
   * @returns Object with service status and configuration
   */
  @Get('status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get metrics service status' })
  @ApiResponse({ status: 200, description: 'Service status retrieved successfully' })
  getStatus(): Record<string, unknown> {
    return {
      enabled: this.metricsService.isEnabled(),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Reset all metrics data.
   *
   * @returns Object with reset message
   */
  @Delete()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reset all metrics' })
  @ApiResponse({ status: 200, description: 'Metrics reset successfully' })
  resetMetrics(): { message: string } {
    this.metricsService.reset()
    return { message: 'Metrics reset successfully' }
  }
}
