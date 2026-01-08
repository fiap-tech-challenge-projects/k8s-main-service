import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BudgetStatus, DeliveryMethod } from '@prisma/client'

/**
 * Data Transfer Object for budget responses
 */
export class BudgetResponseDto {
  @ApiProperty({ description: 'Budget unique identifier', example: 'bud_123456' })
  id: string

  @ApiProperty({ description: 'Budget status', example: 'APPROVED' })
  status: BudgetStatus

  @ApiProperty({ description: 'Total amount of the budget', example: 'R$1.200,50' })
  totalAmount: string

  @ApiProperty({ description: 'Validity period in days', example: 7 })
  validityPeriod: number

  @ApiProperty({
    description: 'Date when the budget was generated',
    example: '2024-08-03T10:00:00.000Z',
  })
  generationDate: Date

  @ApiPropertyOptional({ description: 'Date when the budget was sent to the client' })
  sentDate?: Date

  @ApiPropertyOptional({ description: 'Date when the budget was approved' })
  approvalDate?: Date

  @ApiPropertyOptional({ description: 'Date when the budget was rejected' })
  rejectionDate?: Date

  @ApiPropertyOptional({
    description: 'Delivery method for the budget',
    enum: DeliveryMethod,
    example: DeliveryMethod.EMAIL,
  })
  deliveryMethod?: DeliveryMethod

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string

  @ApiProperty({ description: 'Service Order ID', example: 'os_123456' })
  serviceOrderId: string

  @ApiProperty({ description: 'Client ID', example: 'cl_123456' })
  clientId: string

  @ApiProperty({ description: 'Creation date', example: '2024-08-03T10:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ description: 'Last update date', example: '2024-08-03T10:00:00.000Z' })
  updatedAt: Date
}
