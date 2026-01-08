import { jest } from '@jest/globals'

import { BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'

describe('BudgetItemMapper', () => {
  it('maps entity to response dto and array mapping', () => {
    const created = new Date('2023-03-01T08:00:00.000Z')
    const updated = new Date('2023-03-02T09:00:00.000Z')

    const entity: any = {
      id: 'bi_1',
      type: 'service',
      description: 'desc',
      quantity: 3,
      getFormattedUnitPrice: () => 'R$10,00',
      getFormattedTotalPrice: () => 'R$30,00',
      budgetId: 'b_1',
      notes: 'note',
      stockItemId: 's_1',
      serviceId: 'sv_1',
      createdAt: created,
      updatedAt: updated,
    }

    const dto: BudgetItemResponseDto = BudgetItemMapper.toResponseDto(entity)

    expect(dto.id).toBe('bi_1')
    expect(dto.unitPrice).toBe('R$10,00')
    expect(dto.totalPrice).toBe('R$30,00')
    expect(dto.createdAt).toBe(created)
    expect(dto.updatedAt).toBe(updated)

    const arr = BudgetItemMapper.toResponseDtoArray([entity])
    expect(arr).toHaveLength(1)
    expect(arr[0].id).toBe('bi_1')
  })

  it('applies updates from UpdateBudgetItemDto only when values differ', () => {
    const existing: any = {
      type: 'service',
      description: 'old',
      quantity: 1,
      getFormattedUnitPrice: () => 'R$10,00',
      notes: 'old',
      stockItemId: 's_1',
      serviceId: 'sv_1',
      updateType: jest.fn(),
      updateDescription: jest.fn(),
      updateQuantity: jest.fn(),
      updateUnitPrice: jest.fn(),
      updateNotes: jest.fn(),
      updateStockItemId: jest.fn(),
      updateServiceId: jest.fn(),
    }

    const dto: any = {
      type: 'part', // different -> should call updateType
      description: 'old', // same -> should NOT call updateDescription
      quantity: 2, // different -> updateQuantity
      unitPrice: 'R$12,00', // different from getFormattedUnitPrice -> updateUnitPrice
      notes: 'new notes', // different -> updateNotes
      stockItemId: 's_2', // different -> updateStockItemId
      serviceId: 'sv_2', // different -> updateServiceId
    }

    const ret = BudgetItemMapper.fromUpdateDto(dto, existing)

    // Return value should be the same mutated existing
    expect(ret).toBe(existing)

    expect(existing.updateType).toHaveBeenCalledTimes(1)
    expect(existing.updateDescription).not.toHaveBeenCalled()
    expect(existing.updateQuantity).toHaveBeenCalledWith(2)
    expect(existing.updateUnitPrice).toHaveBeenCalledWith('R$12,00')
    expect(existing.updateNotes).toHaveBeenCalledWith('new notes')
    expect(existing.updateStockItemId).toHaveBeenCalledWith('s_2')
    expect(existing.updateServiceId).toHaveBeenCalledWith('sv_2')
  })
})

// Always neutralize validateBaseMapper before importing mapper modules because
// the production mappers call validateBaseMapper at top-level during import.

describe('BudgetItemMapper', () => {
  it('toResponseDtoArray maps domain items to DTOs', async () => {
    jest.resetModules()
    jest.doMock('@shared', () => ({ validateBaseMapper: () => {} }))

    const { BudgetItemMapper } = await import('@application/budget-items/mappers')

    const items = [
      {
        id: 'i1',
        type: 'part',
        description: 'd',
        quantity: 2,
        getFormattedUnitPrice: () => '10.00',
        getFormattedTotalPrice: () => '20.00',
        budgetId: 'b1',
        notes: 'n',
        stockItemId: 's1',
        serviceId: 'svc1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const dtos = BudgetItemMapper.toResponseDtoArray(items as any)

    expect(dtos).toHaveLength(1)
    expect(dtos[0].id).toBe('i1')
    expect(dtos[0].unitPrice).toBe('10.00')
    expect(dtos[0].totalPrice).toBe('20.00')
  })

  it('fromCreateDto calls BudgetItem.create with correct args and returns created entity', async () => {
    jest.resetModules()
    jest.doMock('@shared', () => ({ validateBaseMapper: () => {} }))

    const createMock = jest.fn().mockReturnValue({ id: 'new-item' })
    jest.doMock('@domain/budget-items/entities', () => ({ BudgetItem: { create: createMock } }))

    const { BudgetItemMapper } = await import('@application/budget-items/mappers')

    const dto: any = {
      type: 'service',
      description: 'd',
      quantity: 3,
      unitPrice: '10.00',
      budgetId: 'b1',
      notes: 'n',
      stockItemId: 's1',
      serviceId: 'svc1',
    }

    const created = BudgetItemMapper.fromCreateDto(dto)

    expect(createMock).toHaveBeenCalledWith('service', 'd', 3, '10.00', 'b1', 'n', 's1', 'svc1')
    expect(created).toEqual({ id: 'new-item' })
  })

  it('fromUpdateDto updates only changed fields and returns the same entity', async () => {
    jest.resetModules()
    jest.doMock('@shared', () => ({ validateBaseMapper: () => {} }))

    const { BudgetItemMapper } = await import('@application/budget-items/mappers')

    const updateFns = {
      updateType: jest.fn(),
      updateDescription: jest.fn(),
      updateQuantity: jest.fn(),
      updateUnitPrice: jest.fn(),
      updateNotes: jest.fn(),
      updateStockItemId: jest.fn(),
      updateServiceId: jest.fn(),
    }

    const existing: any = {
      id: 'i1',
      type: 'old',
      description: 'old-desc',
      quantity: 1,
      getFormattedUnitPrice: () => 'R$ 1,00',
      notes: 'old-note',
      stockItemId: 'old-stock',
      serviceId: 'old-svc',
      ...updateFns,
    }

    const dto: any = {
      type: 'new',
      description: 'new-desc',
      quantity: 2,
      unitPrice: 'R$ 2,00',
      notes: 'new-note',
      stockItemId: 'new-stock',
      serviceId: 'new-svc',
    }

    const updated = BudgetItemMapper.fromUpdateDto(dto, existing)

    expect(updateFns.updateType).toHaveBeenCalledWith('new')
    expect(updateFns.updateDescription).toHaveBeenCalledWith('new-desc')
    expect(updateFns.updateQuantity).toHaveBeenCalledWith(2)
    expect(updateFns.updateUnitPrice).toHaveBeenCalledWith('R$ 2,00')
    expect(updateFns.updateNotes).toHaveBeenCalledWith('new-note')
    expect(updateFns.updateStockItemId).toHaveBeenCalledWith('new-stock')
    expect(updateFns.updateServiceId).toHaveBeenCalledWith('new-svc')
    expect(updated).toBe(existing)
  })

  it('toResponseDto maps entity to dto', async () => {
    jest.resetModules()
    jest.doMock('@shared', () => ({ validateBaseMapper: () => {} }))

    const { BudgetItemMapper } = await import('@application/budget-items/mappers')

    const entity: any = {
      id: 'bi-1',
      type: 'part',
      description: 'desc',
      quantity: 2,
      getFormattedUnitPrice: () => '10.50',
      getFormattedTotalPrice: () => '21.00',
      budgetId: 'b1',
      notes: 'n',
      stockItemId: 's1',
      serviceId: 'svc1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const dto = BudgetItemMapper.toResponseDto(entity as any)

    expect(dto.id).toBe('bi-1')
    expect(dto.description).toBe('desc')
    expect(dto.quantity).toBe(2)
    expect(dto.unitPrice).toBe('10.50')
  })

  it('fromUpdateDto does nothing when dto equals existing', async () => {
    jest.resetModules()
    jest.doMock('@shared', () => ({ validateBaseMapper: () => {} }))

    const { BudgetItemMapper } = await import('@application/budget-items/mappers')

    const budgetItem: any = {
      description: 'same',
      quantity: 1,
      getDescription: () => 'same',
      getQuantity: () => 1,
      getFormattedUnitPrice: () => '5.00',
      notes: 'n',
      stockItemId: 's1',
      serviceId: 'svc1',
      updateDescription: jest.fn(),
      updateQuantity: jest.fn(),
      updateUnitPrice: jest.fn(),
    }

    const out = BudgetItemMapper.fromUpdateDto(
      { description: 'same', quantity: 1, unitPrice: '5.00' } as any,
      budgetItem as any,
    )

    expect(out).toBe(budgetItem)
    expect(budgetItem.updateDescription).not.toHaveBeenCalled()
    expect(budgetItem.updateQuantity).not.toHaveBeenCalled()
    expect(budgetItem.updateUnitPrice).not.toHaveBeenCalled()
  })
})
