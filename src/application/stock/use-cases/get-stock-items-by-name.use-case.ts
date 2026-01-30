import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedStockItemDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting stock items by name
 * Handles the orchestration for stock item search by name business process
 */
@Injectable()
export class GetStockItemsByNameUseCase {
  private readonly logger = new Logger(GetStockItemsByNameUseCase.name)

  /**
   * Constructor for GetStockItemsByNameUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute get stock items by name
   * @param name - Stock item name
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns Result with paginated stock items response DTO or error
   */
  async execute(
    name: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedStockItemDto, Error>> {
    this.logger.log('Executing get stock items by name use case', {
      name,
      page,
      limit,
      context: 'GetStockItemsByNameUseCase.execute',
    })

    try {
      const paginatedResult = await this.stockRepository.findByName(name, page, limit)

      const stockItems = paginatedResult.data.map((stockItem) =>
        StockItemMapper.toResponseDto(stockItem),
      )

      const responseDto: PaginatedStockItemDto = {
        data: stockItems,
        meta: paginatedResult.meta,
      }

      this.logger.log('Get stock items by name use case completed successfully', {
        name,
        totalItems: responseDto.meta.total,
        pageSize: responseDto.data.length,
        currentPage: responseDto.meta.page,
        context: 'GetStockItemsByNameUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Get stock items by name use case failed', {
        name,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'GetStockItemsByNameUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
