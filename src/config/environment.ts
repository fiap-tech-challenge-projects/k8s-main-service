import { plainToInstance } from 'class-transformer'
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Environment variables validation class
 * Validates and transforms environment variables on application startup
 */
class EnvironmentVariables {
  /**
   * Node environment
   */
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development

  /**
   * Application port
   */
  @IsNumber()
  PORT: number = 3000

  /**
   * Log level (debug, info, warn, error)
   */
  @IsString()
  LOG_LEVEL: string = 'debug'

  /**
   * Service name identifier
   */
  @IsString()
  SERVICE_NAME: string = 'k8s-main-service'

  /**
   * Service version
   */
  @IsString()
  SERVICE_VERSION: string = '0.0.1'

  /**
   * Health check endpoints enabled flag
   */
  @IsString()
  HEALTH_CHECK_ENABLED: string = 'true'

  /**
   * Readiness check enabled flag
   */
  @IsString()
  READY_CHECK_ENABLED: string = 'true'

  /**
   * Rate limiting enabled flag
   */
  @IsString()
  RATE_LIMIT_ENABLED: string = 'true'

  /**
   * Rate limit window in milliseconds
   */
  @IsNumber()
  RATE_LIMIT_WINDOW_MS: number = 900000

  /**
   * Rate limit maximum requests per window
   */
  @IsNumber()
  RATE_LIMIT_MAX_REQUESTS: number = 100

  /**
   * Swagger API documentation enabled flag
   */
  @IsString()
  SWAGGER_ENABLED: string = 'false'

  /**
   * Swagger API documentation path
   */
  @IsString()
  SWAGGER_PATH: string = '/api/docs'
}

/**
 * Validates environment variables on application startup
 * @returns Validated environment variables object
 * @throws Error if validation fails
 */
export function validateConfig(): EnvironmentVariables {
  const config = plainToInstance(EnvironmentVariables, process.env, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(config, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.toString()}`)
  }

  return config
}

export { EnvironmentVariables, Environment }
