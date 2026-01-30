import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { StockItemResponseDto } from './stock-item-response.dto'

/**
 * Paginated response DTO for stock items
 */
export class PaginatedStockItemDto implements PaginatedResult<StockItemResponseDto> {
  @ApiProperty({
    description: 'Array of stock items for the current page',
    type: [StockItemResponseDto],
  })
  data: StockItemResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}
