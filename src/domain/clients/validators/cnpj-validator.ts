import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

import { Cnpj } from '@domain/clients/value-objects'

/**
 * Custom decorator for CNPJ validation
 * @param validationOptions - class-validator options
 * @returns Property decorator
 */
export function isCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCnpj',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false
          return Cnpj.isValid(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid CNPJ`
        },
      },
    })
  }
}
