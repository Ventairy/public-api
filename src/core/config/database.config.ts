import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG_KEY = 'database';

export const databaseConfig = registerAs(DATABASE_CONFIG_KEY, () => ({
  cloudflareAccountId: process.env['CF_ACCOUNT_ID'] ?? '',
  databaseId: process.env['CF_D1_DATABASE_ID'] ?? '',
  apiToken: process.env['CF_D1_API_TOKEN'] ?? '',
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;