import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedStockItemDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting all stock items with pagination
 * Handles the orchestration for stock item listing business process
 */
@Injectable()
export class GetAllStockItemsUseCase {
  private readonly logger = new Logger(GetAllStockItemsUseCase.name)

  /**
   * Constructor for GetAllStockItemsUseCase
   * @param stockRepository - Stock repository for data access
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute get all stock items
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns Result with paginated stock items response DTO or error
   */
  async execute(page?: number, limit?: number): Promise<Result<PaginatedStockItemDto, Error>> {
    try {
      this.logger.log('Executing get all stock items use case', {
        page,
        limit,
        context: 'GetAllStockItemsUseCase.execute',
      })

      const paginatedResult = await this.stockRepository.findAll(page, limit)

      const stockItems = paginatedResult.data.map((stockItem) =>
        StockItemMapper.toResponseDto(stockItem),
      )

      const responseDto: PaginatedStockItemDto = {
        data: stockItems,
        meta: paginatedResult.meta,
      }

      this.logger.log('Get all stock items use case completed successfully', {
        totalItems: responseDto.meta.total,
        pageSize: responseDto.data.length,
        currentPage: responseDto.meta.page,
        context: 'GetAllStockItemsUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error in get all stock items use case', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetAllStockItemsUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
