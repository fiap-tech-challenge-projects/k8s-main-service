import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when email sending fails
 */
export class EmailSendFailedException extends DomainException {
  /**
   * Constructor for EmailSendFailedException
   * @param to - Email address that failed to receive the email
   * @param reason - Optional reason for the failure
   */
  constructor(to: string, reason?: string) {
    const message = reason
      ? `Failed to send email to ${to}: ${reason}`
      : `Failed to send email to ${to}`
    super(message, 'EMAIL_SEND_FAILED')
  }
}
