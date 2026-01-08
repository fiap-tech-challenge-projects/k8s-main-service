import { Module } from '@nestjs/common'

import { ClientApplicationModule } from '@application/clients/client.module'
import { BudgetEventEmitterService } from '@application/events/budget-event-emitter.service'
import { SharedModule } from '@shared/shared.module'

/**
 * Events module for application-level event emitters
 * Separated to avoid circular dependencies
 */
@Module({
  imports: [ClientApplicationModule, SharedModule],
  providers: [BudgetEventEmitterService],
  exports: [BudgetEventEmitterService],
})
export class EventsModule {}
