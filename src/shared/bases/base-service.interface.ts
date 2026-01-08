/**
 * Base service interface for all domain services
 * Provides common business logic operations that can be extended by specific services
 */
export interface IBaseService<T> {
  /**
   * Get an entity by its unique identifier
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  getById(id: string): Promise<T | null>

  /**
   * Get all entities with optional pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to an array of entities
   */
  getAll(page?: number, limit?: number): Promise<T[]>

  /**
   * Create a new entity with business logic validation
   * @param data - The entity data to create
   * @returns Promise resolving to the created entity
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>

  /**
   * Update an existing entity with business logic validation
   * @param id - The unique identifier of the entity to update
   * @param data - The partial data to update
   * @returns Promise resolving to the updated entity
   */
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T>

  /**
   * Delete an entity with business logic validation
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>
}
