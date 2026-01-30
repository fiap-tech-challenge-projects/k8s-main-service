import { BusinessExceptionHandlerService } from '@shared/services'

describe('BusinessExceptionHandlerService', () => {
  let service: BusinessExceptionHandlerService

  beforeEach(() => {
    service = new BusinessExceptionHandlerService()
  })

  describe('getHttpStatusCode', () => {
    it('should return 409 for ClientAlreadyExistsException', () => {
      const exception = new Error('Client with email test@example.com already exists')
      exception.name = 'ClientAlreadyExistsException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(409)
    })

    it('should return 404 for ClientNotFoundException', () => {
      const exception = new Error('Client with id client-123 not found')
      exception.name = 'ClientNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 409 for EmployeeAlreadyExistsException', () => {
      const exception = new Error('Employee with email test@example.com already exists')
      exception.name = 'EmployeeAlreadyExistsException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(409)
    })

    it('should return 404 for EmployeeNotFoundException', () => {
      const exception = new Error('Employee with id employee-123 not found')
      exception.name = 'EmployeeNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 409 for StockItemAlreadyExistsException', () => {
      const exception = new Error('Stock item with SKU FLT-001 already exists')
      exception.name = 'StockItemAlreadyExistsException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(409)
    })

    it('should return 404 for StockItemNotFoundException', () => {
      const exception = new Error('Stock item with id stock-123 not found')
      exception.name = 'StockItemNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 404 for VehicleNotFoundException', () => {
      const exception = new Error('Vehicle with id vehicle-123 not found')
      exception.name = 'VehicleNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 404 for ServiceNotFoundException', () => {
      const exception = new Error('Service with id service-123 not found')
      exception.name = 'ServiceNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 404 for ServiceOrderNotFoundException', () => {
      const exception = new Error('Service order with id order-123 not found')
      exception.name = 'ServiceOrderNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 404 for ServiceExecutionNotFoundException', () => {
      const exception = new Error('Service execution with id execution-123 not found')
      exception.name = 'ServiceExecutionNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 404 for VehicleEvaluationNotFoundException', () => {
      const exception = new Error('Vehicle evaluation with id evaluation-123 not found')
      exception.name = 'VehicleEvaluationNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 400 for InvalidValueException', () => {
      const exception = new Error('Invalid value provided')
      exception.name = 'InvalidValueException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(400)
    })

    it('should return 404 for EntityNotFoundException', () => {
      const exception = new Error('Entity not found')
      exception.name = 'EntityNotFoundException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
    })

    it('should return 409 for AlreadyExistsException', () => {
      const exception = new Error('Entity already exists')
      exception.name = 'AlreadyExistsException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(409)
    })

    it('should return 500 for unknown exception', () => {
      const exception = new Error('Unknown error')
      exception.name = 'UnknownException'

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(500)
    })

    // Additional cases to improve branch coverage
    it('should return 401 for InvalidCredentialsException', () => {
      const exception = new Error('Invalid credentials')
      exception.name = 'InvalidCredentialsException'

      expect(service.getHttpStatusCode(exception)).toBe(401)
    })

    it('should return 403 for InactiveUserException', () => {
      const exception = new Error('User inactive')
      exception.name = 'InactiveUserException'

      expect(service.getHttpStatusCode(exception)).toBe(403)
    })

    it('should return 400 for AdminRoleNotAllowedException', () => {
      const exception = new Error('Admin role not allowed')
      exception.name = 'AdminRoleNotAllowedException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 409 for BudgetAlreadyApprovedException', () => {
      const exception = new Error('Budget already approved')
      exception.name = 'BudgetAlreadyApprovedException'

      expect(service.getHttpStatusCode(exception)).toBe(409)
    })

    it('should return 410 for BudgetExpiredException', () => {
      const exception = new Error('Budget expired')
      exception.name = 'BudgetExpiredException'

      expect(service.getHttpStatusCode(exception)).toBe(410)
    })

    it('should return 400 for InvalidServiceOrderStatusForBudgetItemException', () => {
      const exception = new Error('Invalid service order status for budget item')
      exception.name = 'InvalidServiceOrderStatusForBudgetItemException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for ClientInvalidCpfCnpjException', () => {
      const exception = new Error('Invalid CPF/CNPJ')
      exception.name = 'ClientInvalidCpfCnpjException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 403 for EmployeeInactiveException', () => {
      const exception = new Error('Employee inactive')
      exception.name = 'EmployeeInactiveException'

      expect(service.getHttpStatusCode(exception)).toBe(403)
    })

    it('should return 400 for EmployeeInvalidRoleException', () => {
      const exception = new Error('Invalid employee role')
      exception.name = 'EmployeeInvalidRoleException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for InvalidSkuFormatException', () => {
      const exception = new Error('Invalid SKU')
      exception.name = 'InvalidSkuFormatException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for InvalidPriceMarginException', () => {
      const exception = new Error('Invalid price margin')
      exception.name = 'InvalidPriceMarginException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for InsufficientStockException', () => {
      const exception = new Error('Insufficient stock')
      exception.name = 'InsufficientStockException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for InvalidStockMovementTypeException', () => {
      const exception = new Error('Invalid stock movement type')
      exception.name = 'InvalidStockMovementTypeException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for InvalidStockMovementDateException', () => {
      const exception = new Error('Invalid stock movement date')
      exception.name = 'InvalidStockMovementDateException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 409 for LicensePlateAlreadyExistsException', () => {
      const exception = new Error('License plate already exists')
      exception.name = 'LicensePlateAlreadyExistsException'

      expect(service.getHttpStatusCode(exception)).toBe(409)
    })

    it('should return 409 for VinAlreadyExistsException', () => {
      const exception = new Error('VIN already exists')
      exception.name = 'VinAlreadyExistsException'

      expect(service.getHttpStatusCode(exception)).toBe(409)
    })

    it('should return 409 for ServiceNameAlreadyExistsException', () => {
      const exception = new Error('Service name already exists')
      exception.name = 'ServiceNameAlreadyExistsException'

      expect(service.getHttpStatusCode(exception)).toBe(409)
    })

    it('should return 400 for InvalidPriceException', () => {
      const exception = new Error('Invalid price')
      exception.name = 'InvalidPriceException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for InvalidDeliveryDateException', () => {
      const exception = new Error('Invalid delivery date')
      exception.name = 'InvalidDeliveryDateException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 403 for ServiceOrderUnauthorizedOperationException', () => {
      const exception = new Error('Unauthorized operation')
      exception.name = 'ServiceOrderUnauthorizedOperationException'

      expect(service.getHttpStatusCode(exception)).toBe(403)
    })

    it('should return 409 for ServiceOrderAlreadyHasExecutionException', () => {
      const exception = new Error('Service order already has execution')
      exception.name = 'ServiceOrderAlreadyHasExecutionException'

      expect(service.getHttpStatusCode(exception)).toBe(409)
    })

    it('should return 400 for MechanicNotAssignedException', () => {
      const exception = new Error('Mechanic not assigned')
      exception.name = 'MechanicNotAssignedException'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 400 for ValidationError', () => {
      const exception = new Error('Validation failed')
      exception.name = 'ValidationError'

      expect(service.getHttpStatusCode(exception)).toBe(400)
    })

    it('should return 401 for UnauthorizedError', () => {
      const exception = new Error('Unauthorized')
      exception.name = 'UnauthorizedError'

      expect(service.getHttpStatusCode(exception)).toBe(401)
    })

    it('should return 403 for ForbiddenError', () => {
      const exception = new Error('Forbidden')
      exception.name = 'ForbiddenError'

      expect(service.getHttpStatusCode(exception)).toBe(403)
    })

    it('should return 409 for ConflictError', () => {
      const exception = new Error('Conflict')
      exception.name = 'ConflictError'

      expect(service.getHttpStatusCode(exception)).toBe(409)
    })
  })

  describe('getErrorMessage', () => {
    it('should return exception message', () => {
      const exception = new Error('Custom error message')

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Custom error message')
    })

    it('should return default message when exception has no message', () => {
      const exception = new Error()

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Business error')
    })
  })
})
