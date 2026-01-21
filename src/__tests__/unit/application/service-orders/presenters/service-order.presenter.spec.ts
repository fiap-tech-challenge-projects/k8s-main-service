import { HttpStatus } from '@nestjs/common'

import { ServiceOrderResponseDto } from '@application/service-orders/dto'
import { ServiceOrderPresenter } from '@application/service-orders/presenters'

describe('ServiceOrderPresenter', () => {
  it('presentCreateSuccess, presentGetSuccess and list work as expected', () => {
    const dto: ServiceOrderResponseDto = {
      id: 'so1',
      status: 'REQUESTED' as any,
      requestDate: new Date('2024-01-01T00:00:00.000Z'),
      clientId: 'c1',
      vehicleId: 'v1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T01:00:00.000Z'),
    }

    const created = ServiceOrderPresenter.presentCreateSuccess(dto)
    expect(created.statusCode).toBe(HttpStatus.CREATED)
    expect(created.data).toBe(dto)

    const got = ServiceOrderPresenter.presentGetSuccess(dto)
    expect(got.statusCode).toBe(HttpStatus.OK)
    expect(got.data).toBe(dto)

    const list = ServiceOrderPresenter.presentListSuccess([dto])
    expect(list.statusCode).toBe(HttpStatus.OK)
    expect(list.count).toBe(1)
    expect(list.data[0]).toBe(dto)
  })

  it('presentDeleteSuccess and presentError behave correctly', () => {
    const deleted = ServiceOrderPresenter.presentDeleteSuccess()
    expect(deleted.statusCode).toBe(HttpStatus.OK)

    const err = ServiceOrderPresenter.presentError('failed', HttpStatus.UNPROCESSABLE_ENTITY)
    expect(err.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
    expect(err.error).toBe('failed')
  })

  it('presentError without status uses BAD_REQUEST by default', () => {
    const err = ServiceOrderPresenter.presentError('oops')
    expect(err.statusCode).toBe(HttpStatus.BAD_REQUEST)
    expect(err.error).toBe('oops')
  })
})
