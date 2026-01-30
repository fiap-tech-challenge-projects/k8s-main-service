import { ServiceExecutionController } from '@interfaces/rest/controllers'

describe('ServiceExecutionController (unit subset)', () => {
  let controller: any

  beforeEach(() => {
    controller = new ServiceExecutionController(
      { execute: jest.fn() } as any,
      {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          value: { data: [], meta: {} },
        }),
      } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    )
  })

  it('getAllServiceExecutions returns paginated when success', async () => {
    const data = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    ;(controller as any).getAllServiceExecutionsUseCase.execute.mockResolvedValue({
      isSuccess: true,
      value: data,
    })

    const out = await controller.getAllServiceExecutions(1, 10)
    expect(out).toBe(data)
  })
})
