import { PrismaErrorHandlerService } from '@shared/services'

describe('PrismaErrorHandlerService', () => {
  let service: PrismaErrorHandlerService

  beforeEach(() => {
    service = new PrismaErrorHandlerService()
  })

  describe('getHttpStatusCode', () => {
    it('should return 409 for P2002 (unique constraint violation)', () => {
      const exception = new Error('Unique constraint violation')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2002'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(409)
    })

    it('should return 400 for P2003 (foreign key constraint violation)', () => {
      const exception = new Error('Foreign key constraint violation')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2003'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 404 for P2025 (record not found)', () => {
      const exception = new Error('Record not found')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2025'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 500 for P2021 (table does not exist)', () => {
      const exception = new Error('Table does not exist')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2021'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500)
    })

    it('should return 500 for P2022 (column does not exist)', () => {
      const exception = new Error('Column does not exist')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2022'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500)
    })

    it('should return 400 for P2014 (invalid ID provided)', () => {
      const exception = new Error('Invalid ID provided')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2014'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 404 for P2015 (related record not found)', () => {
      const exception = new Error('Related record not found')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2015'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 400 for P2016 (query interpretation error)', () => {
      const exception = new Error('Query interpretation error')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2016'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 400 for P2017 (relation not connected)', () => {
      const exception = new Error('Relation not connected')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2017'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 404 for P2018 (connected records not found)', () => {
      const exception = new Error('Connected records not found')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2018'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 400 for P2019 (input error)', () => {
      const exception = new Error('Input error')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2019'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 400 for P2020 (value out of range)', () => {
      const exception = new Error('Value out of range')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2020'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 500 for unknown Prisma error code', () => {
      const exception = new Error('Unknown Prisma error')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P9999'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500)
    })

    it('should return 500 for non-Prisma error', () => {
      const exception = new Error('Regular error')

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500)
    })

    it('should detect Prisma error by name', () => {
      const exception = new Error('Prisma error')
      exception.name = 'PrismaClientKnownRequestError'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500) // Default for unknown code
    })

    it('should detect Prisma error by message content', () => {
      const exception = new Error('Database connection failed')

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500)
    })
  })

  describe('getErrorMessage', () => {
    it('should return specific message for P2002 with field information', () => {
      const exception = new Error('Unique constraint violation')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2002'
      ;(exception as any).meta = { target: ['email'] }

      const result = service.getErrorMessage(exception)

      expect(result).toBe('A record with this email already exists')
    })

    it('should return specific message for P2002 with CPF/CNPJ field', () => {
      const exception = new Error('Unique constraint violation')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2002'
      ;(exception as any).meta = { target: ['cpfCnpj'] }

      const result = service.getErrorMessage(exception)

      expect(result).toBe('A record with this CPF/CNPJ already exists')
    })

    it('should return generic message for P2002 without field information', () => {
      const exception = new Error('Unique constraint violation')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2002'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('A record with this unique field already exists')
    })

    it('should return specific message for P2003', () => {
      const exception = new Error('Foreign key constraint violation')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2003'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Referenced record does not exist')
    })

    it('should return specific message for P2025', () => {
      const exception = new Error('Record not found')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2025'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Record not found')
    })

    it('should return specific message for P2021', () => {
      const exception = new Error('Table does not exist')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2021'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Database table does not exist')
    })

    it('should return specific message for P2022', () => {
      const exception = new Error('Column does not exist')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2022'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Database column does not exist')
    })

    it('should return specific message for P2014', () => {
      const exception = new Error('Invalid ID provided')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2014'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Invalid ID provided')
    })

    it('should return specific message for P2015', () => {
      const exception = new Error('Related record not found')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2015'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Related record not found')
    })

    it('should return specific message for P2016', () => {
      const exception = new Error('Query interpretation error')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2016'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Query interpretation error')
    })

    it('should return specific message for P2017', () => {
      const exception = new Error('Relation not connected')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2017'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Relation not connected')
    })

    it('should return specific message for P2018', () => {
      const exception = new Error('Connected records not found')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2018'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Connected records not found')
    })

    it('should return specific message for P2019', () => {
      const exception = new Error('Input error')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2019'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Input error')
    })

    it('should return specific message for P2020', () => {
      const exception = new Error('Value out of range')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as any).code = 'P2020'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Value out of range')
    })

    it('should return exception message for unknown Prisma error code', () => {
      const exception = new Error('Unknown Prisma error')
      exception.name = 'PrismaClientKnownRequestError'
      ;(exception as { code?: string }).code = 'P9999'

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Unknown Prisma error')
    })

    it('should return exception message for non-Prisma error', () => {
      const exception = new Error('Custom error message')

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Custom error message')
    })

    it('should return default message when exception has no message', () => {
      const exception = new Error()

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Database error')
    })
  })
})
