/**
 * Base entity class for all domain entities
 * Provides common properties and methods that all entities should have
 *
 * This class should be in domain/utils because:
 * 1. It's a generic utility that can be used across all domain entities
 * 2. It doesn't contain business logic, just common structure
 * 3. It follows the DRY principle by providing shared functionality
 */
export abstract class BaseEntity {
  /**
   * Unique identifier for the entity
   */
  public readonly id: string

  /**
   * Timestamp when the entity was created
   */
  public readonly createdAt: Date

  /**
   * Timestamp when the entity was last updated
   */
  public updatedAt: Date

  /**
   * Constructor for base entity
   * @param id - Unique identifier
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  constructor(id: string, createdAt: Date, updatedAt: Date) {
    this.id = id
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Check if this entity equals another entity
   * @param entity - The entity to compare with
   * @returns True if entities are equal, false otherwise
   */
  public equals(entity: BaseEntity): boolean {
    if (entity === null || entity === undefined) {
      return false
    }

    if (this === entity) {
      return true
    }

    return this.id === entity.id
  }

  /**
   * Get the entity's hash code
   * @returns Hash code based on the entity's ID
   */
  public hashCode(): number {
    let hash = 0
    for (let i = 0; i < this.id.length; i++) {
      const char = this.id.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  /**
   * Convert entity to string representation
   * @returns String representation of the entity
   */
  public toString(): string {
    return `${this.constructor.name}(id=${this.id})`
  }
}
