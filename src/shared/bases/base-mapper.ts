/**
 * Contract for application mappers
 * All application mappers must implement these static methods
 */
export interface BaseMapperContract<TEntity, TResponseDto, TCreateDto, TUpdateDto> {
  /**
   * Maps a domain entity to a response DTO
   * @param entity - Domain entity
   * @returns Response DTO
   */
  toResponseDto(entity: TEntity): TResponseDto
  /**
   * Maps an array of domain entities to an array of response DTOs
   * @param entities - Array of domain entities
   * @returns Array of response DTOs
   */
  toResponseDtoArray(entities: TEntity[]): TResponseDto[]
  /**
   * Maps a create DTO to a domain entity
   * @param dto - Create DTO
   * @returns Domain entity
   */
  fromCreateDto(dto: TCreateDto): TEntity
  /**
   * Maps an update DTO to an updated domain entity
   * @param dto - Update DTO
   * @param existing - Existing domain entity
   * @returns Updated domain entity
   */
  fromUpdateDto(dto: TUpdateDto, existing: TEntity): TEntity
}

/**
 * Validates that a mapper class implements the required static methods
 * @param mapperClass - The class to validate
 * @param className - Name of the class for error messages
 * @throws {Error} If the class doesn't implement the required methods
 */
export function validateBaseMapper<TEntity, TResponseDto, TCreateDto, TUpdateDto>(
  mapperClass: unknown,
  className: string,
): asserts mapperClass is typeof mapperClass &
  BaseMapperContract<TEntity, TResponseDto, TCreateDto, TUpdateDto> {
  if (typeof mapperClass !== 'function') {
    throw new Error(`${className} must be a class`)
  }

  const requiredMethods = ['toResponseDto', 'toResponseDtoArray', 'fromCreateDto', 'fromUpdateDto']
  const missingMethods = requiredMethods.filter(
    (method) => typeof (mapperClass as unknown as Record<string, unknown>)[method] !== 'function',
  )

  if (missingMethods.length > 0) {
    throw new Error(
      `${className} must implement the following static methods: ${missingMethods.join(', ')}`,
    )
  }
}
