import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'

import { SharedModule } from '@shared/shared.module'

describe('InterfacesModule', () => {
  it('should compile and export RestModule', async () => {
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
    }).compile()

    expect(moduleRef).toBeDefined()
  })
})
