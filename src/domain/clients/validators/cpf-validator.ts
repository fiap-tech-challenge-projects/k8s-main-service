import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

import { Cpf } from '@domain/clients/value-objects'

/**
 * CPF validation decorator function
 * Usage: @IsCpf() or @IsCpf({ message: 'Custom message' })
 * @param validationOptions - Validation options for the decorator
 * @returns Property decorator function
 */
export function isCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false
          }
          return Cpf.isValid(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Brazilian CPF`
        },
      },
    })
  }
}
