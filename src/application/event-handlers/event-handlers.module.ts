import { Module, OnModuleInit, Inject } from '@nestjs/common'

import { BudgetApplicationModule } from '@application/budget/budget.module'
import { ClientApplicationModule } from '@application/clients/client.module'
import { EmployeeApplicationModule } from '@application/employees/employee.module'
import {
  ServiceOrderReceivedHandler,
  ServiceOrderApprovedHandler,
  ServiceExecutionStatusChangedHandler,
  ServiceExecutionCompletedHandler,
  BudgetEventHandler,
  BudgetEmailService,
} from '@application/event-handlers'
import { ServiceExecutionApplicationModule } from '@application/service-executions/service-execution.module'
import { ServiceOrderApplicationModule } from '@application/service-orders/service-order.module'
import { StockApplicationModule } from '@application/stock/stock.module'
import { InfraModule } from '@infra/infra.module'
import { EventBus, EVENT_BUS } from '@shared/events'
import { SharedModule } from '@shared/shared.module'

/**
 * Event Handlers Module
 * Centralized module for all cross-module event handlers
 * This module breaks circular dependencies between application modules
 */
@Module({
  imports: [
    BudgetApplicationModule,
    ClientApplicationModule,
    EmployeeApplicationModule,
    ServiceOrderApplicationModule,
    ServiceExecutionApplicationModule,
    StockApplicationModule,
    InfraModule,
    SharedModule,
  ],
  providers: [
    ServiceOrderReceivedHandler,
    ServiceOrderApprovedHandler,
    ServiceExecutionStatusChangedHandler,
    ServiceExecutionCompletedHandler,
    BudgetEventHandler,
    BudgetEmailService,
  ],
  exports: [
    ServiceOrderReceivedHandler,
    ServiceOrderApprovedHandler,
    ServiceExecutionStatusChangedHandler,
    ServiceExecutionCompletedHandler,
    BudgetEventHandler,
    BudgetEmailService,
  ],
})
export class EventHandlersModule implements OnModuleInit {
  /**
   * Creates a new instance of EventHandlersModule
   * @param eventBus - Event bus for publishing and subscribing to events
   * @param serviceOrderReceivedHandler - Handler for service order received events
   * @param serviceOrderApprovedHandler - Handler for service order approved events
   * @param serviceExecutionStatusChangedHandler - Handler for service execution status changed events
   * @param serviceExecutionCompletedHandler - Handler for service execution completed events
   * @param budgetEventHandler - Handler for budget events
   */
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
    private readonly serviceOrderReceivedHandler: ServiceOrderReceivedHandler,
    private readonly serviceOrderApprovedHandler: ServiceOrderApprovedHandler,
    private readonly serviceExecutionStatusChangedHandler: ServiceExecutionStatusChangedHandler,
    private readonly serviceExecutionCompletedHandler: ServiceExecutionCompletedHandler,
    private readonly budgetEventHandler: BudgetEventHandler,
  ) {}

  /**
   * Register event handlers when the module initializes
   */
  async onModuleInit(): Promise<void> {
    // Register all event handlers with the event bus
    await this.eventBus.subscribe('ServiceOrderReceived', this.serviceOrderReceivedHandler)
    await this.eventBus.subscribe('ServiceOrderApproved', this.serviceOrderApprovedHandler)
    await this.eventBus.subscribe(
      'ServiceExecutionStatusChanged',
      this.serviceExecutionStatusChangedHandler,
    )
    await this.eventBus.subscribe(
      'ServiceExecutionCompleted',
      this.serviceExecutionCompletedHandler,
    )
    await this.eventBus.subscribe('BudgetSent', this.budgetEventHandler)
    await this.eventBus.subscribe('BudgetApproved', this.budgetEventHandler)
    await this.eventBus.subscribe('BudgetRejected', this.budgetEventHandler)
  }
}
