import { Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import { IBaseRepository, PaginatedResult, InvalidPaginationException } from '@shared'

/**
 * Base Prisma repository class that provides common functionality
 * for all Prisma-based repositories
 */
export abstract class BasePrismaRepository<T, TPrismaModel> implements IBaseRepository<T> {
  protected readonly logger: Logger

  /**
   * Constructor for BasePrismaRepository
   * @param prisma - The Prisma client instance
   * @param loggerName - The name for the logger instance
   */
  constructor(
    protected readonly prisma: PrismaClient,
    loggerName: string,
  ) {
    this.logger = new Logger(loggerName)
  }

  /**
   * Get the Prisma model name for this repository
   */
  protected abstract get modelName(): string

  /**
   * Get the mapper function to convert Prisma model to domain entity
   */
  protected abstract get mapper(): (prismaModel: TPrismaModel) => T

  /**
   * Get the create data mapper function
   */
  protected abstract get createMapper(): (entity: T) => Record<string, unknown>

  /**
   * Get the update data mapper function
   */
  protected abstract get updateMapper(): (entity: T) => Record<string, unknown>

  /**
   * Find an entity by its unique identifier
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  async findById(id: string): Promise<T | null> {
    try {
      const model = this.prisma[this.modelName] as {
        findUnique: (params: { where: { id: string } }) => Promise<TPrismaModel | null>
      }

      const data = await model.findUnique({ where: { id } })

      if (!data) {
        return null
      }

      return this.mapper(data)
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName} by ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Find all entities with optional pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findAll(page?: number, limit?: number): Promise<PaginatedResult<T>> {
    return this.findPaginated({}, page, limit, { createdAt: 'desc' })
  }

  /**
   * Create a new entity
   * @param data - The entity data to create
   * @returns Promise resolving to the created entity
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const createData = this.createMapper(data as T)
      const model = this.prisma[this.modelName] as {
        create: (params: { data: Record<string, unknown> }) => Promise<TPrismaModel>
      }

      const createdData = await model.create({ data: createData })

      return this.mapper(createdData)
    } catch (error) {
      this.logger.error(`Error creating ${this.modelName}:`, error)
      throw error
    }
  }

  /**
   * Update an existing entity
   * @param id - The unique identifier of the entity to update
   * @param data - The partial data to update
   * @returns Promise resolving to the updated entity
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      const updateData = this.updateMapper(data as T)
      const model = this.prisma[this.modelName] as {
        update: (params: {
          where: { id: string }
          data: Record<string, unknown>
        }) => Promise<TPrismaModel>
      }

      const updatedData = await model.update({
        where: { id },
        data: updateData,
      })

      return this.mapper(updatedData)
    } catch (error) {
      this.logger.error(`Error updating ${this.modelName} ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete an entity by its unique identifier
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      const model = this.prisma[this.modelName] as {
        delete: (params: { where: { id: string } }) => Promise<TPrismaModel>
      }

      await model.delete({ where: { id } })
      return true
    } catch (error) {
      this.logger.error(`Error deleting ${this.modelName} ${id}:`, error)
      return false
    }
  }

  /**
   * Check if an entity exists by its unique identifier
   * @param id - The unique identifier to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    try {
      const model = this.prisma[this.modelName] as {
        count: (params: { where: { id: string } }) => Promise<number>
      }

      const count = await model.count({ where: { id } })
      return count > 0
    } catch (error) {
      this.logger.error(`Error checking if ${this.modelName} exists ${id}:`, error)
      throw error
    }
  }

  /**
   * Find entities with pagination and filtering
   * @param where - Where conditions
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param orderBy - Order by conditions
   * @returns Promise resolving to paginated result
   */
  protected async findPaginated(
    where: Record<string, unknown>,
    page?: number,
    limit?: number,
    orderBy?: Record<string, unknown>,
  ): Promise<PaginatedResult<T>> {
    try {
      // Validate pagination parameters
      if (page !== undefined && page < 1) {
        throw new InvalidPaginationException(`Page number must be greater than 0, got ${page}`)
      }

      if (limit !== undefined && limit < 1) {
        throw new InvalidPaginationException(`Limit must be greater than 0, got ${limit}`)
      }

      if (limit !== undefined && limit > 100) {
        throw new InvalidPaginationException(`Limit cannot exceed 100, got ${limit}`)
      }

      const take = limit ?? 10
      const currentPage = page ?? 1

      const model = this.prisma[this.modelName] as {
        findMany: (params: {
          where: Record<string, unknown>
          skip: number
          take: number
          orderBy?: Record<string, unknown>
        }) => Promise<TPrismaModel[]>
        count: (params: { where: Record<string, unknown> }) => Promise<number>
      }

      // First, get the total count to validate the page number
      const total = await model.count({ where })
      const totalPages = Math.ceil(total / take)

      // Validate that the requested page exists
      if (currentPage > totalPages && totalPages > 0) {
        throw new InvalidPaginationException(
          `Page ${currentPage} does not exist. Total pages: ${totalPages}`,
        )
      }

      const skip = (currentPage - 1) * take

      const data = await model.findMany({
        where,
        skip,
        take,
        orderBy,
      })

      const validData = data
        .map((item: TPrismaModel) => {
          try {
            return this.mapper(item)
          } catch (error) {
            this.logger.error(`Skipping ${this.modelName} with invalid data:`, error)
            return null
          }
        })
        .filter((item): item is T => item !== null)

      return {
        data: validData,
        meta: {
          total,
          page: currentPage,
          limit: take,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      }
    } catch (error) {
      this.logger.error(`Error finding paginated ${this.modelName}:`, error)
      throw error
    }
  }

  /**
   * Find a single entity by a unique field
   * @param field - The field name to search by
   * @param value - The value to search for
   * @returns Promise resolving to the entity or null if not found
   */
  protected async findByUniqueField(field: string, value: string): Promise<T | null> {
    try {
      const model = this.prisma[this.modelName] as {
        findUnique: (params: { where: Record<string, string> }) => Promise<TPrismaModel | null>
      }

      const data = await model.findUnique({ where: { [field]: value } })

      if (!data) {
        return null
      }

      return this.mapper(data)
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName} by ${field} ${value}:`, error)
      throw error
    }
  }

  /**
   * Check if a unique field value exists
   * @param field - The field name to check
   * @param value - The value to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  protected async uniqueFieldExists(field: string, value: string): Promise<boolean> {
    try {
      const model = this.prisma[this.modelName] as {
        count: (params: { where: Record<string, string> }) => Promise<number>
      }

      const count = await model.count({ where: { [field]: value } })
      return count > 0
    } catch (error) {
      this.logger.error(`Error checking if ${field} exists ${value}:`, error)
      throw error
    }
  }
}
