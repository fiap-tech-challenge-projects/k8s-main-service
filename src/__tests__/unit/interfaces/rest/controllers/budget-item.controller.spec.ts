import { NotFoundException } from '@nestjs/common'

import {
  CreateBudgetItemDto,
  UpdateBudgetItemDto,
  BudgetItemResponseDto,
  PaginatedBudgetItemsResponseDto,
} from '@application/budget-items/dto'
import {
  CreateBudgetItemUseCase,
  GetBudgetItemByIdUseCase,
  GetAllBudgetItemsUseCase,
  UpdateBudgetItemUseCase,
  DeleteBudgetItemUseCase,
} from '@application/budget-items/use-cases'
import { BudgetItemController } from '@interfaces/rest/controllers'
import { Success } from '@shared'

describe('BudgetItemController', () => {
  let controller: BudgetItemController
  let createBudgetItemUseCase: jest.Mocked<CreateBudgetItemUseCase>
  let getBudgetItemByIdUseCase: jest.Mocked<GetBudgetItemByIdUseCase>
  let getAllBudgetItemsUseCase: jest.Mocked<GetAllBudgetItemsUseCase>
  let updateBudgetItemUseCase: jest.Mocked<UpdateBudgetItemUseCase>
  let deleteBudgetItemUseCase: jest.Mocked<DeleteBudgetItemUseCase>

  const budgetItemResponse: BudgetItemResponseDto = {
    id: 'budget-item-1',
    type: 'SERVICE',
    description: 'Troca de óleo',
    quantity: 2,
    unitPrice: '100',
    totalPrice: '200',
    budgetId: 'budget-1',
    notes: 'Usar óleo sintético',
    stockItemId: undefined,
    serviceId: 'service-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  }

  beforeEach(async () => {
    createBudgetItemUseCase = {
      execute: jest.fn(),
    } as any

    getBudgetItemByIdUseCase = {
      execute: jest.fn(),
    } as any

    getAllBudgetItemsUseCase = {
      execute: jest.fn(),
    } as any

    updateBudgetItemUseCase = {
      execute: jest.fn(),
    } as any

    deleteBudgetItemUseCase = {
      execute: jest.fn(),
    } as any

    controller = new BudgetItemController(
      createBudgetItemUseCase as any,
      getBudgetItemByIdUseCase as any,
      getAllBudgetItemsUseCase as any,
      updateBudgetItemUseCase as any,
      deleteBudgetItemUseCase as any,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a budget item', async () => {
      createBudgetItemUseCase.execute.mockResolvedValue(new Success(budgetItemResponse))
      const dto: CreateBudgetItemDto = {
        type: 'SERVICE',
        description: 'Troca de óleo',
        quantity: 2,
        unitPrice: '100',
        budgetId: 'budget-1',
        notes: 'Usar óleo sintético',
        serviceId: 'service-1',
      }
      const result = await controller.create(dto)
      expect(result).toEqual(budgetItemResponse)
      expect(createBudgetItemUseCase.execute).toHaveBeenCalledWith(dto)
    })

    it('should log and throw on error', async () => {
      createBudgetItemUseCase.execute.mockRejectedValue(new Error('fail'))
      const dto: CreateBudgetItemDto = {
        type: 'SERVICE',
        description: 'Troca de óleo',
        quantity: 2,
        unitPrice: '100',
        budgetId: 'budget-1',
        notes: 'Usar óleo sintético',
        serviceId: 'service-1',
      }
      await expect(controller.create(dto)).rejects.toThrow('fail')
    })
  })

  describe('findAll', () => {
    it('should return paginated budget items', async () => {
      const paginated: PaginatedBudgetItemsResponseDto = {
        data: [budgetItemResponse],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }
      getAllBudgetItemsUseCase.execute.mockResolvedValue(new Success(paginated))
      const result = await controller.findAll(1, 10)
      expect(result).toEqual(paginated)
      expect(getAllBudgetItemsUseCase.execute).toHaveBeenCalledWith(1, 10)
    })

    it('should log and throw on error', async () => {
      getAllBudgetItemsUseCase.execute.mockRejectedValue(new Error('fail'))
      await expect(controller.findAll(1, 10)).rejects.toThrow('fail')
    })
  })

  describe('findById', () => {
    it('should return a budget item by id', async () => {
      getBudgetItemByIdUseCase.execute.mockResolvedValue(new Success(budgetItemResponse))
      const result = await controller.findById('budget-item-1')
      expect(result).toEqual(budgetItemResponse)
      expect(getBudgetItemByIdUseCase.execute).toHaveBeenCalledWith('budget-item-1')
    })

    it('should log and throw on error', async () => {
      getBudgetItemByIdUseCase.execute.mockRejectedValue(new Error('fail'))
      await expect(controller.findById('budget-item-1')).rejects.toThrow('fail')
    })
  })

  describe('update', () => {
    it('should update a budget item', async () => {
      updateBudgetItemUseCase.execute.mockResolvedValue(new Success(budgetItemResponse))
      const dto: UpdateBudgetItemDto = { description: 'Nova descrição' }
      const result = await controller.update('budget-item-1', dto)
      expect(result).toEqual(budgetItemResponse)
      expect(updateBudgetItemUseCase.execute).toHaveBeenCalledWith('budget-item-1', dto)
    })

    it('should log and throw on error', async () => {
      updateBudgetItemUseCase.execute.mockRejectedValue(new NotFoundException('not found'))
      await expect(controller.update('not-found', { description: 'x' })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('delete', () => {
    it('should delete a budget item', async () => {
      deleteBudgetItemUseCase.execute.mockResolvedValue(new Success(true))
      await expect(controller.delete('budget-item-1')).resolves.toBeUndefined()
      expect(deleteBudgetItemUseCase.execute).toHaveBeenCalledWith('budget-item-1')
    })

    it('should log and throw on error', async () => {
      deleteBudgetItemUseCase.execute.mockRejectedValue(new NotFoundException('not found'))
      await expect(controller.delete('not-found')).rejects.toThrow(NotFoundException)
    })
  })
})
