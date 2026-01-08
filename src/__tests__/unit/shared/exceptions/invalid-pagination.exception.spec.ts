import { InvalidPaginationException } from '@shared/exceptions'

describe('InvalidPaginationException', () => {
  describe('constructor', () => {
    it('should create exception with correct message and name', () => {
      const message = 'Page number must be greater than 0'
      const exception = new InvalidPaginationException(message)

      expect(exception).toBeInstanceOf(InvalidPaginationException)
      expect(exception.message).toBe(message)
      expect(exception.name).toBe('InvalidPaginationException')
    })

    it('should create exception with custom message', () => {
      const message = 'Page 5 does not exist. Total pages: 3'
      const exception = new InvalidPaginationException(message)

      expect(exception.message).toBe(message)
      expect(exception.name).toBe('InvalidPaginationException')
    })
  })

  describe('inheritance', () => {
    it('should properly inherit from DomainException', () => {
      const exception = new InvalidPaginationException('Test message')

      expect(exception).toBeInstanceOf(Error)
      expect(exception.name).toBe('InvalidPaginationException')
    })
  })

  describe('error properties', () => {
    it('should have correct error name property', () => {
      const exception = new InvalidPaginationException('Test message')

      expect(exception.name).toBe('InvalidPaginationException')
    })

    it('should have stack trace', () => {
      const exception = new InvalidPaginationException('Test message')

      expect(exception.stack).toBeDefined()
      expect(typeof exception.stack).toBe('string')
      expect(exception.stack).toContain('InvalidPaginationException')
    })

    it('should be throwable and catchable', () => {
      let caughtException: InvalidPaginationException | null = null

      try {
        throw new InvalidPaginationException('Test message')
      } catch (error) {
        caughtException = error as InvalidPaginationException
      }

      expect(caughtException).not.toBeNull()
      expect(caughtException).toBeInstanceOf(InvalidPaginationException)
      expect(caughtException?.message).toBe('Test message')
    })
  })
})
