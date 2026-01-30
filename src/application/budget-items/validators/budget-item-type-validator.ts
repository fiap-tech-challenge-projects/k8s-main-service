import { BudgetItemType } from '@prisma/client'
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

/**
 * Custom validator to ensure budget item type consistency
 * - SERVICE type must have serviceId and no stockItemId
 * - STOCK_ITEM type must have stockItemId and no serviceId
 * - Only one of serviceId or stockItemId can be provided
 * @param validationOptions - Optional validation options
 * @returns A property decorator function
 */
export function isValidBudgetItemType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBudgetItemType',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>
          const type = obj.type as BudgetItemType
          const serviceId = obj.serviceId as string | undefined
          const stockItemId = obj.stockItemId as string | undefined

          if (!type) {
            return false
          }

          if (serviceId && stockItemId) {
            return false
          }

          if (type === BudgetItemType.SERVICE) {
            return !!serviceId && !stockItemId
          }

          if (type === BudgetItemType.STOCK_ITEM) {
            return !!stockItemId && !serviceId
          }

          return false
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>
          const type = obj.type as BudgetItemType
          const serviceId = obj.serviceId as string | undefined
          const stockItemId = obj.stockItemId as string | undefined

          if (serviceId && stockItemId) {
            return 'Cannot provide both serviceId and stockItemId. Only one is allowed.'
          }

          if (type === BudgetItemType.SERVICE) {
            if (!serviceId) {
              return 'SERVICE type must have a serviceId'
            }
            if (stockItemId) {
              return 'SERVICE type cannot have stockItemId'
            }
          }

          if (type === BudgetItemType.STOCK_ITEM) {
            if (!stockItemId) {
              return 'STOCK_ITEM type must have a stockItemId'
            }
            if (serviceId) {
              return 'STOCK_ITEM type cannot have serviceId'
            }
          }

          return 'Invalid budget item type configuration'
        },
      },
    })
  }
}
