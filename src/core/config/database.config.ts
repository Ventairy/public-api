import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  cloudflareAccountId: process.env['CF_ACCOUNT_ID'] ?? '',
  databaseId: process.env['CF_D1_DATABASE_ID'] ?? '',
  apiToken: process.env['CF_D1_API_TOKEN'] ?? '',
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
