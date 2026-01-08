import {
  ClientEmailAlreadyExistsException,
  ClientCpfCnpjAlreadyExistsException,
  ClientInvalidEmailException,
  ClientInvalidCpfCnpjException,
} from '@domain/clients/exceptions'
import { ClientCreationValidator } from '@domain/clients/validators'
import { CpfCnpj } from '@domain/clients/value-objects'
import { Email } from '@shared'

describe('ClientCreationValidator', () => {
  afterEach(() => jest.restoreAllMocks())

  describe('availability helpers', () => {
    it('isEmailAvailable returns true when false passed', () => {
      expect(ClientCreationValidator.isEmailAvailable(false)).toBe(true)
      expect(ClientCreationValidator.isEmailAvailable(true)).toBe(false)
    })

    it('isCpfCnpjAvailable returns true when false passed', () => {
      expect(ClientCreationValidator.isCpfCnpjAvailable(false)).toBe(true)
      expect(ClientCreationValidator.isCpfCnpjAvailable(true)).toBe(false)
    })

    it('canCreateClient combines both', () => {
      expect(ClientCreationValidator.canCreateClient(false, false)).toBe(true)
      expect(ClientCreationValidator.canCreateClient(true, false)).toBe(false)
    })
  })

  describe('validateClientCreation', () => {
    const validEmail = 'test@example.com'
    // use a known-valid CPF for tests
    const validCpf = '52998224725'

    it('throws invalid email when Email.create fails', async () => {
      jest.spyOn(Email, 'create').mockImplementation(() => {
        throw new Error('bad')
      })

      await expect(
        ClientCreationValidator.validateClientCreation(
          'not-an-email',
          validCpf,
          async () => false,
          async () => false,
        ),
      ).rejects.toBeInstanceOf(ClientInvalidEmailException)
    })

    it('throws invalid cpf/cnpj when CpfCnpj.create fails', async () => {
      jest.spyOn(Email, 'create').mockImplementation(() => undefined as any)
      jest.spyOn(CpfCnpj, 'create').mockImplementation(() => {
        throw new Error('bad')
      })

      await expect(
        ClientCreationValidator.validateClientCreation(
          validEmail,
          'badcpf',
          async () => false,
          async () => false,
        ),
      ).rejects.toBeInstanceOf(ClientInvalidCpfCnpjException)
    })

    it('throws when email exists', async () => {
      jest.spyOn(Email, 'create').mockImplementation(() => undefined as any)
      jest.spyOn(CpfCnpj, 'create').mockImplementation(() => undefined as any)

      await expect(
        ClientCreationValidator.validateClientCreation(
          validEmail,
          validCpf,
          async () => true,
          async () => false,
        ),
      ).rejects.toBeInstanceOf(ClientEmailAlreadyExistsException)
    })

    it('throws when cpf/cnpj exists', async () => {
      jest.spyOn(Email, 'create').mockImplementation(() => undefined as any)
      jest.spyOn(CpfCnpj, 'create').mockImplementation(() => undefined as any)

      await expect(
        ClientCreationValidator.validateClientCreation(
          validEmail,
          validCpf,
          async () => false,
          async () => true,
        ),
      ).rejects.toBeInstanceOf(ClientCpfCnpjAlreadyExistsException)
    })

    it('resolves when everything is valid', async () => {
      await expect(
        ClientCreationValidator.validateClientCreation(
          validEmail,
          validCpf,
          async () => false,
          async () => false,
        ),
      ).resolves.toBeUndefined()
    })
  })
})
