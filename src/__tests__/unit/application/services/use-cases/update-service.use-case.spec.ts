import { ServiceMapper } from '@application/services/mappers'
import { UpdateServiceUseCase } from '@application/services/use-cases'
import {
  ServiceNameValidator,
  ServiceDescriptionValidator,
  PriceValidator,
} from '@domain/services/validators'

describe('UpdateServiceUseCase', () => {
  const repo: any = { findById: jest.fn(), update: jest.fn() }
  const userContext: any = { getUserId: () => 'u-1' }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when service not found', async () => {
    repo.findById.mockResolvedValue(null)
    const useCase = new UpdateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute('s-1', { name: 'X' } as any)

    expect(res.isFailure).toBe(true)
  })

  it('updates service successfully', async () => {
    const existing = { id: 's-1', name: 'X' }
    repo.findById.mockResolvedValue(existing)
    repo.update.mockResolvedValue(existing)

    jest.spyOn(ServiceNameValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(ServiceDescriptionValidator, 'validate').mockImplementation(() => {})
    jest.spyOn(PriceValidator, 'isValid').mockReturnValue(true)
    jest.spyOn(ServiceMapper, 'fromUpdateDto').mockReturnValue({} as any)
    jest.spyOn(ServiceMapper, 'toResponseDto').mockReturnValue({ id: 's-1' } as any)

    const useCase = new UpdateServiceUseCase(repo as any, userContext as any)
    const res = await useCase.execute('s-1', { name: 'New' } as any)

    expect(res.isSuccess).toBe(true)
    expect((res as any).value.id).toBe('s-1')
  })
})
