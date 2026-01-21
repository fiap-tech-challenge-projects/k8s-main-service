import { Injectable, Inject } from '@nestjs/common'

import { ClientResponseDto } from '@application/clients/dto'
import { IEmailService, EMAIL_SERVICE } from '@domain/email/interfaces'

/**
 * Budget-specific email service
 * Extends the generic EmailService with budget-specific email templates
 */
@Injectable()
export class BudgetEmailService {
  /**
   * Creates a new instance of BudgetEmailService
   * @param emailService - Generic email service for sending emails
   */
  constructor(@Inject(EMAIL_SERVICE) private readonly emailService: IEmailService) {}

  /**
   * Send budget to client for approval
   * @param client - Client information
   * @param budgetId - Budget ID
   * @param budgetTotal - Budget total amount
   * @param validityPeriod - Budget validity period
   * @returns Promise that resolves when email is sent
   */
  async sendBudgetToClient(
    client: ClientResponseDto,
    budgetId: string,
    budgetTotal: string,
    validityPeriod: number,
  ): Promise<void> {
    const subject = 'Budget for Your Approval - Service Request'
    const content = this.generateBudgetForApprovalEmail(
      client,
      budgetId,
      budgetTotal,
      validityPeriod,
    )

    await this.emailService.sendEmail(client.email, subject, content)
  }

  /**
   * Send budget approval notification to client
   * @param client - Client information
   * @param budgetId - Budget ID
   * @param budgetTotal - Budget total amount
   * @returns Promise that resolves when email is sent
   */
  async sendBudgetApprovalNotification(
    client: ClientResponseDto,
    budgetId: string,
    budgetTotal: string,
  ): Promise<void> {
    const subject = 'Budget Approval - Your Service Request'
    const content = this.generateBudgetApprovedEmail(client, budgetId, budgetTotal)

    await this.emailService.sendEmail(client.email, subject, content)
  }

  /**
   * Send budget rejection notification to client
   * @param client - Client information
   * @param budgetId - Budget ID
   * @param budgetTotal - Budget total amount
   * @param reason - Optional rejection reason
   * @returns Promise that resolves when email is sent
   */
  async sendBudgetRejectionNotification(
    client: ClientResponseDto,
    budgetId: string,
    budgetTotal: string,
    reason?: string,
  ): Promise<void> {
    const subject = 'Budget Update - Your Service Request'
    const content = this.generateBudgetRejectedEmail(client, budgetId, budgetTotal, reason)

    await this.emailService.sendEmail(client.email, subject, content)
  }

  /**
   * Generate budget for approval email content
   * @param client - Client information
   * @param budgetId - Budget ID
   * @param budgetTotal - Budget total amount
   * @param validityPeriod - Budget validity period
   * @returns HTML email content
   */
  private generateBudgetForApprovalEmail(
    client: ClientResponseDto,
    budgetId: string,
    budgetTotal: string,
    validityPeriod: number,
  ): string {
    return `
      <html>
        <body>
          <h2>Budget for Your Approval</h2>
          <p>Dear ${client.name},</p>
          <p>We have prepared a budget for your service request. Please review the details below:</p>
          
          <p><strong>Budget ID:</strong> ${budgetId}</p>
          <p><strong>Validity Period:</strong> ${validityPeriod} days</p>
          
          <p><strong>Total Amount:</strong> ${budgetTotal}</p>
          
          <p>Please review this budget and let us know if you approve or if you have any questions.</p>
          <p>You can approve or reject this budget through our client portal or by contacting us directly.</p>
          
          <p>This budget is valid for ${validityPeriod} days from today.</p>
          
          <p>Best regards,<br>Mechanical Workshop Team</p>
        </body>
      </html>
    `
  }

  /**
   * Generate budget approved email content
   * @param client - Client information
   * @param budgetId - Budget ID
   * @param budgetTotal - Budget total amount
   * @returns HTML email content
   */
  private generateBudgetApprovedEmail(
    client: ClientResponseDto,
    budgetId: string,
    budgetTotal: string,
  ): string {
    return `
      <html>
        <body>
          <h2>Budget Approved!</h2>
          <p>Dear ${client.name},</p>
          <p>Great news! Your budget has been approved.</p>
          <p><strong>Budget ID:</strong> ${budgetId}</p>
          <p><strong>Total Amount:</strong> ${budgetTotal}</p>
          <p>We will begin working on your service request. You will receive updates on the progress.</p>
          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br>Mechanical Workshop Team</p>
        </body>
      </html>
    `
  }

  /**
   * Generate budget rejected email content
   * @param client - Client information
   * @param budgetId - Budget ID
   * @param budgetTotal - Budget total amount
   * @param reason - Optional rejection reason
   * @returns HTML email content
   */
  private generateBudgetRejectedEmail(
    client: ClientResponseDto,
    budgetId: string,
    budgetTotal: string,
    reason?: string,
  ): string {
    const reasonText = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''

    return `
      <html>
        <body>
          <h2>Budget Update</h2>
          <p>Dear ${client.name},</p>
          <p>We regret to inform you that your budget has been rejected.</p>
          <p><strong>Budget ID:</strong> ${budgetId}</p>
          ${reasonText}
          <p>Please contact us if you have any questions or would like to discuss alternatives.</p>
          <p>Best regards,<br>Mechanical Workshop Team</p>
        </body>
      </html>
    `
  }
}
