import { ServiceExecution, ServiceExecutionStatus } from '@domain/service-executions/entities'

/**
 * Factory for creating ServiceExecution entities for testing
 */
export class ServiceExecutionFactory {
  /**
   * Create a valid ServiceExecution entity
   * @param overrides - Optional properties to override defaults
   * @returns ServiceExecution entity
   */
  public static create(
    overrides: Partial<{
      id: string
      serviceOrderId: string
      mechanicId: string
      status: ServiceExecutionStatus
      startTime: Date
      endTime: Date
      notes: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): ServiceExecution {
    const defaults = {
      id: `service-execution-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceOrderId: 'so-1234567890abcdef',
      mechanicId: 'emp-1234567890abcdef',
      status: ServiceExecutionStatus.ASSIGNED,
      startTime: undefined,
      endTime: undefined,
      notes: 'Test service execution notes',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new ServiceExecution(
      data.id,
      data.serviceOrderId,
      data.status,
      data.startTime,
      data.endTime,
      data.notes,
      data.mechanicId,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create multiple ServiceExecution entities
   * @param count - Number of entities to create
   * @param baseOverrides - Base overrides to apply to all entities
   * @returns Array of ServiceExecution entities
   */
  public static createMany(
    count: number,
    baseOverrides: Partial<{
      id: string
      serviceOrderId: string
      mechanicId: string
      status: ServiceExecutionStatus
      startTime: Date
      endTime: Date
      notes: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): ServiceExecution[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...baseOverrides,
        id: `${baseOverrides.id ?? 'service-execution-test'}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        serviceOrderId: baseOverrides.serviceOrderId ?? `so-${index + 1}`,
        mechanicId: baseOverrides.mechanicId ?? `emp-${index + 1}`,
      }),
    )
  }

  /**
   * Create a ServiceExecution entity with IN_PROGRESS status
   * @param overrides - Optional properties to override defaults
   * @returns ServiceExecution entity
   */
  public static createInProgress(
    overrides: Partial<{
      id: string
      serviceOrderId: string
      mechanicId: string
      startTime: Date
      endTime: Date
      notes: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): ServiceExecution {
    return this.create({
      ...overrides,
      status: ServiceExecutionStatus.IN_PROGRESS,
      startTime: overrides.startTime ?? new Date('2024-01-01T10:00:00.000Z'),
    })
  }

  /**
   * Create a ServiceExecution entity with COMPLETED status
   * @param overrides - Optional properties to override defaults
   * @returns ServiceExecution entity
   */
  public static createCompleted(
    overrides: Partial<{
      id: string
      serviceOrderId: string
      mechanicId: string
      startTime: Date
      endTime: Date
      notes: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): ServiceExecution {
    return this.create({
      ...overrides,
      status: ServiceExecutionStatus.COMPLETED,
      startTime: overrides.startTime ?? new Date('2024-01-01T10:00:00.000Z'),
      endTime: overrides.endTime ?? new Date('2024-01-01T12:00:00.000Z'),
    })
  }

  /**
   * Create a ServiceExecution entity without mechanic
   * @param overrides - Optional properties to override defaults
   * @returns ServiceExecution entity
   */
  public static createWithoutMechanic(
    overrides: Partial<{
      id: string
      serviceOrderId: string
      status: ServiceExecutionStatus
      startTime: Date
      endTime: Date
      notes: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): ServiceExecution {
    return this.create({
      ...overrides,
      mechanicId: undefined,
    })
  }
}
