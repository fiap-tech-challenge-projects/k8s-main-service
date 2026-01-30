import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

import { IsValidPrice } from '@shared/validators'

/**
 * UpdateStockItemDto class for updating stock item details
 * This DTO is used to encapsulate the data required to update a stock item.
 */
export class UpdateStockItemDto {
  @ApiPropertyOptional({
    description: 'Nome da peça ou insumo',
    example: 'Filtro de óleo',
    minLength: 2,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string

  @ApiPropertyOptional({
    description: 'Quantidade atual em estoque',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  currentStock?: number

  @ApiPropertyOptional({
    description: 'Quantidade mínima em estoque antes de repor',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minStockLevel?: number

  @ApiPropertyOptional({
    description:
      'Custo unitário da peça ou insumo (aceita múltiplos formatos: R$100.00, 10000, 100.00, 100,00, R$100,00)',
    example: '25.50',
    required: false,
  })
  @IsOptional()
  @IsValidPrice()
  unitCost?: string

  @ApiPropertyOptional({
    description:
      'Preço de venda unitário da peça ou insumo (aceita múltiplos formatos: R$100.00, 10000, 100.00, 100,00, R$100,00)',
    example: '45.00',
    required: false,
  })
  @IsOptional()
  @IsValidPrice()
  unitSalePrice?: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da peça ou insumo',
    example: 'Filtro de óleo para motor 1.6, compatível com linha Ford e Volkswagen.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: 'Fornecedor da peça ou insumo',
    example: 'Auto Peças Brasil LTDA',
    required: false,
  })
  @IsOptional()
  @IsString()
  supplier?: string
}
