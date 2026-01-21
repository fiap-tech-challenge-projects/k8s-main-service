import { ConfigModule } from '@nestjs/config'

import appConfig, { AppConfigSchema } from './app.config'
import authConfig from './auth.config'
import databaseConfig, { DatabaseConfigSchema } from './database.config'
import metricsConfig, { MetricsConfigSchema } from './metrics.config'
import { validateConfig } from './validate-config'

export default [appConfig, databaseConfig, metricsConfig, authConfig]

export const CONFIG_MODULE = ConfigModule.forRoot({
  isGlobal: true,
  load: [appConfig, databaseConfig, metricsConfig, authConfig],
  envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
  validate: (config) => {
    validateConfig(config, AppConfigSchema)
    validateConfig(config, DatabaseConfigSchema)
    validateConfig(config, MetricsConfigSchema)
    return config
  },
})
