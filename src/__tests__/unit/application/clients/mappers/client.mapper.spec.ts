import { ClientFactory, ClientDtoFactory } from '@/__tests__/factories'
import { ClientMapper } from '@application/clients/mappers'

describe('ClientMapper', () => {
  describe('toResponseDto', () => {
    it('should map a client entity to response DTO correctly', () => {
      const client = ClientFactory.create({
        id: 'client-123',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        cpfCnpj: '12345678909',
        phone: '11999999999',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })

      const result = ClientMapper.toResponseDto(client)

      expect(result).toEqual({
        id: 'client-123',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        cpfCnpj: '123.456.789-09',
        phone: '+55 11 99999 9999',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      })
    })

    it('should map a minimal client entity to response DTO correctly', () => {
      const client = ClientFactory.createMinimal({
        id: 'client-456',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        cpfCnpj: '11144477735',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })

      const result = ClientMapper.toResponseDto(client)

      expect(result).toEqual({
        id: 'client-456',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        cpfCnpj: '111.444.777-35',
        phone: undefined,
        address: undefined,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })
    })

    it('should use normalized email from entity', () => {
      const client = ClientFactory.create({
        email: 'TEST@EXAMPLE.COM',
      })

      const result = ClientMapper.toResponseDto(client)

      expect(result.email).toBe('test@example.com')
    })

    it('should use formatted CPF/CNPJ from entity', () => {
      const clientWithCpf = ClientFactory.create({
        cpfCnpj: '12345678909',
      })
      const clientWithCnpj = ClientFactory.createWithCnpj({
        cpfCnpj: '11222333000181',
      })

      const cpfResult = ClientMapper.toResponseDto(clientWithCpf)
      const cnpjResult = ClientMapper.toResponseDto(clientWithCnpj)

      expect(cpfResult.cpfCnpj).toBe('123.456.789-09')
      expect(cnpjResult.cpfCnpj).toBe('11.222.333/0001-81')
    })
  })

  describe('toResponseDtoArray', () => {
    it('should map an array of client entities to response DTOs correctly', () => {
      const clients = [
        ClientFactory.create({ id: 'client-1', name: 'Client 1' }),
        ClientFactory.create({ id: 'client-2', name: 'Client 2' }),
        ClientFactory.create({ id: 'client-3', name: 'Client 3' }),
      ]

      const result = ClientMapper.toResponseDtoArray(clients)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('id', 'client-1')
      expect(result[0]).toHaveProperty('name', 'Client 1')
      expect(result[1]).toHaveProperty('id', 'client-2')
      expect(result[1]).toHaveProperty('name', 'Client 2')
      expect(result[2]).toHaveProperty('id', 'client-3')
      expect(result[2]).toHaveProperty('name', 'Client 3')
    })

    it('should return empty array when given empty array', () => {
      const result = ClientMapper.toResponseDtoArray([])

      expect(result).toEqual([])
    })

    it('should handle array with single client', () => {
      const clients = [ClientFactory.create({ id: 'single-client' })]

      const result = ClientMapper.toResponseDtoArray(clients)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('id', 'single-client')
    })
  })

  describe('fromCreateDto', () => {
    it('should create a client entity from create DTO correctly', () => {
      const createDto = ClientDtoFactory.createCreateClientDto({
        name: 'João Silva',
        email: 'joao.silva@email.com',
        cpfCnpj: '12345678909',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123 - São Paulo, SP',
      })

      const result = ClientMapper.fromCreateDto(createDto)

      expect(result.name).toBe('João Silva')
      expect(result.email.value).toBe('joao.silva@email.com')
      expect(result.cpfCnpj.value).toBe('12345678909')
      expect(result.phone).toBe('(11) 99999-9999')
      expect(result.address).toBe('Rua das Flores, 123 - São Paulo, SP')
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a minimal client entity from minimal create DTO', () => {
      const createDto = ClientDtoFactory.createMinimalCreateClientDto({
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        cpfCnpj: '11144477735',
      })

      const result = ClientMapper.fromCreateDto(createDto)

      expect(result.name).toBe('Maria Santos')
      expect(result.email.value).toBe('maria.santos@email.com')
      expect(result.cpfCnpj.value).toBe('11144477735')
      expect(result.phone).toBeUndefined()
      expect(result.address).toBeUndefined()
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should handle CNPJ in create DTO', () => {
      const createDto = ClientDtoFactory.createCreateClientDtoWithCnpj({
        name: 'Empresa XYZ LTDA',
        email: 'contato@empresaxyz.com.br',
        cpfCnpj: '11222333000181',
      })

      const result = ClientMapper.fromCreateDto(createDto)

      expect(result.name).toBe('Empresa XYZ LTDA')
      expect(result.email.value).toBe('contato@empresaxyz.com.br')
      expect(result.cpfCnpj.value).toBe('11222333000181')
      expect(result.cpfCnpj.isCnpj).toBe(true)
    })
  })

  describe('fromUpdateDto', () => {
    it('should update a client entity from update DTO correctly', () => {
      const existingClient = ClientFactory.create({
        id: 'client-123',
        name: 'Original Name',
        email: 'original@email.com',
        cpfCnpj: '12345678909',
        phone: '(11) 11111-1111',
        address: 'Original Address',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      })

      const updateDto = ClientDtoFactory.createUpdateClientDto({
        name: 'Updated Name',
        email: 'updated@email.com',
        phone: '(11) 99999-9999',
        address: 'Updated Address',
      })

      const result = ClientMapper.fromUpdateDto(updateDto, existingClient)

      expect(result.id).toBe('client-123')
      expect(result.name).toBe('Updated Name')
      expect(result.email.value).toBe('updated@email.com')
      expect(result.cpfCnpj.value).toBe('12345678909')
      expect(result.phone).toBe('(11) 99999-9999')
      expect(result.address).toBe('Updated Address')
      expect(result.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'))
      expect(result.updatedAt).not.toEqual(new Date('2024-01-01T00:00:00.000Z'))
    })

    it('should update only provided fields in update DTO', () => {
      const existingClient = ClientFactory.create({
        id: 'client-123',
        name: 'Original Name',
        email: 'original@email.com',
        cpfCnpj: '12345678909',
        phone: '(11) 11111-1111',
        address: 'Original Address',
      })

      const updateDto = ClientDtoFactory.createPartialUpdateClientDto({
        name: 'Partially Updated Name',
      })

      const result = ClientMapper.fromUpdateDto(updateDto, existingClient)

      expect(result.id).toBe('client-123')
      expect(result.name).toBe('Partially Updated Name')
      expect(result.email.value).toBe('original@email.com')
      expect(result.cpfCnpj.value).toBe('12345678909')
      expect(result.phone).toBe('(11) 11111-1111')
      expect(result.address).toBe('Original Address')
    })

    it('should preserve original values when update DTO has undefined fields', () => {
      const existingClient = ClientFactory.create({
        name: 'Original Name',
        email: 'original@email.com',
        phone: '(11) 11111-1111',
        address: 'Original Address',
      })

      const updateDto: any = {}

      const result = ClientMapper.fromUpdateDto(updateDto, existingClient)

      expect(result.name).toBe('Original Name')
      expect(result.email.value).toBe('original@email.com')
      expect(result.phone).toBe('(11) 11111-1111')
      expect(result.address).toBe('Original Address')
    })

    it('should not change CPF/CNPJ during update', () => {
      const existingClient = ClientFactory.create({
        cpfCnpj: '12345678909',
      })

      const updateDto = ClientDtoFactory.createUpdateClientDto({
        name: 'Updated Name',
      })

      const result = ClientMapper.fromUpdateDto(updateDto, existingClient)

      expect(result.cpfCnpj.value).toBe('12345678909')
    })
  })
})
