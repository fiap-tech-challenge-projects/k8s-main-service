import { ApiProperty } from '@nestjs/swagger'
import { ServiceOrderStatus } from '@prisma/client'

/**
 * DTO for service order response.
 */
export class ServiceOrderResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the service order',
    example: 'so-1704067200000-abc123def',
  })
  id: string

  @ApiProperty({
    description: 'Current status of the service order',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.REQUESTED,
  })
  status: ServiceOrderStatus

  @ApiProperty({
    description: 'Date when the service order was requested',
    example: '2024-01-01T10:00:00.000Z',
  })
  requestDate: Date

  @ApiProperty({
    description: 'Date when the service order was delivered',
    example: '2024-01-05T15:00:00.000Z',
    nullable: true,
  })
  deliveryDate?: Date

  @ApiProperty({
    description: 'Reason for cancellation if the service order was cancelled',
    example: 'Customer declined service due to cost concerns',
    nullable: true,
  })
  cancellationReason?: string

  @ApiProperty({
    description: 'Additional notes or special instructions for the service order',
    example:
      'Customer reported engine noise and reduced performance. Check for oil leaks and perform diagnostic scan.',
    nullable: true,
  })
  notes?: string

  @ApiProperty({
    description: 'ID of the client associated with the service order',
    example: 'client-1234567890-abc123def',
  })
  clientId: string

  @ApiProperty({
    description: 'ID of the vehicle associated with the service order',
    example: 'vehicle-4567890123-def456ghi',
  })
  vehicleId: string

  @ApiProperty({
    description: 'Timestamp when the service order was created',
    example: '2024-01-01T09:00:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Timestamp when the service order was last updated',
    example: '2024-01-01T10:30:00.000Z',
  })
  updatedAt: Date
}
