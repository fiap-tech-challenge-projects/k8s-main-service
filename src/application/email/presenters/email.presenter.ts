import { EmailResponseDto } from '@application/email/dto'

/**
 * HTTP response format for Email operations
 */
export interface EmailHttpResponse {
  success: boolean
  message: string
  timestamp: string
}

/**
 * Presenter for Email data formatting
 * Separates business data structure from HTTP response format
 */
export class EmailPresenter {
  /**
   * Formats Email business data for HTTP response
   * @param emailResponse - Email response data from application layer
   * @returns Formatted Email response for HTTP transport
   */
  present(emailResponse: EmailResponseDto): EmailHttpResponse {
    return {
      success: emailResponse.success,
      message: emailResponse.message,
      timestamp: emailResponse.timestamp.toISOString(),
    }
  }
}
