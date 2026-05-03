import { registerAs } from '@nestjs/config';

export const unkeyConfig = registerAs('unkey', () => ({
  apiId: process.env['UNKEY_API_ID'] ?? '',
  rootKey: process.env['UNKEY_ROOT_KEY'] ?? '',
}));

export type UnkeyConfig = ReturnType<typeof unkeyConfig>;
