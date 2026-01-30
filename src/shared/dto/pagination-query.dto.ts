import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsInt, Min, Max } from 'class-validator'

/**
 * DTO for pagination query parameters
 * Provides consistent pagination parameters across all controllers
 */
export class PaginationQueryDto {
  /**
   * Page number (1-based)
   * @example 1
   */
  @ApiPropertyOptional({
    description: 'Page number (1-based, default: 1)',
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1

  /**
   * Items per page
   * @example 10
   */
  @ApiPropertyOptional({
    description: 'Items per page (default: 10, max: 100)',
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10
}
