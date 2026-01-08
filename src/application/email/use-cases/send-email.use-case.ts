import { Injectable, Logger, Inject } from '@nestjs/common'

import { SendEmailDto, EmailResponseDto } from '@application/email/dto'
import { EmailSendFailedException } from '@domain/email/exceptions'
import { IEmailService, EMAIL_SERVICE } from '@domain/email/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for sending generic emails
 */
@Injectable()
export class SendEmailUseCase {
  private readonly logger = new Logger(SendEmailUseCase.name)

  /**
   * Constructor for SendEmailUseCase
   * @param emailService - Email service for sending emails
   */
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  /**
   * Execute email sending
   * @param sendEmailDto - Email data to send
   * @returns Result with email response or error
   */
  async execute(
    sendEmailDto: SendEmailDto,
  ): Promise<Result<EmailResponseDto, EmailSendFailedException>> {
    this.logger.log('Executing send email use case', {
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      context: 'SendEmailUseCase.execute',
    })

    try {
      await this.emailService.sendEmail(sendEmailDto.to, sendEmailDto.subject, sendEmailDto.content)

      const response: EmailResponseDto = {
        success: true,
        message: `Email sent successfully to ${sendEmailDto.to}`,
        timestamp: new Date(),
      }

      this.logger.log('Email sending use case completed successfully', {
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        context: 'SendEmailUseCase.execute',
      })

      return SUCCESS(response)
    } catch (error) {
      const emailException = new EmailSendFailedException(
        sendEmailDto.to,
        error instanceof Error ? error.message : 'Unknown error',
      )

      this.logger.error('Email sending use case failed', {
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        error: emailException.message,
        context: 'SendEmailUseCase.execute',
      })

      return FAILURE(emailException)
    }
  }
}
