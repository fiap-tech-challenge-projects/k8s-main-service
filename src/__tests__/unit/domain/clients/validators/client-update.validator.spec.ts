import {
  ClientEmailAlreadyExistsException,
  ClientCpfCnpjAlreadyExistsException,
  ClientInvalidEmailException,
  ClientInvalidCpfCnpjException,
} from '@domain/clients/exceptions'
import { ClientUpdateValidator } from '@domain/clients/validators'
import { CpfCnpj } from '@domain/clients/value-objects'
import { Email } from '@shared/value-objects'

describe('ClientUpdateValidator', () => {
  it('allows update when email and cpfCnpj are available', async () => {
    await expect(
      ClientUpdateValidator.validateClientUpdate(
        'a@b.com',
        '52998224725',
        async () => false,
        async () => false,
        'c-1',
      ),
    ).resolves.toBeUndefined()
  })

  it('throws when email invalid', async () => {
    await expect(
      ClientUpdateValidator.validateClientUpdate(
        'invalid',
        undefined,
        async () => false,
        async () => false,
        'c-1',
      ),
    ).rejects.toBeInstanceOf(ClientInvalidEmailException)
  })

  it('throws when cpfCnpj invalid', async () => {
    await expect(
      ClientUpdateValidator.validateClientUpdate(
        undefined,
        'bad',
        async () => false,
        async () => false,
        'c-1',
      ),
    ).rejects.toBeInstanceOf(ClientInvalidCpfCnpjException)
  })

  it('throws when email exists', async () => {
    await expect(
      ClientUpdateValidator.validateClientUpdate(
        'a@b.com',
        undefined,
        async () => true,
        async () => false,
        'c-1',
      ),
    ).rejects.toBeInstanceOf(ClientEmailAlreadyExistsException)
  })

  it('throws when cpfCnpj exists', async () => {
    await expect(
      ClientUpdateValidator.validateClientUpdate(
        undefined,
        '52998224725',
        async () => false,
        async () => true,
        'c-1',
      ),
    ).rejects.toBeInstanceOf(ClientCpfCnpjAlreadyExistsException)
  })
  afterEach(() => jest.restoreAllMocks())

  it('validateClientUpdate throws on invalid email when provided', async () => {
    jest.spyOn(Email, 'create').mockImplementation(() => {
      throw new Error('bad')
    })

    await expect(
      ClientUpdateValidator.validateClientUpdate(
        'bad',
        undefined,
        async () => false,
        async () => false,
        'id',
      ),
    ).rejects.toBeInstanceOf(ClientInvalidEmailException)
  })

  it('validateClientUpdate throws on invalid cpfcnpj when provided', async () => {
    jest.spyOn(Email, 'create').mockImplementation(() => undefined as any)
    jest.spyOn(CpfCnpj, 'create').mockImplementation(() => {
      throw new Error('bad')
    })

    await expect(
      ClientUpdateValidator.validateClientUpdate(
        undefined,
        'bad',
        async () => false,
        async () => false,
        'id',
      ),
    ).rejects.toBeInstanceOf(ClientInvalidCpfCnpjException)
  })

  it('validateClientUpdate throws when availability checks indicate duplicates', async () => {
    jest.spyOn(Email, 'create').mockImplementation(() => undefined as any)
    jest.spyOn(CpfCnpj, 'create').mockImplementation(() => undefined as any)

    await expect(
      ClientUpdateValidator.validateClientUpdate(
        'a@b.com',
        undefined,
        async () => true,
        async () => false,
        'id',
      ),
    ).rejects.toBeInstanceOf(ClientEmailAlreadyExistsException)

    await expect(
      ClientUpdateValidator.validateClientUpdate(
        undefined,
        '123',
        async () => false,
        async () => true,
        'id',
      ),
    ).rejects.toBeInstanceOf(ClientCpfCnpjAlreadyExistsException)
  })
})
