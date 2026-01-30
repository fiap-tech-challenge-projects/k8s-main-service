// instantiate controller directly to keep tests pure and fast

import type {
  CreateVehicleEvaluationDto,
  VehicleEvaluationResponseDto,
  PaginatedVehicleEvaluationsResponseDto,
  UpdateVehicleEvaluationDto,
} from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationController } from '@interfaces/rest/controllers'
import { Success } from '@shared/types'

describe('VehicleEvaluationController', () => {
  let controller: VehicleEvaluationController

  beforeEach(() => {
    const make = (fn = jest.fn()) => ({ execute: fn })

    // create mocks in the same order as controller constructor
    const createUseCase = make()
    const deleteUseCase = make()
    const getAllUseCase = make()
    const getByIdUseCase = make()
    const getByServiceOrderUseCase = make()
    const getByVehicleUseCase = make()
    const updateUseCase = make()
    const updateDetailsUseCase = make()
    const updateNotesUseCase = make()

    controller = new VehicleEvaluationController(
      createUseCase as any,
      deleteUseCase as any,
      getAllUseCase as any,
      getByIdUseCase as any,
      getByServiceOrderUseCase as any,
      getByVehicleUseCase as any,
      updateUseCase as any,
      updateDetailsUseCase as any,
      updateNotesUseCase as any,
    )

    // silence logger
    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {})
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createVehicleEvaluation', () => {
    it('returns created value on success and throws on failure', async () => {
      const dto: CreateVehicleEvaluationDto = {} as any
      const out: VehicleEvaluationResponseDto = { id: 've-1' } as any

      ;(controller as any).createVehicleEvaluationUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )

      await expect(controller.createVehicleEvaluation(dto)).resolves.toBe(out)
      ;(controller as any).createVehicleEvaluationUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('create-fail'),
      } as any)

      await expect(controller.createVehicleEvaluation(dto)).rejects.toThrow('create-fail')
    })
  })

  describe('getAllVehicleEvaluations', () => {
    it('returns paginated list on success and throws on failure', async () => {
      const out: PaginatedVehicleEvaluationsResponseDto = { data: [], meta: {} } as any

      ;(controller as any).getAllVehicleEvaluationsUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )

      await expect(controller.getAllVehicleEvaluations(1, 10)).resolves.toBe(out)
      ;(controller as any).getAllVehicleEvaluationsUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('all-fail'),
      } as any)

      await expect(controller.getAllVehicleEvaluations(1, 10)).rejects.toThrow('all-fail')
    })
  })

  describe('service-order / vehicle / id flows', () => {
    it('get by service order id success + failure', async () => {
      const out: VehicleEvaluationResponseDto = { id: 'sv-1' } as any

      ;(controller as any).getVehicleEvaluationByServiceOrderIdUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )

      await expect(controller.getVehicleEvaluationByServiceOrderId('so-1')).resolves.toBe(out)
      ;(controller as any).getVehicleEvaluationByServiceOrderIdUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('so-fail'),
      } as any)

      await expect(controller.getVehicleEvaluationByServiceOrderId('so-1')).rejects.toThrow(
        'so-fail',
      )
    })

    it('get by vehicle id success + failure', async () => {
      const arr = [{ id: 'v1' }] as any

      ;(controller as any).getVehicleEvaluationsByVehicleIdUseCase.execute.mockResolvedValue(
        new Success(arr) as any,
      )

      await expect(controller.getVehicleEvaluationsByVehicleId('veh-1')).resolves.toBe(arr)
      ;(controller as any).getVehicleEvaluationsByVehicleIdUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('veh-fail'),
      } as any)

      await expect(controller.getVehicleEvaluationsByVehicleId('veh-1')).rejects.toThrow('veh-fail')
    })

    it('get by id success + failure', async () => {
      const out: VehicleEvaluationResponseDto = { id: 've-1' } as any

      ;(controller as any).getVehicleEvaluationByIdUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )

      await expect(controller.getVehicleEvaluationById('ve-1')).resolves.toBe(out)
      ;(controller as any).getVehicleEvaluationByIdUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('id-fail'),
      } as any)

      await expect(controller.getVehicleEvaluationById('ve-1')).rejects.toThrow('id-fail')
    })
  })

  describe('update flows', () => {
    it('update, updateDetails, mechanicNotes success + failures', async () => {
      const out: VehicleEvaluationResponseDto = { id: 've-1' } as any

      ;(controller as any).updateVehicleEvaluationUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )
      await expect(
        controller.updateVehicleEvaluation('ve-1', {} as UpdateVehicleEvaluationDto),
      ).resolves.toBe(out)
      ;(controller as any).updateVehicleEvaluationUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('upd-fail'),
      } as any)
      await expect(
        controller.updateVehicleEvaluation('ve-1', {} as UpdateVehicleEvaluationDto),
      ).rejects.toThrow('upd-fail')

      // details
      ;(controller as any).updateVehicleEvaluationDetailsUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )
      await expect(controller.updateVehicleEvaluationDetails('ve-1', {} as any)).resolves.toBe(out)
      ;(controller as any).updateVehicleEvaluationDetailsUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('det-fail'),
      } as any)
      await expect(controller.updateVehicleEvaluationDetails('ve-1', {} as any)).rejects.toThrow(
        'det-fail',
      )

      // mechanic notes
      ;(controller as any).updateVehicleEvaluationMechanicNotesUseCase.execute.mockResolvedValue(
        new Success(out) as any,
      )
      await expect(controller.updateVehicleEvaluationMechanicNotes('ve-1', 'n')).resolves.toBe(out)
      ;(controller as any).updateVehicleEvaluationMechanicNotesUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('notes-fail'),
      } as any)
      await expect(controller.updateVehicleEvaluationMechanicNotes('ve-1', 'n')).rejects.toThrow(
        'notes-fail',
      )
    })
  })

  describe('delete flow', () => {
    it('delete returns void on success and throws on failure', async () => {
      ;(controller as any).deleteVehicleEvaluationUseCase.execute.mockResolvedValue({
        isFailure: false,
        isSuccess: true,
      } as any)

      await expect(controller.deleteVehicleEvaluation('ve-1')).resolves.toBeUndefined()
      ;(controller as any).deleteVehicleEvaluationUseCase.execute.mockResolvedValue({
        isFailure: true,
        error: new Error('del-fail'),
      } as any)

      await expect(controller.deleteVehicleEvaluation('ve-1')).rejects.toThrow('del-fail')
    })
  })
})
