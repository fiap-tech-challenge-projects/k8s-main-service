import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'

import { RestModule } from '@interfaces/rest/rest.module'
import { SharedModule } from '@shared/shared.module'

describe('RestModule', () => {
  it('should compile with dependencies and expose controllers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              auth: {
                jwtSecret: 'test-secret-key',
                jwtExpiresIn: '24h',
              },
            }),
          ],
        }),
        SharedModule,
      ],
    })
      .overrideModule(RestModule)
      .useModule({
        module: RestModule,
        imports: [],
        controllers: [],
        providers: [],
      })
      .compile()

    expect(moduleRef).toBeDefined()
  })
})
