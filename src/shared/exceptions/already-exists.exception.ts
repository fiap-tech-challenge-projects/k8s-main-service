import { DomainException } from './domain-exception'

/**
 * Base exception for entities that already exist
 * Can be extended by specific domains to provide more context
 */
export class AlreadyExistsException extends DomainException {
  /**
   * Constructor for AlreadyExistsException
   * @param entityName - The name of the entity type
   * @param fieldName - The field that caused the conflict
   * @param fieldValue - The value that already exists
   */
  constructor(entityName: string, fieldName: string, fieldValue: string) {
    super(`${entityName} with ${fieldName} '${fieldValue}' already exists`)
    this.name = 'AlreadyExistsException'
  }
}
