import { DomainException } from './domain-exception'

/**
 * Exception thrown when an entity is not found
 */
export class EntityNotFoundException extends DomainException {
  /**
   * Constructor for entity not found exception
   * @param entityName - Name of the entity that was not found
   * @param id - ID of the entity that was not found
   */
  constructor(entityName: string, id: string) {
    super(`${entityName} with id '${id}' not found`, 'EntityNotFoundException')
  }
}
