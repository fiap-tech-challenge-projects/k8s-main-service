// Note: convert to pure unit test by direct instantiation

import {
  CreateServiceExecutionDto,
  ServiceExecutionResponseDto,
  PaginatedServiceExecutionsResponseDto,
} from '@application/service-executions/dto'
import {
  CreateServiceExecutionUseCase,
  GetAllServiceExecutionsUseCase,
  GetServiceExecutionsByServiceOrderUseCase,
} from '@application/service-executions/use-cases'
import { ServiceExecutionController } from '@interfaces/rest/controllers'
import { Success } from '@shared/types'

describe('ServiceExecutionController', () => {
  let controller: ServiceExecutionController
  let createServiceExecutionUseCase: jest.Mocked<CreateServiceExecutionUseCase>
  let getAllServiceExecutionsUseCase: jest.Mocked<GetAllServiceExecutionsUseCase>
  let getServiceExecutionsByServiceOrderUseCase: jest.Mocked<GetServiceExecutionsByServiceOrderUseCase>

  beforeEach(() => {
    createServiceExecutionUseCase = { execute: jest.fn() } as any
    getAllServiceExecutionsUseCase = { execute: jest.fn() } as any
    getServiceExecutionsByServiceOrderUseCase = { execute: jest.fn() } as any

    // create controller with mocks directly
    const getByIdUseCase = { execute: jest.fn() }
    const updateUseCase = { execute: jest.fn() }
    const deleteUseCase = { execute: jest.fn() }
    const assignMechanicUseCaseMock = { execute: jest.fn() }
    const startUseCaseMock = { execute: jest.fn() }
    const completeUseCaseMock = { execute: jest.fn() }
    const updateNotesUseCaseMock = { execute: jest.fn() }
    const getByMechanicUseCaseMock = { execute: jest.fn() }

    controller = new ServiceExecutionController(
      createServiceExecutionUseCase as any,
      getAllServiceExecutionsUseCase as any,
      getByIdUseCase as any,
      updateUseCase as any,
      deleteUseCase as any,
      assignMechanicUseCaseMock as any,
      startUseCaseMock as any,
      completeUseCaseMock as any,
      updateNotesUseCaseMock as any,
      getServiceExecutionsByServiceOrderUseCase as any,
      getByMechanicUseCaseMock as any,
    )

    // silence logger
    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {})
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createServiceExecution', () => {
    it('should return created service execution (success)', async () => {
      const dto: CreateServiceExecutionDto = {} as any
      const result: ServiceExecutionResponseDto = { id: '1' } as any

      createServiceExecutionUseCase.execute.mockResolvedValue(new Success(result) as any)

      const response = await controller.createServiceExecution(dto)

      expect(response).toBe(result)
      expect(createServiceExecutionUseCase.execute).toHaveBeenCalledWith(dto)
    })

    it('should log and throw error if service fails', async () => {
      const dto: CreateServiceExecutionDto = {} as any
      const error = new Error('fail')

      createServiceExecutionUseCase.execute.mockResolvedValue({ isSuccess: false, error } as any)

      await expect(controller.createServiceExecution(dto)).rejects.toThrow('fail')
    })

    describe('getAllServiceExecutions', () => {
      it('should return paginated service executions (success)', async () => {
        const result: PaginatedServiceExecutionsResponseDto = { data: [], meta: {} } as any

        getAllServiceExecutionsUseCase.execute.mockResolvedValue(new Success(result) as any)

        const response = await controller.getAllServiceExecutions(1, 10)

        expect(response).toBe(result)
        expect(getAllServiceExecutionsUseCase.execute).toHaveBeenCalledWith(1, 10)
      })

      it('should log and throw error if service fails', async () => {
        const error = new Error('fail')

        getAllServiceExecutionsUseCase.execute.mockResolvedValue({ isSuccess: false, error } as any)

        await expect(controller.getAllServiceExecutions(1, 10)).rejects.toThrow('fail')
      })
    })

    describe('getServiceExecutionsByServiceOrder', () => {
      it('should return service executions by service order id (success)', async () => {
        const result: ServiceExecutionResponseDto = { id: 'soid' } as any

        getServiceExecutionsByServiceOrderUseCase.execute.mockResolvedValue(
          new Success(result) as any,
        )

        const response = await controller.getServiceExecutionsByServiceOrder('soid')

        expect(response).toBe(result)
        expect(getServiceExecutionsByServiceOrderUseCase.execute).toHaveBeenCalledWith('soid')
      })

      it('should log and throw error if service order lookup fails', async () => {
        const error = new Error('so-fail')

        getServiceExecutionsByServiceOrderUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error,
        } as any)

        await expect(controller.getServiceExecutionsByServiceOrder('soid')).rejects.toThrow(
          'so-fail',
        )
      })
    })

    describe('other flows', () => {
      it('getServiceExecutionsByMechanic returns list on success', async () => {
        const arr = [{ id: 'a1' }] as any

        ;(controller as any).getServiceExecutionsByMechanicUseCase.execute.mockResolvedValue(
          new Success(arr) as any,
        )

        const r = await controller.getServiceExecutionsByMechanic('mech-1')

        expect(r).toEqual(arr)
      })

      it('getServiceExecutionsByMechanic should throw when use-case fails', async () => {
        const error = new Error('mech-fail')

        ;(controller as any).getServiceExecutionsByMechanicUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error,
        } as any)

        await expect(controller.getServiceExecutionsByMechanic('mech-1')).rejects.toThrow(
          'mech-fail',
        )
      })

      it('getServiceExecutionById returns value on success and throws on failure', async () => {
        const v = { id: 'se-1' } as any

        ;(controller as any).getServiceExecutionByIdUseCase.execute.mockResolvedValue(
          new Success(v) as any,
        )

        await expect(controller.getServiceExecutionById('se-1')).resolves.toEqual(v)
        ;(controller as any).getServiceExecutionByIdUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('nf'),
        } as any)

        await expect(controller.getServiceExecutionById('se-1')).rejects.toThrow('nf')
      })

      it('updateServiceExecution returns updated when success and throws when failure', async () => {
        const upd = { id: 'se-1', notes: 'x' } as any

        ;(controller as any).updateServiceExecutionUseCase.execute.mockResolvedValue(
          new Success(upd) as any,
        )

        await expect(controller.updateServiceExecution('se-1', {} as any)).resolves.toEqual(upd)
        ;(controller as any).updateServiceExecutionUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('bad'),
        } as any)

        await expect(controller.updateServiceExecution('se-1', {} as any)).rejects.toThrow('bad')
      })

      it('assign/start/complete/updateNotes return value on success and throw on failure', async () => {
        const out = { id: 'se-1' } as any

        ;(controller as any).assignMechanicUseCase.execute.mockResolvedValue(
          new Success(out) as any,
        )

        await expect(controller.assignMechanic('se-1', 'm1')).resolves.toEqual(out)
        ;(controller as any).startServiceExecutionUseCase.execute.mockResolvedValue(
          new Success(out) as any,
        )

        await expect(controller.startServiceExecution('se-1')).resolves.toEqual(out)
        ;(controller as any).completeServiceExecutionUseCase.execute.mockResolvedValue(
          new Success(out) as any,
        )

        await expect(controller.completeServiceExecution('se-1', 'ok')).resolves.toEqual(out)
        ;(controller as any).updateServiceExecutionNotesUseCase.execute.mockResolvedValue(
          new Success(out) as any,
        )

        await expect(controller.updateServiceExecutionNotes('se-1', 'n')).resolves.toEqual(out)

        // failure path for one of them
        ;(controller as any).assignMechanicUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('bad'),
        } as any)

        await expect(controller.assignMechanic('se-1', 'm1')).rejects.toThrow('bad')

        // start failure
        ;(controller as any).startServiceExecutionUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('start-bad'),
        } as any)

        await expect(controller.startServiceExecution('se-1')).rejects.toThrow('start-bad')

        // complete failure
        ;(controller as any).completeServiceExecutionUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('complete-bad'),
        } as any)

        await expect(controller.completeServiceExecution('se-1', 'ok')).rejects.toThrow(
          'complete-bad',
        )

        // updateNotes failure
        ;(controller as any).updateServiceExecutionNotesUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('notes-bad'),
        } as any)

        await expect(controller.updateServiceExecutionNotes('se-1', 'n')).rejects.toThrow(
          'notes-bad',
        )
      })

      it('deleteServiceExecution returns without throw on success and throws on failure', async () => {
        ;(controller as any).deleteServiceExecutionUseCase.execute.mockResolvedValue({
          isSuccess: true,
          isFailure: false,
        } as any)

        await expect(controller.deleteServiceExecution('se-1')).resolves.toBeUndefined()
        ;(controller as any).deleteServiceExecutionUseCase.execute.mockResolvedValue({
          isSuccess: false,
          error: new Error('bad'),
        } as any)

        await expect(controller.deleteServiceExecution('se-1')).rejects.toThrow('bad')
      })
    })
  })
})
