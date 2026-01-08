import { UpdateServiceOrderStatusUseCase } from '@application/service-orders'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import { ServiceOrderStatus } from '@domain/service-orders/value-objects'
// imports

describe('UpdateServiceOrderStatusUseCase', () => {
  const mockRepo: any = {
    findById: jest.fn(),
    update: jest.fn(),
  }

  const mockUserContext: any = {
    getUserId: jest.fn().mockReturnValue('user-1'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns Failure when service order not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const sut = new UpdateServiceOrderStatusUseCase(mockRepo, mockUserContext)

    const result = await sut.execute('so-1', ServiceOrderStatus.REQUESTED, 'changer')

    expect(result.isFailure).toBe(true)
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(ServiceOrderNotFoundException)
    }
  })

  it('returns Success when update succeeds', async () => {
    const fakeEntity: any = {
      id: 'so-1',
      updateStatus: jest.fn().mockReturnThis(),
    }
    const saved: any = { id: 'so-1', status: ServiceOrderStatus.RECEIVED }

    mockRepo.findById.mockResolvedValue(fakeEntity)
    mockRepo.update.mockResolvedValue(saved)
    jest.spyOn(ServiceOrderMapper, 'toResponseDto').mockReturnValue(saved as any)

    const sut = new UpdateServiceOrderStatusUseCase(mockRepo, mockUserContext)

    const result = await sut.execute('so-1', ServiceOrderStatus.RECEIVED, 'changer')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toEqual(saved)
    }
  })

  it('returns Failure when repository throws', async () => {
    const fakeEntity: any = {
      id: 'so-1',
      updateStatus: jest.fn().mockReturnThis(),
    }

    mockRepo.findById.mockResolvedValue(fakeEntity)
    mockRepo.update.mockRejectedValue(new Error('db error'))

    const sut = new UpdateServiceOrderStatusUseCase(mockRepo, mockUserContext)

    const result = await sut.execute('so-1', ServiceOrderStatus.RECEIVED, 'changer')

    expect(result.isFailure).toBe(true)
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(Error)
    }
  })
})
