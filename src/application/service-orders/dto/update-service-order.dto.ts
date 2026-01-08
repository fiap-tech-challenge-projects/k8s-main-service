import { ApiPropertyOptional } from '@nestjs/swagger'
import { ServiceOrderStatus } from '@prisma/client'
import { IsOptional, IsString, IsEnum, MaxLength, IsDateString } from 'class-validator'

/**
 * DTO for updating an existing service order.
 */
export class UpdateServiceOrderDto {
  @ApiPropertyOptional({
    description: 'New status for the service order',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.IN_DIAGNOSIS,
  })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus

  @ApiPropertyOptional({
    description: 'Date when the service order was delivered',
    example: '2024-01-05T15:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string

  @ApiPropertyOptional({
    description: 'Reason for cancellation if the service order is being cancelled',
    example: 'Customer declined service due to cost concerns',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string

  @ApiPropertyOptional({
    description: 'Additional notes or special instructions for the service order',
    example:
      'Diagnostic scan completed. Found oil leak in valve cover gasket. Parts ordered and scheduled for replacement.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}
