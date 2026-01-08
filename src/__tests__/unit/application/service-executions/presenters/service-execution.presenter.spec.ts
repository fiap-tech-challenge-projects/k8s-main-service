import { HttpStatus } from '@nestjs/common'

import { ServiceExecutionPresenter } from '@application/service-executions/presenters'

describe('ServiceExecutionPresenter', () => {
  const dto: any = {
    id: 'se1',
    status: 'ASSIGNED',
    serviceOrderId: 'so1',
    mechanicId: 'emp1',
  }

  it('presentCreateSuccess returns CREATED and payload', () => {
    const out = ServiceExecutionPresenter.presentCreateSuccess(dto)
    expect(out.statusCode).toBe(HttpStatus.CREATED)
    expect(out.message).toMatch(/created successfully/)
    expect(out.data).toBe(dto)
  })

  it('presentGetSuccess returns OK and payload', () => {
    const out = ServiceExecutionPresenter.presentGetSuccess(dto)
    expect(out.statusCode).toBe(HttpStatus.OK)
    expect(out.message).toMatch(/retrieved successfully/)
  })

  it('presentListSuccess returns count and list', () => {
    const out = ServiceExecutionPresenter.presentListSuccess([dto, dto])
    expect(out.statusCode).toBe(HttpStatus.OK)
    expect(out.count).toBe(2)
    expect(out.data.length).toBe(2)
  })

  it('presentError returns provided status and error message', () => {
    const err = ServiceExecutionPresenter.presentError('err', HttpStatus.INTERNAL_SERVER_ERROR)
    expect(err.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(err.error).toBe('err')
  })

  it('presentError without status uses BAD_REQUEST by default', () => {
    const err = ServiceExecutionPresenter.presentError('bad')
    expect(err.statusCode).toBe(HttpStatus.BAD_REQUEST)
    expect(err.error).toBe('bad')
  })
})
