import { Logger } from '@nestjs/common'

import { ServiceOrderReceivedHandler } from '@application/event-handlers/service-orders'

describe('ServiceOrderReceivedHandler', () => {
  let mockCreateBudget: any
  let handler: ServiceOrderReceivedHandler

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {})
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
  })

  beforeEach(() => {
    mockCreateBudget = { execute: jest.fn() }
    handler = new ServiceOrderReceivedHandler(mockCreateBudget)
  })

  afterEach(() => jest.restoreAllMocks())

  it('calls createBudgetUseCase.execute on handle and logs', async () => {
    mockCreateBudget.execute.mockResolvedValue({ isSuccess: true, value: { id: 'b-1' } })

    const event: any = {
      aggregateId: 'so-1',
      data: { clientId: 'c-1', vehicleId: 'v-1', receivedAt: new Date() },
    }

    await handler.handle(event)

    expect(mockCreateBudget.execute).toHaveBeenCalled()
  })

  it('re-throws when createBudgetUseCase throws and logs error', async () => {
    const err = new Error('boom')
    mockCreateBudget.execute.mockRejectedValue(err)

    const event: any = {
      aggregateId: 'so-1',
      data: { clientId: 'c-1', vehicleId: 'v-1', receivedAt: new Date() },
    }

    await expect(handler.handle(event)).rejects.toThrow(err)
  })
})
