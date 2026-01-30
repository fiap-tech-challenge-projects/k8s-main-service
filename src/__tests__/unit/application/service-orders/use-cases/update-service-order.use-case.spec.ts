import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { UpdateServiceOrderUseCase } from '@application/service-orders/use-cases'
import { ServiceOrderStatusChangeValidator } from '@domain/service-orders/validators'
import { ServiceOrderStatus } from '@domain/service-orders/value-objects'

describe('UpdateServiceOrderUseCase (unit)', () => {
  let mockRepo: any
  let mockUserContext: any
  let useCase: UpdateServiceOrderUseCase

  const existing: any = { id: 'so-1', status: ServiceOrderStatus.RECEIVED }
  const updated: any = { id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSIS }

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), update: jest.fn() }
    mockUserContext = {
      getUserId: jest.fn().mockReturnValue('user-1'),
      getUserRole: jest.fn().mockReturnValue('EMPLOYEE'),
    }
    jest
      .spyOn(ServiceOrderMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)
    jest.spyOn(ServiceOrderMapper, 'fromUpdateDto').mockImplementation((e: any) => e as any)
    jest
      .spyOn(ServiceOrderStatusChangeValidator, 'validateRoleCanChangeStatus')
      .mockImplementation(jest.fn())

    useCase = new UpdateServiceOrderUseCase(mockRepo, mockUserContext)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Failure when not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute('missing', {
      status: ServiceOrderStatus.IN_DIAGNOSIS,
    } as any)
    expect(result.isFailure).toBeTruthy()
  })

  it('updates when found and authorized', async () => {
    mockRepo.findById.mockResolvedValue(existing)
    mockRepo.update.mockResolvedValue(updated)

    const result = await useCase.execute('so-1', { status: ServiceOrderStatus.IN_DIAGNOSIS } as any)

    expect(ServiceOrderStatusChangeValidator.validateRoleCanChangeStatus).toHaveBeenCalled()
    expect(mockRepo.update).toHaveBeenCalled()
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value).toEqual({ id: 'so-1' })
  })
})
