import { Module } from '@nestjs/common'

import { ApplicationModule } from '@application/application.module'

import { ClientBudgetsController } from './client-budgets.controller'
import { ClientServiceOrdersController } from './client-service-orders.controller'

/**
 * Client Portal Module
 * Provides client-specific endpoints for budget and service order management
 */
@Module({
  imports: [ApplicationModule],
  controllers: [ClientBudgetsController, ClientServiceOrdersController],
})
export class ClientPortalModule {}
