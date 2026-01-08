import { StockMovementType } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min, IsDateString } from 'class-validator'

/**
 * DTO for creating a stock movement
 */
export class CreateStockMovementDto {
  /**
   * Type of stock movement
   * @example "IN"
   */
  @IsEnum(StockMovementType)
  type: StockMovementType

  /**
   * Quantity to move
   * @example 10
   */
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number

  /**
   * Stock item ID
   * @example "stock-item-123"
   */
  @IsString()
  stockId: string

  /**
   * Reason for the movement
   * @example "Purchase order received"
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  reason?: string

  /**
   * Additional notes
   * @example "Items received from supplier XYZ"
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  notes?: string

  /**
   * Movement date (ISO string)
   * @example "2025-08-13T10:30:00.000Z"
   */
  @IsOptional()
  @IsDateString()
  movementDate?: string
}
