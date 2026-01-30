import { UpdateStockMovementUseCase } from '@application/stock/use-cases'

describe('UpdateStockMovementUseCase', () => {
  it('returns SUCCESS on repository update', async () => {
    const updated = { id: 'm1', stockId: 's1', quantity: 2, type: 'IN' } as any
    const repo = { updateStockMovement: jest.fn().mockResolvedValue(updated) }
    const uc = new UpdateStockMovementUseCase(repo as any)

    const res = await uc.execute('m1', { quantity: 2 } as any)
    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.unwrap()).toEqual(expect.objectContaining({ id: 'm1' }))
  })

  it('returns FAILURE when repository throws', async () => {
    const repo = { updateStockMovement: jest.fn().mockRejectedValue(new Error('fail')) }
    const uc = new UpdateStockMovementUseCase(repo as any)

    const res = await uc.execute('m1', { quantity: 2 } as any)
    expect(res.isFailure).toBeTruthy()
  })
})
