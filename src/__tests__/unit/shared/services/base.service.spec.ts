import { Logger } from '@nestjs/common'

import { BaseService } from '@shared/services/base.service'

interface Entity {
  id: string
  createdAt: Date
  updatedAt: Date
  name?: string
}

class RepoMock {
  findById = jest.fn()
  findAll = jest.fn()
  create = jest.fn()
  update = jest.fn()
  delete = jest.fn()
}

class TestService extends BaseService<Entity> {
  public getById(id: string) {
    return this.getEntityById(id)
  }
  public getAll(page?: number, limit?: number) {
    return this.getAllEntities(page, limit)
  }
  public create(data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.createEntity(data)
  }
  public update(id: string, data: Partial<Omit<Entity, 'id' | 'createdAt'>>) {
    return this.updateEntity(id, data)
  }
  public remove(id: string) {
    return this.deleteEntity(id)
  }
  public paginate(page?: number, limit?: number) {
    return this.getPaginatedResult(page, limit)
  }
}

describe('BaseService', () => {
  let repo: RepoMock
  let svc: TestService

  beforeEach(() => {
    repo = new RepoMock()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    svc = new TestService(repo as any, 'TestService')
  })

  afterEach(() => jest.clearAllMocks())

  it('getEntityById success', async () => {
    const entity: Entity = { id: '1', createdAt: new Date(), updatedAt: new Date() }
    repo.findById.mockResolvedValue(entity)
    await expect(svc.getById('1')).resolves.toBe(entity)
  })

  it('getEntityById error propagates', async () => {
    repo.findById.mockRejectedValue(new Error('x'))
    await expect(svc.getById('1')).rejects.toThrow('x')
  })

  it('getAllEntities returns data', async () => {
    const data = [{ id: '1', createdAt: new Date(), updatedAt: new Date() }]
    repo.findAll.mockResolvedValue({
      data,
      meta: { page: 1, limit: 1, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    })
    await expect(svc.getAll()).resolves.toEqual(data)
  })

  it('createEntity passes through', async () => {
    const e: Entity = { id: '1', createdAt: new Date(), updatedAt: new Date(), name: 'a' }
    repo.create.mockResolvedValue(e)
    await expect(svc.create({ name: 'a' })).resolves.toBe(e)
  })

  it('updateEntity passes through', async () => {
    const e: Entity = { id: '1', createdAt: new Date(), updatedAt: new Date(), name: 'b' }
    repo.update.mockResolvedValue(e)
    await expect(svc.update('1', { name: 'b' })).resolves.toBe(e)
  })

  it('deleteEntity returns boolean', async () => {
    repo.delete.mockResolvedValue(true)
    await expect(svc.remove('1')).resolves.toBe(true)
  })

  it('getPaginatedResult passes through', async () => {
    const result = {
      data: [],
      meta: { page: 1, limit: 1, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    }
    repo.findAll.mockResolvedValue(result)
    await expect(svc.paginate(1, 1)).resolves.toBe(result)
  })
})
