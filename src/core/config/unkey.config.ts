import { registerAs } from '@nestjs/config';

export const UNKEY_CONFIG_KEY = 'unkey';

export const unkeyConfig = registerAs(UNKEY_CONFIG_KEY, () => ({
  apiId: process.env['UNKEY_API_ID'] ?? '',
  rootKey: process.env['UNKEY_ROOT_KEY'] ?? '',
}));

export type UnkeyConfig = ReturnType<typeof unkeyConfig>;