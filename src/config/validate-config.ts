import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

/**
 * Validates a configuration object against a class-validator schema.
 *
 * @param config - The configuration object to validate (from environment variables)
 * @param schema - The class constructor for the validation schema
 * @returns The validated and transformed config object
 * @throws Error if validation fails
 */
export function validateConfig<T extends object>(
  config: Record<string, unknown>,
  schema: new () => T,
): T {
  const validated = plainToInstance(schema, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
    excludeExtraneousValues: false,
  })
  const errors = validateSync(validated, { skipMissingProperties: false })
  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validated
}
