import { GetAllServiceExecutionsUseCase } from '@application/service-executions/use-cases'

describe('GetAllServiceExecutionsUseCase', () => {
  it('returns SUCCESS with mapped data when repository resolves', async () => {
    const mockEntity = {
      id: 'se1',
      status: 'COMPLETED',
      startTime: new Date('2020-01-01T00:00:00.000Z'),
      endTime: new Date('2020-01-01T00:30:00.000Z'),
      notes: 'notes',
      serviceOrderId: 'so1',
      mechanicId: 'm1',
      getDurationInMinutes: () => 30,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: new Date('2020-01-01T00:30:00.000Z'),
    }

    const repo = {
      findAll: jest.fn().mockResolvedValue({
        data: [mockEntity],
        meta: { page: 1, totalPages: 1, total: 1 },
      }),
    }
    const uc = new GetAllServiceExecutionsUseCase(repo as any)

    const res = await uc.execute(1, 10)
    expect(res.isSuccess).toBeTruthy()
    if (res.isSuccess) expect(res.unwrap().meta.page).toBe(1)
  })

  it('throws when repository throws', async () => {
    const repo = { findAll: jest.fn().mockRejectedValue(new Error('fail')) }
    const uc = new GetAllServiceExecutionsUseCase(repo as any)

    await expect(uc.execute()).rejects.toThrow('fail')
  })
})
