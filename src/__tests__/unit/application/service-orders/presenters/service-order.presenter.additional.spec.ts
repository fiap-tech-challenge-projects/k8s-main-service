import { HttpStatus } from '@nestjs/common'

import { ServiceOrderPresenter } from '@application/service-orders/presenters'

describe('ServiceOrderPresenter (additional checks)', () => {
  it('presentDeleteSuccess and presentError behave correctly', () => {
    const deleted = ServiceOrderPresenter.presentDeleteSuccess()
    expect(deleted.statusCode).toBe(HttpStatus.OK)

    const err = ServiceOrderPresenter.presentError('failed', HttpStatus.UNPROCESSABLE_ENTITY)
    expect(err.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
    expect(err.error).toBe('failed')
  })
})
