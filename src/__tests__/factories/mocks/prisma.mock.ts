import { PrismaClient } from '@prisma/client'

/**
 * Mock factory for Prisma client
 */
export class PrismaMockFactory {
  /**
   * Create a mock PrismaClient
   * @param overrides - Optional properties to override
   * @returns Mocked PrismaClient
   */
  public static createPrismaClientMock(
    overrides: Partial<PrismaClient> = {},
  ): jest.Mocked<PrismaClient> {
    const mock = {
      client: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      employee: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      vehicle: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      serviceOrder: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn(),
      $executeRaw: jest.fn(),
      $queryRaw: jest.fn(),
      ...overrides,
    } as unknown as jest.Mocked<PrismaClient>

    return mock
  }

  /**
   * Create a mock for Prisma model operations
   * @param overrides - Optional methods to override
   * @returns Mocked model operations
   */
  public static createPrismaModelMock(overrides: Record<string, jest.MockedFunction<any>> = {}) {
    const mock = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      ...overrides,
    }

    return mock
  }

  /**
   * Create a mock transaction
   * @param overrides - Optional methods to override
   * @returns Mocked transaction
   */
  public static createTransactionMock(overrides: Record<string, jest.MockedFunction<any>> = {}) {
    const mock = {
      client: this.createPrismaModelMock(),
      employee: this.createPrismaModelMock(),
      vehicle: this.createPrismaModelMock(),
      ...overrides,
    }

    return mock
  }
}
