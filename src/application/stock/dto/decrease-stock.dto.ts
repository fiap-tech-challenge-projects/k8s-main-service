import { Transform, Type } from 'class-transformer'
import { IsInt, IsString, Min, IsNotEmpty } from 'class-validator'

/**
 * DTO for decreasing stock
 */
export class DecreaseStockDto {
  /**
   * Quantity to decrease
   * @example 10
   */
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number

  /**
   * Reason for the decrease
   * @example "Used in service order SO-123"
   */
  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Reason cannot be empty' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  reason: string
}
