/**
 * DTO for sending a generic email
 */
export interface SendEmailDto {
  /**
   * Recipient email address
   */
  to: string

  /**
   * Email subject
   */
  subject: string

  /**
   * Email content (HTML or plain text)
   */
  content: string
}

/**
 * DTO for sending a templated email
 */
export interface SendTemplatedEmailDto {
  /**
   * Recipient email address
   */
  to: string

  /**
   * Email template name
   */
  template: string
}

/**
 * Response DTO after email operation
 */
export interface EmailResponseDto {
  /**
   * Whether the email was sent successfully
   */
  success: boolean

  /**
   * Message describing the result
   */
  message: string

  /**
   * Timestamp when the email was processed
   */
  timestamp: Date
}
