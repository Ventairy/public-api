import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env['NODE_ENV'] as
    | 'development'
    | 'production'
    | 'test'
    | 'staging',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  apiPrefix: process.env['API_PREFIX'] ?? 'api',
  corsAllowedDomains: (process.env['CORS_ALLOWED_DOMAINS'] ?? '').split(','),
  swaggerEnabled: process.env['SWAGGER_ENABLED'] === 'true',
}));

export type AppConfig = ReturnType<typeof appConfig>;
