import { ServiceMapper } from '@application/services/mappers'
import { GetServiceByIdUseCase } from '@application/services/use-cases'

describe('GetServiceByIdUseCase', () => {
  it('returns Success when service found by id', async () => {
    const service = { id: 's-1' }
    const repo = {
      findById: jest.fn().mockResolvedValue(service),
    }
    const userContextService = {
      getUserId: jest.fn().mockReturnValue('u-1'),
    }

    jest.spyOn(ServiceMapper, 'toResponseDto').mockReturnValue({ id: 's-1' } as any)

    const useCase = new GetServiceByIdUseCase(repo as any, userContextService as any)
    const res = await useCase.execute('s-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('s-1')
    expect(repo.findById).toHaveBeenCalledWith('s-1')
  })

  it('returns Failure when service not found', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
    }
    const userContextService = {
      getUserId: jest.fn().mockReturnValue('u-1'),
    }
    const useCase = new GetServiceByIdUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('s-x')
    expect(res.isFailure).toBe(true)
  })
})
