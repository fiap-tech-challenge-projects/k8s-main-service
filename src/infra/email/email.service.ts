import { Injectable, Logger } from '@nestjs/common'

import { IEmailService } from '@domain/email/interfaces'

/**
 * Email service for sending notifications
 * Completely generic service that can be used across the entire application
 */
@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name)

  /**
   * Creates a new instance of EmailService
   */
  constructor() {}

  /**
   * Send a generic email notification
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param content - Email content (HTML or plain text)
   * @returns Promise that resolves when email is sent
   */
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      this.logger.log(`Sending email to ${to} with subject: ${subject}`)

      // TODO: Implement actual email sending logic
      // For now, just log the email details
      this.logger.log(`Email content: ${content}`)

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 100))

      this.logger.log(`Email sent successfully to ${to}`)
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error)
      throw error
    }
  }

  /**
   * Send a templated email notification
   * @param to - Recipient email address
   * @param template - Email template name
   * @returns Promise that resolves when email is sent
   */
  async sendTemplatedEmail(to: string, template: string): Promise<void> {
    try {
      const { subject, content } = this.generateTemplatedEmail(template)
      await this.sendEmail(to, subject, content)
    } catch (error) {
      this.logger.error(`Failed to send templated email to ${to} with template ${template}:`, error)
      throw error
    }
  }

  /**
   * Generate templated email content
   * @param template - Template name
   * @returns Object with subject and content
   */
  private generateTemplatedEmail(template: string): { subject: string; content: string } {
    // This method should be overridden or extended by domain-specific services
    // For now, throw an error to indicate that templates need to be implemented
    throw new Error(
      `Email template '${template}' not implemented. Use domain-specific email services.`,
    )
  }
}
