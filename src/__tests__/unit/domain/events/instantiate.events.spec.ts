import { BudgetApprovedEvent, BudgetRejectedEvent, BudgetSentEvent } from '@domain/budget/events'
import {
  ServiceExecutionCompletedEvent,
  ServiceExecutionStatusChangedEvent,
} from '@domain/service-executions/events'
import {
  ServiceOrderReceivedEvent,
  ServiceOrderApprovedEvent,
  ServiceOrderStatusChangedEvent,
} from '@domain/service-orders/events'

describe('Domain events instantiation', () => {
  it('instantiates service order events', () => {
    const received = new ServiceOrderReceivedEvent('so-1', {
      clientId: 'c-1',
      vehicleId: 'v-1',
      receivedAt: new Date(),
    })

    const approved = new ServiceOrderApprovedEvent('so-1', {
      clientId: 'c-1',
      vehicleId: 'v-1',
      approvedBy: 'u-1',
      approvedAt: new Date(),
    })

    const statusChanged = new ServiceOrderStatusChangedEvent('so-1', {
      previousStatus: 'REQUESTED' as any,
      newStatus: 'RECEIVED' as any,
      clientId: 'c-1',
      vehicleId: 'v-1',
      changedBy: 'u-1',
      changedAt: new Date(),
    })

    expect(received).toBeDefined()
    expect(approved).toBeDefined()
    expect(statusChanged).toBeDefined()
  })

  it('instantiates service execution events', () => {
    const completed = new ServiceExecutionCompletedEvent('se-1', {
      serviceOrderId: 'so-1',
      clientId: 'c-1',
      completedAt: new Date(),
    })

    const statusChanged = new ServiceExecutionStatusChangedEvent('se-1', {
      previousStatus: 'PENDING' as any,
      newStatus: 'COMPLETED' as any,
      serviceOrderId: 'so-1',
      changedBy: 'u-1',
      changedAt: new Date(),
    })

    expect(completed).toBeDefined()
    expect(statusChanged).toBeDefined()
  })

  it('instantiates budget events', () => {
    const approved = new BudgetApprovedEvent('b-1', {
      clientId: 'c-1',
      clientName: 'Client Name',
      clientEmail: 'c@example.com',
      budgetTotal: '100.00',
      approvedAt: new Date(),
    })
    const rejected = new BudgetRejectedEvent('b-1', {
      clientId: 'c-1',
      clientName: 'Client Name',
      clientEmail: 'c@example.com',
      budgetTotal: '100.00',
      rejectedAt: new Date(),
    })
    const sent = new BudgetSentEvent('b-1', {
      clientId: 'c-1',
      clientName: 'Client Name',
      clientEmail: 'c@example.com',
      budgetTotal: '100.00',
      validityPeriod: 30,
    })

    expect(approved).toBeDefined()
    expect(rejected).toBeDefined()
    expect(sent).toBeDefined()
  })
})
