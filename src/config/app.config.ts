import { registerAs } from '@nestjs/config'
import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional } from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

/**
 * Application configuration schema for validation.
 */
export class AppConfigSchema {
  @IsEnum(NodeEnv)
  @IsOptional()
  @Transform(({ value }: { value: NodeEnv | undefined }) => value ?? NodeEnv.Development)
  NODE_ENV: NodeEnv

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: { value: string | undefined }) => parseInt(value ?? '3000', 10))
  PORT: number
}

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
}))
