import { Logger } from '@nestjs/common'

import { GetClientByIdUseCase } from '@application/clients/use-cases'
import { ServiceExecutionCompletedEvent } from '@domain/service-executions/events'
import { EventHandler } from '@shared/events'

/**
 * Event handler for ServiceExecutionCompletedEvent
 * Sends notifications when a service execution is completed
 */
export class ServiceExecutionCompletedHandler implements EventHandler<ServiceExecutionCompletedEvent> {
  /**
   * Logger instance for this handler
   */
  private readonly logger = new Logger(ServiceExecutionCompletedHandler.name)

  /**
   * Creates a new ServiceExecutionCompletedHandler
   * @param emailService - Service for email operations
   * @param getClientByIdUseCase - Use case for getting client by ID
   */
  constructor(
    private readonly emailService: unknown, // TODO: Replace with proper interface when email service is available
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
  ) {}

  /**
   * Handle ServiceExecutionCompletedEvent
   * @param event - The service execution completed event
   */
  async handle(event: ServiceExecutionCompletedEvent): Promise<void> {
    const { data } = event
    const { serviceOrderId, clientId, completedAt, durationInMinutes } = data as {
      serviceOrderId: string
      mechanicId?: string
      clientId: string
      completedAt: Date
      durationInMinutes?: number
    }

    try {
      const clientResult = await this.getClientByIdUseCase.execute(clientId)
      if (!clientResult.isSuccess) {
        this.logger.warn(
          `Client ${clientId} not found for service execution completion notification: ${clientResult.error.message}`,
        )
        return
      }

      await this.sendCompletionNotification(clientResult.value, {
        serviceOrderId,
        completedAt,
        durationInMinutes,
      })

      this.logger.log(
        `Completion notification sent to client ${clientId} for service order ${serviceOrderId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to send completion notification for service order ${serviceOrderId}:`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Send completion notification to client
   * @param client - The client information
   * @param client.name - The client's name
   * @param client.email - The client's email address
   * @param serviceInfo - The service completion information
   * @param serviceInfo.serviceOrderId - The service order ID
   * @param serviceInfo.completedAt - The completion timestamp
   * @param serviceInfo.durationInMinutes - The service duration in minutes
   */
  private async sendCompletionNotification(
    client: { name: string; email: string },
    serviceInfo: {
      serviceOrderId: string
      completedAt: Date
      durationInMinutes?: number
    },
  ): Promise<void> {
    const { serviceOrderId, completedAt, durationInMinutes } = serviceInfo

    const subject = 'Service Completed - Your Vehicle is Ready'
    const message = `
      Dear ${client.name},

      Your service has been completed successfully!

      Service Order ID: ${serviceOrderId}
      Completion Date: ${completedAt.toLocaleDateString()}
      Completion Time: ${completedAt.toLocaleTimeString()}
      ${durationInMinutes ? `Service Duration: ${durationInMinutes} minutes` : ''}

      Your vehicle is ready for pickup. Please contact us to arrange delivery.

      Thank you for choosing our service!

      Best regards,
      The Workshop Team
    `

    // TODO: Implement actual email sending when email service is available
    this.logger.log(`Email notification would be sent to ${client.email}:`, { subject, message })
  }

  /**
   * Get the event type this handler can handle
   * @returns The event type string
   */
  getEventType(): string {
    return 'ServiceExecutionCompleted'
  }
}
