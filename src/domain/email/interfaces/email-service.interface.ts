export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE')

/**
 * Interface for email service operations
 * Defines the contract for generic email notification operations
 */
export interface IEmailService {
  /**
   * Send a generic email notification
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param content - Email content (HTML or plain text)
   * @returns Promise that resolves when email is sent
   */
  sendEmail(to: string, subject: string, content: string): Promise<void>

  /**
   * Send a templated email notification
   * @param to - Recipient email address
   * @param template - Email template name
   * @returns Promise that resolves when email is sent
   */
  sendTemplatedEmail(to: string, template: string): Promise<void>
}
