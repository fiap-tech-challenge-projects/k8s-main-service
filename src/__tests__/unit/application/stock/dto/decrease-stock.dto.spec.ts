import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { DecreaseStockDto } from '@application/stock/dto'

describe('DecreaseStockDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const data = {
        quantity: 5,
        reason: 'Used in service order',
      }

      // Act
      const dto = plainToInstance(DecreaseStockDto, data)
      const errors = await validate(dto)

      // Assert
      expect(errors).toHaveLength(0)
      expect(dto.quantity).toBe(5)
      expect(dto.reason).toBe('Used in service order')
    })

    it('should fail validation when quantity is not a number', async () => {
      // Arrange
      const data = {
        quantity: 'invalid',
        reason: 'Test reason',
      }

      // Act
      const dto = plainToInstance(DecreaseStockDto, data)
      const errors = await validate(dto)

      // Assert
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('quantity')
      expect(errors[0].constraints).toHaveProperty('isInt')
    })

    it('should fail validation when quantity is less than 1', async () => {
      // Arrange
      const data = {
        quantity: 0,
        reason: 'Test reason',
      }

      // Act
      const dto = plainToInstance(DecreaseStockDto, data)
      const errors = await validate(dto)

      // Assert
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('quantity')
      expect(errors[0].constraints).toHaveProperty('min')
    })

    it('should fail validation when reason is empty', async () => {
      // Arrange
      const data = {
        quantity: 5,
        reason: '',
      }

      // Act
      const dto = plainToInstance(DecreaseStockDto, data)
      const errors = await validate(dto)

      // Assert
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('reason')
      expect(errors[0].constraints).toHaveProperty('isNotEmpty')
    })

    it('should fail validation when reason is not a string', async () => {
      // Arrange
      const data = {
        quantity: 5,
        reason: 123,
      }

      // Act
      const dto = plainToInstance(DecreaseStockDto, data)
      const errors = await validate(dto)

      // Assert
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('reason')
      expect(errors[0].constraints).toHaveProperty('isString')
    })

    it('should trim whitespace from reason', async () => {
      // Arrange
      const data = {
        quantity: 5,
        reason: '  Used in service order  ',
      }

      // Act
      const dto = plainToInstance(DecreaseStockDto, data)

      // Assert
      expect(dto.reason).toBe('Used in service order')
    })
  })
})
