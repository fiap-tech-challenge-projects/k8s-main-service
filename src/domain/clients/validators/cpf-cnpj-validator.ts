import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

import { CpfCnpj } from '@domain/clients/value-objects'

/**
 * CPF/CNPJ validation decorator function
 * Usage: @IsCpfCnpj() or @IsCpfCnpj({ message: 'Custom message' })
 * @param validationOptions - Validation options for the decorator
 * @returns Property decorator function
 */
export function isCpfCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpfCnpj',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false
          return CpfCnpj.isValid(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Brazilian CPF or CNPJ`
        },
      },
    })
  }
}
