/**
 * Contract for Prisma mappers
 * All Prisma mappers must implement these static methods
 */
export interface BasePrismaMapperContract<
  TEntity,
  TPrismaModel,
  TPrismaCreateInput,
  TPrismaUpdateInput,
> {
  /**
   * Converts a Prisma model to a domain entity
   * @param prismaModel - The Prisma model from the database
   * @returns Domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  toDomain(prismaModel: TPrismaModel): TEntity
  /**
   * Converts multiple Prisma models to domain entities
   * @param prismaModels - Array of Prisma models
   * @returns Array of domain entities
   */
  toDomainMany(prismaModels: TPrismaModel[]): TEntity[]
  /**
   * Converts a domain entity to a Prisma create input
   * @param entity - The domain entity to convert
   * @returns Prisma create input
   * @throws {Error} If the domain entity is null or undefined
   */
  toPrismaCreate(entity: TEntity): TPrismaCreateInput
  /**
   * Converts a domain entity to a Prisma update input
   * @param entity - The domain entity to convert
   * @returns Prisma update input
   * @throws {Error} If the domain entity is null or undefined
   */
  toPrismaUpdate(entity: TEntity): TPrismaUpdateInput
}

/**
 * Validates that a Prisma mapper class implements the required static methods
 * @param mapperClass - The class to validate
 * @param className - Name of the class for error messages
 * @throws {Error} If the class doesn't implement the required methods
 */
export function validateBasePrismaMapper<
  TEntity,
  TPrismaModel,
  TPrismaCreateInput,
  TPrismaUpdateInput,
>(
  mapperClass: unknown,
  className: string,
): asserts mapperClass is typeof mapperClass &
  BasePrismaMapperContract<TEntity, TPrismaModel, TPrismaCreateInput, TPrismaUpdateInput> {
  if (typeof mapperClass !== 'function') {
    throw new Error(`${className} must be a class`)
  }

  const requiredMethods = ['toDomain', 'toDomainMany', 'toPrismaCreate', 'toPrismaUpdate']
  const missingMethods = requiredMethods.filter(
    (method) => typeof (mapperClass as unknown as Record<string, unknown>)[method] !== 'function',
  )

  if (missingMethods.length > 0) {
    throw new Error(
      `${className} must implement the following static methods: ${missingMethods.join(', ')}`,
    )
  }
}
