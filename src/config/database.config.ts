import { registerAs } from '@nestjs/config'
import { Transform } from 'class-transformer'
import { IsString, IsOptional } from 'class-validator'

/**
 * Database configuration schema for validation.
 */
export class DatabaseConfigSchema {
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }: { value: string | undefined }) =>
      value ?? 'postgresql://postgres:postgres@localhost:5432/fiap-tech-challenge?schema=public',
  )
  DATABASE_URL: string

  @IsString()
  @IsOptional()
  @Transform(
    ({ value }: { value: string | undefined }) =>
      value ??
      'postgresql://postgres:postgres@localhost:5433/fiap-tech-challenge-test?schema=public',
  )
  TEST_DATABASE_URL: string
}

export default registerAs('database', () => ({
  databaseUrl:
    process.env.NODE_ENV === 'test'
      ? (process.env.TEST_DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5433/fiap-tech-challenge-test?schema=public')
      : (process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/fiap-tech-challenge?schema=public'),
}))
