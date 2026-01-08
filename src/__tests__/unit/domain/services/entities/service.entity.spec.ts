import { Service } from '@domain/services/entities'
import { Price, EstimatedDuration } from '@domain/services/value-objects'

describe('Service Entity', () => {
  const mockPrice = Price.create('1000,00')
  const mockDuration = EstimatedDuration.create('01:30:00')

  describe('constructor', () => {
    it('should create a Service instance with all required properties', () => {
      const createdAt = new Date('2023-01-01T10:00:00Z')
      const updatedAt = new Date('2023-01-02T10:00:00Z')

      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
        createdAt,
        updatedAt,
      )

      expect(service.id).toBe('service-123')
      expect(service.name).toBe('Oil Change')
      expect(service.price).toBe(mockPrice)
      expect(service.description).toBe('Complete engine oil replacement')
      expect(service.estimatedDuration).toBe(mockDuration)
      expect(service.createdAt).toBe(createdAt)
      expect(service.updatedAt).toBe(updatedAt)
    })

    it('should create a Service instance with default timestamps when not provided', () => {
      const beforeCreation = new Date()

      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
      )

      const afterCreation = new Date()

      expect(service.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(service.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
      expect(service.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(service.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })

  describe('create', () => {
    it('should create a new Service instance using factory method', () => {
      const service = Service.create(
        'Oil Change',
        '1000,00',
        'Complete engine oil replacement',
        '01:30:00',
      )

      expect(service).toBeInstanceOf(Service)
      expect(service.name).toBe('Oil Change')
      expect(service.description).toBe('Complete engine oil replacement')
      expect(service.price).toBeInstanceOf(Price)
      expect(service.estimatedDuration).toBeInstanceOf(EstimatedDuration)
      expect(service.id).toBe('') // Factory method creates empty ID
    })

    it('should create Service with current timestamp', () => {
      const beforeCreation = new Date()
      const service = Service.create(
        'Oil Change',
        '1000,00',
        'Complete engine oil replacement',
        '01:30:00',
      )
      const afterCreation = new Date()

      expect(service.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(service.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
      expect(service.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(service.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })

  describe('updateName', () => {
    it('should update the service name and timestamp', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
        new Date('2023-01-01T10:00:00Z'),
        new Date('2023-01-01T10:00:00Z'),
      )

      const originalUpdatedAt = service.updatedAt

      // Wait a small amount to ensure timestamp difference
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-01-01T11:00:00Z'))

      service.updateName('Premium Oil Change')

      expect(service.name).toBe('Premium Oil Change')
      expect(service.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())

      jest.useRealTimers()
    })
  })

  describe('updateDescription', () => {
    it('should update the service description and timestamp', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
        new Date('2023-01-01T10:00:00Z'),
        new Date('2023-01-01T10:00:00Z'),
      )

      const originalUpdatedAt = service.updatedAt

      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-01-01T11:00:00Z'))

      service.updateDescription('Premium engine oil replacement with filter')

      expect(service.description).toBe('Premium engine oil replacement with filter')
      expect(service.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())

      jest.useRealTimers()
    })
  })

  describe('updatePrice', () => {
    it('should update the service price and timestamp', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
        new Date('2023-01-01T10:00:00Z'),
        new Date('2023-01-01T10:00:00Z'),
      )

      const originalUpdatedAt = service.updatedAt

      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-01-01T11:00:00Z'))

      service.updatePrice('1200,00')

      expect(service.price).toBeInstanceOf(Price)
      expect(service.price.getValue()).toBe(120000) // 1200,00 in cents
      expect(service.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())

      jest.useRealTimers()
    })

    it('should create new Price value object when updating', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
      )

      const originalPrice = service.price

      service.updatePrice('1500,00')

      expect(service.price).not.toBe(originalPrice)
      expect(service.price).toBeInstanceOf(Price)
    })
  })

  describe('updateEstimatedDuration', () => {
    it('should update the service estimated duration and timestamp', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
        new Date('2023-01-01T10:00:00Z'),
        new Date('2023-01-01T10:00:00Z'),
      )

      const originalUpdatedAt = service.updatedAt

      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-01-01T11:00:00Z'))

      service.updateEstimatedDuration('02:00:00')

      expect(service.estimatedDuration).toBeInstanceOf(EstimatedDuration)
      expect(service.estimatedDuration.getValue()).toBeCloseTo(2.0) // 02:00:00 in hours
      expect(service.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())

      jest.useRealTimers()
    })

    it('should create new EstimatedDuration value object when updating', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
      )

      const originalDuration = service.estimatedDuration

      service.updateEstimatedDuration('02:30:00')

      expect(service.estimatedDuration).not.toBe(originalDuration)
      expect(service.estimatedDuration).toBeInstanceOf(EstimatedDuration)
    })
  })

  describe('getFormattedPrice', () => {
    it('should return formatted price from Price value object', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
      )

      const getFormattedSpy = jest.spyOn(mockPrice, 'getFormatted').mockReturnValue('R$ 1.000,00')

      const formattedPrice = service.getFormattedPrice()

      expect(getFormattedSpy).toHaveBeenCalled()
      expect(formattedPrice).toBe('R$ 1.000,00')

      getFormattedSpy.mockRestore()
    })
  })

  describe('getFormattedDuration', () => {
    it('should return formatted duration from EstimatedDuration value object', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
      )

      const getFormattedSpy = jest.spyOn(mockDuration, 'getFormatted').mockReturnValue('01:30:00')

      const formattedDuration = service.getFormattedDuration()

      expect(getFormattedSpy).toHaveBeenCalled()
      expect(formattedDuration).toBe('01:30:00')

      getFormattedSpy.mockRestore()
    })
  })

  describe('inheritance from BaseEntity', () => {
    it('should inherit id, createdAt, and updatedAt properties from BaseEntity', () => {
      const service = new Service(
        'service-123',
        'Oil Change',
        mockPrice,
        'Complete engine oil replacement',
        mockDuration,
      )

      expect(service.id).toBeDefined()
      expect(service.createdAt).toBeInstanceOf(Date)
      expect(service.updatedAt).toBeInstanceOf(Date)
    })
  })
})
