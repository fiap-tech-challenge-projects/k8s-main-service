import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { CreateServiceExecutionUseCase } from '@application/service-executions/use-cases'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { ServiceOrderAlreadyHasExecutionException } from '@domain/service-executions/exceptions'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'

describe('CreateServiceExecutionUseCase (unit)', () => {
  let mockServiceExecutionRepo: any
  let mockServiceOrderRepo: any
  let mockEmployeeRepo: any
  let mockUserContext: any
  let useCase: CreateServiceExecutionUseCase

  beforeEach(() => {
    mockServiceExecutionRepo = { findByServiceOrderId: jest.fn(), create: jest.fn() }
    mockServiceOrderRepo = { findById: jest.fn() }
    mockEmployeeRepo = { findById: jest.fn() }
    mockUserContext = { getUserId: jest.fn(), getUserRole: jest.fn() }

    useCase = new CreateServiceExecutionUseCase(
      mockServiceExecutionRepo,
      mockServiceOrderRepo,
      mockEmployeeRepo,
      mockUserContext,
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Failure when service order not found', async () => {
    mockServiceOrderRepo.findById.mockResolvedValue(null)
    const dto: any = { serviceOrderId: 'so-1' }

    const res = await useCase.execute(dto)

    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(ServiceOrderNotFoundException)
  })

  it('returns Failure when service order status is not APPROVED', async () => {
    mockServiceOrderRepo.findById.mockResolvedValue({ id: 'so-1', status: 'SENT' })
    const dto: any = { serviceOrderId: 'so-1' }

    const res = await useCase.execute(dto)

    expect(res.isFailure).toBeTruthy()
  })

  it('returns Failure when existing execution found', async () => {
    mockServiceOrderRepo.findById.mockResolvedValue({ id: 'so-1', status: 'APPROVED' })
    mockServiceExecutionRepo.findByServiceOrderId.mockResolvedValue({ id: 'exec-1' })
    const dto: any = { serviceOrderId: 'so-1' }

    const res = await useCase.execute(dto)

    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(ServiceOrderAlreadyHasExecutionException)
  })

  it('returns Failure when mechanic provided but not found', async () => {
    mockServiceOrderRepo.findById.mockResolvedValue({ id: 'so-1', status: 'APPROVED' })
    mockServiceExecutionRepo.findByServiceOrderId.mockResolvedValue(null)
    mockEmployeeRepo.findById.mockResolvedValue(null)
    const dto: any = { serviceOrderId: 'so-1', mechanicId: 'm1' }

    const res = await useCase.execute(dto)

    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(EmployeeNotFoundException)
  })

  it('creates service execution when all validations pass', async () => {
    mockServiceOrderRepo.findById.mockResolvedValue({ id: 'so-1', status: 'APPROVED' })
    mockServiceExecutionRepo.findByServiceOrderId.mockResolvedValue(null)
    mockEmployeeRepo.findById.mockResolvedValue({ id: 'm1' })

    const createdEntity = {
      id: 'exec-1',
      serviceOrderId: 'so-1',
      mechanicId: 'm1',
      status: 'IN_PROGRESS',
    }
    mockServiceExecutionRepo.create.mockResolvedValue(createdEntity)

    jest
      .spyOn(ServiceExecutionMapper, 'fromCreateDto')
      .mockImplementation((d: any) => ({ ...d })) as any
    jest.spyOn(ServiceExecutionMapper, 'toResponseDto').mockImplementation((e: any) => ({
      id: e.id,
      status: e.status ?? 'IN_PROGRESS',
      startTime: e.startTime ?? null,
      endTime: e.endTime ?? null,
      notes: e.notes ?? null,
      serviceOrderId: e.serviceOrderId,
      mechanicId: e.mechanicId,
      durationInMinutes: e.durationInMinutes ?? undefined,
      createdAt: e.createdAt ?? new Date(),
      updatedAt: e.updatedAt ?? new Date(),
    })) as any

    const dto: any = { serviceOrderId: 'so-1', mechanicId: 'm1' }
    const res = await useCase.execute(dto)

    expect(res.isSuccess).toBeTruthy()
    expect((res as any).value).toHaveProperty('id')
    expect(ServiceExecutionMapper.fromCreateDto).toHaveBeenCalledWith(dto)
    expect(ServiceExecutionMapper.toResponseDto).toHaveBeenCalled()
  })
})
