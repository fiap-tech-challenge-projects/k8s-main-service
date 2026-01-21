import { Injectable, Logger, Inject } from '@nestjs/common'

import { SendTemplatedEmailDto, EmailResponseDto } from '@application/email/dto'
import { EmailSendFailedException } from '@domain/email/exceptions'
import { IEmailService, EMAIL_SERVICE } from '@domain/email/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for sending templated emails
 */
@Injectable()
export class SendTemplatedEmailUseCase {
  private readonly logger = new Logger(SendTemplatedEmailUseCase.name)

  /**
   * Constructor for SendTemplatedEmailUseCase
   * @param emailService - Email service for sending emails
   */
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  /**
   * Execute templated email sending
   * @param sendTemplatedEmailDto - Templated email data to send
   * @returns Result with email response or error
   */
  async execute(
    sendTemplatedEmailDto: SendTemplatedEmailDto,
  ): Promise<Result<EmailResponseDto, EmailSendFailedException>> {
    this.logger.log('Executing send templated email use case', {
      to: sendTemplatedEmailDto.to,
      template: sendTemplatedEmailDto.template,
      context: 'SendTemplatedEmailUseCase.execute',
    })

    try {
      await this.emailService.sendTemplatedEmail(
        sendTemplatedEmailDto.to,
        sendTemplatedEmailDto.template,
      )

      const response: EmailResponseDto = {
        success: true,
        message: `Templated email sent successfully to ${sendTemplatedEmailDto.to}`,
        timestamp: new Date(),
      }

      this.logger.log('Templated email sending use case completed successfully', {
        to: sendTemplatedEmailDto.to,
        template: sendTemplatedEmailDto.template,
        context: 'SendTemplatedEmailUseCase.execute',
      })

      return SUCCESS(response)
    } catch (error) {
      const emailException = new EmailSendFailedException(
        sendTemplatedEmailDto.to,
        error instanceof Error ? error.message : 'Unknown error',
      )

      this.logger.error('Templated email sending use case failed', {
        to: sendTemplatedEmailDto.to,
        template: sendTemplatedEmailDto.template,
        error: emailException.message,
        context: 'SendTemplatedEmailUseCase.execute',
      })

      return FAILURE(emailException)
    }
  }
}
