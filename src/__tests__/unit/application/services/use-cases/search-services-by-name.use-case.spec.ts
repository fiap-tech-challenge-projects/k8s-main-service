import { SearchServicesByNameUseCase } from '@application/services'
import { ServiceMapper } from '@application/services/mappers'

describe('SearchServicesByNameUseCase', () => {
  const mockService = { id: 's-1', name: 'Oil change' }

  it('returns Success with mapped dtos when repository returns results', async () => {
    const mockRepo = {
      findByName: jest.fn().mockResolvedValue({ data: [mockService], meta: { total: 1 } }),
    }

    const useCase = new SearchServicesByNameUseCase(
      mockRepo as any,
      { getUserId: () => 'u-1' } as any,
    )

    jest
      .spyOn(ServiceMapper, 'toResponseDto')
      .mockReturnValue({ id: 's-1', name: 'Oil change' } as any)

    const res = await useCase.execute('oil')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) {
      expect(res.value.data).toHaveLength(1)
      expect(ServiceMapper.toResponseDto).toHaveBeenCalledWith(mockService)
    }
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { findByName: jest.fn().mockRejectedValue(new Error('db')) }
    const useCase = new SearchServicesByNameUseCase(
      mockRepo as any,
      { getUserId: () => 'u-1' } as any,
    )

    const res = await useCase.execute('oil')

    expect(res.isSuccess).toBe(false)
    expect(res.isFailure).toBe(true)
  })
})
