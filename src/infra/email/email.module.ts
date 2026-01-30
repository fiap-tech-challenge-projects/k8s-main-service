import { Module } from '@nestjs/common'

import { EMAIL_SERVICE } from '@domain/email/interfaces'

import { EmailService } from './email.service'

/**
 * Email module for handling email notifications
 * Follows the established module patterns with proper interface binding
 */
@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: EmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
