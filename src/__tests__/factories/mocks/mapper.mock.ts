/**
 * Mock factory for mapper classes
 */
export class MapperMockFactory {
  /**
   * Create a mock for Client Mapper
   * @param overrides - Optional methods to override
   * @returns Mocked mapper
   */
  public static createClientMapperMock(overrides: Record<string, jest.MockedFunction<any>> = {}) {
    const mock = {
      toResponseDto: jest.fn(),
      toPaginatedResponseDto: jest.fn(),
      toEntity: jest.fn(),
      toEntityArray: jest.fn(),
      ...overrides,
    }

    return mock
  }

  /**
   * Create a mock for Employee Mapper
   * @param overrides - Optional methods to override
   * @returns Mocked mapper
   */
  public static createEmployeeMapperMock(overrides: Record<string, jest.MockedFunction<any>> = {}) {
    const mock = {
      toResponseDto: jest.fn(),
      toPaginatedResponseDto: jest.fn(),
      toEntity: jest.fn(),
      toEntityArray: jest.fn(),
      ...overrides,
    }

    return mock
  }

  /**
   * Create a mock for Vehicle Mapper
   * @param overrides - Optional methods to override
   * @returns Mocked mapper
   */
  public static createVehicleMapperMock(overrides: Record<string, jest.MockedFunction<any>> = {}) {
    const mock = {
      toResponseDto: jest.fn(),
      toPaginatedResponseDto: jest.fn(),
      toEntity: jest.fn(),
      toEntityArray: jest.fn(),
      ...overrides,
    }

    return mock
  }

  /**
   * Create a generic mock mapper
   * @param overrides - Optional methods to override
   * @returns Mocked mapper
   */
  public static createGenericMapperMock(overrides: Record<string, jest.MockedFunction<any>> = {}) {
    const mock = {
      toResponseDto: jest.fn(),
      toPaginatedResponseDto: jest.fn(),
      toEntity: jest.fn(),
      toEntityArray: jest.fn(),
      toDomain: jest.fn(),
      fromDomain: jest.fn(),
      ...overrides,
    }

    return mock
  }
}
